const express = require('express');
const router = express.Router();

router.get('/about', (req, res) => {
  try {
    res.json([
      {
        first_name: 'Dan',
        last_name: 'Kuenkas'
      },
      {
        first_name: 'Nadav',
        last_name: 'Golche Faragian'
      }
    ]);
  } catch (error) {
    res.status(500).json({
      id: 'GET_ABOUT_ERROR',
      message: error.message
    });
  }
});

module.exports = router;
