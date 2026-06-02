const express = require('express');
const router = express.Router();

router.get('/about', (req, res) => {
  res.json([
    {
      first_name: 'Dan',
      last_name: 'Kuenkas'
       first_name: 'Nadav',
       last_name: 'Golche Faragian'
    }
  ]);
});

module.exports = router;
