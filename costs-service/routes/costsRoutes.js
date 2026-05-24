const express = require('express');
const router = express.Router();

const Cost = require('../models/Cost');
const User = require('../models/User');
const Report = require('../models/Report');

const categories = ['food', 'health', 'housing', 'sports', 'education'];

const buildEmptyReport = () => {
  return categories.map((category) => ({
    [category]: []
  }));
};

const buildReport = (costs) => {
  const reportCosts = buildEmptyReport();

  costs.forEach((cost) => {
    const categoryIndex = categories.indexOf(cost.category);

    if (categoryIndex !== -1) {
      reportCosts[categoryIndex][cost.category].push({
        sum: cost.sum,
        description: cost.description,
        day: new Date(cost.created_at).getDate()
      });
    }
  });

  return reportCosts;
};

const isPastMonth = (year, month) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return year < currentYear || (year === currentYear && month < currentMonth);
};

const isPastDate = (date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return date < today;
};

router.post('/add', async (req, res) => {
  try {
    const { description, category, userid, sum, created_at } = req.body;

    if (!description || !category || !userid || !sum) {
      return res.status(400).json({
        id: 'MISSING_FIELDS',
        message: 'description, category, userid and sum are required'
      });
    }

    if (!categories.includes(category)) {
      return res.status(400).json({
        id: 'INVALID_CATEGORY',
        message: 'Category must be one of: food, health, housing, sports, education'
      });
    }

    const user = await User.findOne({
      id: Number(userid)
    });

    if (!user) {
      return res.status(404).json({
        id: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    const costDate = created_at ? new Date(created_at) : new Date();

    if (isPastDate(costDate)) {
      return res.status(400).json({
        id: 'PAST_DATE_NOT_ALLOWED',
        message: 'Adding costs with dates that belong to the past is not allowed'
      });
    }

    const cost = await Cost.create({
      description,
      category,
      userid,
      sum,
      created_at: costDate
    });

    user.total += Number(sum);
    await user.save();

    res.status(201).json(cost);
  } catch (error) {
    res.status(500).json({
      id: 'ADD_COST_ERROR',
      message: error.message
    });
  }
});

router.get('/report', async (req, res) => {
  try {
    const userid = Number(req.query.id);
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!userid || !year || !month) {
      return res.status(400).json({
        id: 'MISSING_QUERY_PARAMS',
        message: 'id, year and month are required'
      });
    }

    const existingReport = await Report.findOne({
      userid,
      year,
      month
    });

    if (existingReport) {
      return res.json({
        userid,
        year,
        month,
        costs: existingReport.costs
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const costs = await Cost.find({
      userid,
      created_at: {
        $gte: startDate,
        $lt: endDate
      }
    });

    const reportCosts = buildReport(costs);

    if (isPastMonth(year, month)) {
      try {
        await Report.create({
          userid,
          year,
          month,
          costs: reportCosts
        });
      } catch (error) {
        if (error.code !== 11000) {
          throw error;
        }
      }
    }

    res.json({
      userid,
      year,
      month,
      costs: reportCosts
    });
  } catch (error) {
    res.status(500).json({
      id: 'GET_REPORT_ERROR',
      message: error.message
    });
  }
});

module.exports = router;