const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const { connectDatabase } = require('./config/db');
const { initEnvironment } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const authRoutes = require('./routes/auth.routes');
const voterRoutes = require('./routes/voter.routes');
const voteRoutes = require('./routes/vote.routes');
const candidateRoutes = require('./routes/candidate.routes');
const electionRoutes = require('./routes/election.routes');
const resultRoutes = require('./routes/result.routes');
const adminRoutes = require('./routes/admin.routes');
const faceRoutes = require('./routes/face.routes');

initEnvironment();
connectDatabase();

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(mongoSanitize());
app.use(hpp());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

app.get('/', (req, res) => res.json({ status: 'ok', service: 'Polling Unit API' }));
app.use('/api/auth', authRoutes);
app.use('/api/voters', voterRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/face', faceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Polling Unit backend running on ${PORT}`);
});
