require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fsp = require('fs/promises');

const { sequelize, User, HostingAccount } = require('./models');
const { getUserRoot } = require('./services/fileService');

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/auth', authLimiter);

// Routes
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/account', require('./routes/account'));
app.use('/api/files', require('./routes/files'));
app.use('/api/domains', require('./routes/domains'));
app.use('/api/ftp', require('./routes/ftp'));
app.use('/api/ssl', require('./routes/ssl'));
app.use('/api/db', require('./routes/db'));
app.use('/api/email', require('./routes/email'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    // In dev, we can auto-migrate. In prod, use proper migrations.
    const alter = process.env.NODE_ENV !== 'production';
    await sequelize.sync({ alter });

    // Seed admin user if specified
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const { hashPassword } = require('./utils/password');
      let admin = await User.findOne({ where: { email: process.env.ADMIN_EMAIL } });
      if (!admin) {
        const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD);
        admin = await User.create({ email: process.env.ADMIN_EMAIL, passwordHash });
        await HostingAccount.create({
          userId: admin.id,
          diskSpaceLimitMb: 20480,
          bandwidthLimitGb: 200,
        });
        console.log('Seeded admin user:', admin.email);
      }
      // Ensure admin storage directory exists
      await fsp.mkdir(getUserRoot(admin.id), { recursive: true });
    }

    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start the server only if this file is run directly
if (require.main === module) {
  start();
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

module.exports = { app, start };
