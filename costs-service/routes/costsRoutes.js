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

const isValidDate = (dateValue) => {
  const date = new Date(dateValue);
  return !Number.isNaN(date.getTime());
};

router.post('/add', async (req, res) => {
  try {
    const { description, category, userid, sum, created_at } = req.body;

    if (!description) {
      return res.status(400).json({
        id: 'DESCRIPTION_REQUIRED',
        message: 'description is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        id: 'CATEGORY_REQUIRED',
        message: 'category is required'
      });
    }

    if (!categories.includes(category)) {
      return res.status(400).json({
        id: 'INVALID_CATEGORY',
        message: 'category must be one of: food, health, housing, sports, education'
      });
    }

    if (userid === undefined || userid === null || userid === '') {
      return res.status(400).json({
        id: 'USERID_REQUIRED',
        message: 'userid is required'
      });
    }

    if (Number.isNaN(Number(userid))) {
      return res.status(400).json({
        id: 'INVALID_USERID',
        message: 'userid must be a number'
      });
    }

    if (sum === undefined || sum === null || sum === '') {
      return res.status(400).json({
        id: 'SUM_REQUIRED',
        message: 'sum is required'
      });
    }

    if (Number.isNaN(Number(sum))) {
      return res.status(400).json({
        id: 'INVALID_SUM',
        message: 'sum must be a number'
      });
    }

    if (Number(sum) < 0) {
      return res.status(400).json({
        id: 'NEGATIVE_COST',
        message: 'cost cannot be negative number'
      });
    }

    if (Number(sum) === 0) {
      return res.status(400).json({
        id: 'ZERO_COST',
        message: 'cost must be greater than zero'
      });
    }

    if (created_at && !isValidDate(created_at)) {
      return res.status(400).json({
        id: 'INVALID_DATE',
        message: 'created_at must be a valid date'
      });
    }

    const user = await User.findOne({
      id: Number(userid)
    });

    if (!user) {
      return res.status(404).json({
        id: 'USER_NOT_FOUND',
        message: 'user not found'
      });
    }

    const costDate = created_at ? new Date(created_at) : new Date();

    if (isPastDate(costDate)) {
      return res.status(400).json({
        id: 'PAST_DATE_NOT_ALLOWED',
        message: 'date cannot be in the past'
      });
    }

    const cost = await Cost.create({
      description,
      category,
      userid: Number(userid),
      sum: Number(sum),
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
    const { id, year, month } = req.query;

    if (id === undefined || id === null || id === '') {
      return res.status(400).json({
        id: 'ID_REQUIRED',
        message: 'id is required'
      });
    }

    if (Number.isNaN(Number(id))) {
      return res.status(400).json({
        id: 'INVALID_ID',
        message: 'id must be a number'
      });
    }

    if (year === undefined || year === null || year === '') {
      return res.status(400).json({
        id: 'YEAR_REQUIRED',
        message: 'year is required'
      });
    }

    if (Number.isNaN(Number(year))) {
      return res.status(400).json({
        id: 'INVALID_YEAR',
        message: 'year must be a number'
      });
    }

    if (month === undefined || month === null || month === '') {
      return res.status(400).json({
        id: 'MONTH_REQUIRED',
        message: 'month is required'
      });
    }

    if (Number.isNaN(Number(month))) {
      return res.status(400).json({
        id: 'INVALID_MONTH',
        message: 'month must be a number'
      });
    }

    const userid = Number(id);
    const reportYear = Number(year);
    const reportMonth = Number(month);

    if (reportMonth < 1 || reportMonth > 12) {
      return res.status(400).json({
        id: 'INVALID_MONTH_RANGE',
        message: 'month must be between 1 and 12'
      });
    }

    const user = await User.findOne({
      id: userid
    });

    if (!user) {
      return res.status(404).json({
        id: 'USER_NOT_FOUND',
        message: 'user not found'
      });
    }

    const existingReport = await Report.findOne({
      userid,
      year: reportYear,
      month: reportMonth
    });

    if (existingReport) {
      return res.json({
        userid,
        year: reportYear,
        month: reportMonth,
        costs: existingReport.costs
      });
    }

    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 1);

    const costs = await Cost.find({
      userid,
      created_at: {
        $gte: startDate,
        $lt: endDate
      }
    });

    const reportCosts = buildReport(costs);

    if (isPastMonth(reportYear, reportMonth)) {
      try {
        await Report.create({
          userid,
          year: reportYear,
          month: reportMonth,
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
      year: reportYear,
      month: reportMonth,
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