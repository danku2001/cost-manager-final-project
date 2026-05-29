const express = require('express');
const router = express.Router();

const User = require('../models/User');

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
    const user = await User.findOne({
      id: Number(req.params.id)
    });

    if (!user) {
      return res.status(404).json({
        id: 'USER_NOT_FOUND',
        message: 'User not found'
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
    const existingUser = await User.findOne({
      id: Number(req.body.id)
    });

    if (existingUser) {
      return res.status(400).json({
        id: 'USER_EXISTS',
        message: 'User already exists'
      });
    }

    const user = await User.create({
      id: req.body.id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      birthday: req.body.birthday,
      total: req.body.total || 0
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