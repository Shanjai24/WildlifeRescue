import { Router } from 'express';
import { auth, role, verifiedRescuerOnly } from '../middleware/auth.js';
import { Incident, IncidentStatusHistory, Organization } from '../lib/db.js';

const router = Router();

router.get('/alerts', auth(), verifiedRescuerOnly(), async (req, res) => {
  try {
    const incidents = await Incident.findAll({
      where: { status: 'reported' },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/accept', auth(), verifiedRescuerOnly(), async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Not found' });
    if (incident.status !== 'reported') return res.status(400).json({ error: 'Already handled' });
    const org = await Organization.findByPk(req.user.organizationId);
    if (!org || org.verificationStatus !== 'verified') return res.status(403).json({ error: 'Org not verified' });
    incident.assignedOrganizationId = org.id;
    incident.status = 'accepted';
    await incident.save();
    await IncidentStatusHistory.create({ incidentId: incident.id, status: 'accepted', changedByUserId: req.user.id });
    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/status', auth(), verifiedRescuerOnly(), async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!['in_progress', 'completed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Not found' });
    if (incident.assignedOrganizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Not assigned to your org' });
    }
    incident.status = status;
    await incident.save();
    await IncidentStatusHistory.create({ incidentId: incident.id, status, note: note || null, changedByUserId: req.user.id });
    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
