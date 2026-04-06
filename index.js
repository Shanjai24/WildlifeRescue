import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { sequelize, User } from './lib/db.js';
import authRouter from './routes/auth.js';
import incidentsRouter from './routes/incidents.js';
import rescuerRouter from './routes/rescuer.js';
import adminRouter from './routes/admin.js';
import analyticsRouter from './routes/analytics.js';

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Session (required by passport even in stateless JWT mode) ─────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'wildlife-session-secret',
  resave: false,
  saveUninitialized: false,
}));

// ── Passport ──────────────────────────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('No email from Google'), null);

      // Find existing user or create new one (Google users have no password)
      let user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({
          email,
          passwordHash: '',        // no password for Google users
          role: 'animal_lover',    // default role — they can change later
          googleId: profile.id,
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Minimal serialize/deserialize (we use JWT, not sessions)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ ok: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/incidents', incidentsRouter);
app.use('/rescuer', rescuerRouter);
app.use('/admin', adminRouter);
app.use('/api/analytics', analyticsRouter);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    // force: true will drop and recreate tables (needed for development when schema changes)
    // In production, use alter: true with a proper migration strategy
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized successfully.');
    app.listen(PORT, () => {
      console.log(`✅ Backend server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();