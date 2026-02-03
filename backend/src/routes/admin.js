import { Router } from 'express';
import { auth, role } from '../middleware/auth.js';
import { Organization } from '../lib/db.js';

const router = Router();

router.post('/organizations/:id/verify', auth(), role('admin'), async (req, res) => {
  try {
    const org = await Organization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ error: 'Not found' });
    org.verificationStatus = 'verified';
    await org.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
