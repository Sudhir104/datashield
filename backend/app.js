const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('./middleware/sanitize');

const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const AppError = require('./utils/AppError');

const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const checklistRoutes = require('./routes/checklistRoutes');
const dataAuditRoutes = require('./routes/dataAuditRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

// Security headers
app.use(helmet());

// CORS - only allow the configured frontend origin, with credentials for cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing with size limit to prevent large-payload abuse
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// Basic NoSQL-injection sanitization (strips $ and . from keys in req.body/query/params)
app.use(mongoSanitize());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'DataShield API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/data-audit', dataAuditRoutes);
app.use('/api/documents', documentRoutes);

// Catch-all for unhandled routes (Express 5 syntax)
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

app.use(errorHandler);

module.exports = app;
