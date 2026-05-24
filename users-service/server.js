const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const pino = require('pino');

const connectDB = require('./config/db');
const Log = require('./models/Log');

dotenv.config();

connectDB();

const logger = pino();

const app = express();

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    logger.info(`${req.method} ${req.originalUrl}`);

    await Log.create({
      service: 'users-service',
      method: req.method,
      url: req.originalUrl,
      message: `Request received: ${req.method} ${req.originalUrl}`
    });
  } catch (error) {
    console.log(error.message);
  }

  next();
});

app.use('/api', require('./routes/usersRoutes'));

app.get('/', (req, res) => {
  res.json({
    message: 'Users Service Running'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Users service running on port ${PORT}`);
});