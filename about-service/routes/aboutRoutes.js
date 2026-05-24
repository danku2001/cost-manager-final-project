const express = require('express');
const router = express.Router();

router.get('/about', (req, res) => {
  res.json([
    {
      first_name: 'Dan',
      last_name: 'Kuenkas'
    }
  ]);
});

module.exports = router;