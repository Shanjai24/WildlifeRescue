import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { sequelize } from './lib/db.js';
import authRouter from './routes/auth.js';
import incidentsRouter from './routes/incidents.js';
import notificationRoutes from './routes/notifications.js';
import rescuerRouter from './routes/rescuer.js';
import adminRouter from './routes/admin.js';
import aiServiceRoutes from './routes/ai-services.js';
import aiAnalyticsRoutes from './routes/ai-analytics.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/auth', authRouter);
app.use('/incidents', incidentsRouter);
app.use('/notifications', notificationRoutes);
app.use('/rescuer', rescuerRouter);
app.use('/admin', adminRouter);
app.use('/api/ai', aiServiceRoutes);
app.use('/api/analytics', aiAnalyticsRoutes);
app.use('/api/predictions', aiAnalyticsRoutes);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database tables (alter: true will update existing tables without dropping data)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized successfully.');

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Backend server running at http://localhost:${PORT}`);
      console.log(`   Database: ${process.env.DB_NAME || 'SQLite'}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();