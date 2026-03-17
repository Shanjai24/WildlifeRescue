import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { User, Organization, Rescuer } from '../lib/db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_me_dev_secret';

function makeToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, organization } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
    if (!['animal_lover', 'rescuer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role });
    if (role === 'rescuer') {
      if (!organization?.name || !organization?.serviceType || !organization?.city || !organization?.district) {
        return res.status(400).json({ error: 'Organization details required' });
      }
      const org = await Organization.create({
        name: organization.name,
        serviceType: organization.serviceType,
        city: organization.city,
        district: organization.district,
        contactPhone: organization.contactPhone || null,
        contactEmail: organization.contactEmail || email,
        verificationStatus: 'verified'
      });
      await Rescuer.create({ UserId: user.id, OrganizationId: org.id });
    }
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = makeToken(user);
    let org = null;
    if (user.role === 'rescuer') {
      const rescuer = await Rescuer.findOne({ where: { UserId: user.id }, include: Organization });
      if (rescuer?.Organization) {
        org = {
          id: rescuer.Organization.id,
          name: rescuer.Organization.name,
          verificationStatus: rescuer.Organization.verificationStatus
        };
      }
    }
    res.json({ token, role: user.role, organization: org });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login?error=google_failed' }),
  async (req, res) => {
    try {
      const user = req.user;         
      const token = makeToken(user);

      let org = null;
      if (user.role === 'rescuer') {
        const rescuer = await Rescuer.findOne({ where: { UserId: user.id }, include: Organization });
        if (rescuer?.Organization) {
          org = {
            id: rescuer.Organization.id,
            name: rescuer.Organization.name,
            verificationStatus: rescuer.Organization.verificationStatus
          };
        }
      }

      const params = new URLSearchParams({
        token,
        role: user.role,
        ...(org ? { org: JSON.stringify(org) } : {}),
      });
      res.redirect(`http://localhost:5173/login?${params.toString()}`);
    } catch (err) {
      res.redirect('http://localhost:5173/login?error=server_error');
    }
  }
);

export default router;