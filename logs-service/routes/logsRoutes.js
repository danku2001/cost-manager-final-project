const express = require('express');
const router = express.Router();

const Log = require('../models/Log');

router.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({
      created_at: -1
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      id: 'GET_LOGS_ERROR',
      message: error.message
    });
  }
});

module.exports = router;