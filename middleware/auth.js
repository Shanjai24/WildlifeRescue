import jwt from 'jsonwebtoken';
import { User, Rescuer, Organization } from '../lib/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_dev_secret';

export function auth() {
  return async (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(payload.id);
      if (!user) return res.status(401).json({ error: 'Invalid token' });
      req.user = { id: user.id, role: user.role };
      if (user.role === 'rescuer') {
        const rescuer = await Rescuer.findOne({ where: { UserId: user.id }, include: Organization });
        if (rescuer) {
          req.user.organizationId = rescuer.OrganizationId;
          req.user.verificationStatus = rescuer.Organization?.verificationStatus || 'pending';
        }
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

export function role(required) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== required) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

export function verifiedRescuerOnly() {
  return (req, res, next) => {
    if (req.user?.role !== 'rescuer' || req.user?.verificationStatus !== 'verified') {
      return res.status(403).json({ error: 'Rescuer not verified' });
    }
    next();
  };
}