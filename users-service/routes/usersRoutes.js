const express = require('express');
const router = express.Router();

const User = require('../models/User');

const isValidDate = (dateValue) => {
  const date = new Date(dateValue);
  return !Number.isNaN(date.getTime());
};

router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      id: 'GET_USERS_ERROR',
      message: error.message
    });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        id: 'INVALID_USER_ID',
        message: 'id must be a number'
      });
    }

    const user = await User.findOne({
      id: userId
    });

    if (!user) {
      return res.status(404).json({
        id: 'USER_NOT_FOUND',
        message: 'user not found'
      });
    }

    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
      id: user.id,
      total: user.total
    });
  } catch (error) {
    res.status(500).json({
      id: 'GET_USER_ERROR',
      message: error.message
    });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { id, first_name, last_name, birthday } = req.body;

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

    if (!first_name) {
      return res.status(400).json({
        id: 'FIRST_NAME_REQUIRED',
        message: 'first_name is required'
      });
    }

    if (!last_name) {
      return res.status(400).json({
        id: 'LAST_NAME_REQUIRED',
        message: 'last_name is required'
      });
    }

    if (!birthday) {
      return res.status(400).json({
        id: 'BIRTHDAY_REQUIRED',
        message: 'birthday is required'
      });
    }

    if (!isValidDate(birthday)) {
      return res.status(400).json({
        id: 'INVALID_BIRTHDAY',
        message: 'birthday must be a valid date'
      });
    }

    const existingUser = await User.findOne({
      id: Number(id)
    });

    if (existingUser) {
      return res.status(400).json({
        id: 'USER_EXISTS',
        message: 'user already exists'
      });
    }

    const user = await User.create({
      id: Number(id),
      first_name,
      last_name,
      birthday,
      total: 0
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      id: 'ADD_USER_ERROR',
      message: error.message
    });
  }
});

module.exports = router;