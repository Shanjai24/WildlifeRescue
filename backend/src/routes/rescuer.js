import { Router } from 'express';
import { auth, verifiedRescuerOnly } from '../middleware/auth.js';
import { Incident, IncidentStatusHistory, Organization, Notification, User } from '../lib/db.js';

const router = Router();

router.get('/alerts', auth(), verifiedRescuerOnly(), async (req, res) => {
  try {
    const incidents = await Incident.findAll({
      where: { status: 'reported' },
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });
    res.json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/accept', auth(), verifiedRescuerOnly(), async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Not found' });
    
    if (incident.status !== 'reported') {
      return res.status(400).json({ error: 'Already handled' });
    }
    
    const org = await Organization.findByPk(req.user.organizationId);
    if (!org || org.verificationStatus !== 'verified') {
      return res.status(403).json({ error: 'Organization not verified' });
    }
    
    incident.assignedOrganizationId = org.id;
    incident.status = 'accepted';
    await incident.save();
    
    await IncidentStatusHistory.create({ 
      incidentId: incident.id, 
      status: 'accepted', 
      changedByUserId: req.user.id 
    });
    
    // Notify reporter
    await Notification.create({
      userId: incident.reporterId,
      type: 'status_update',
      payload: { incidentId: incident.id, status: 'accepted', organizationId: org.id },
      isRead: false
    });
    
    res.json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/status', auth(), verifiedRescuerOnly(), async (req, res) => {
  try {
    const { status, note } = req.body;
    
    if (!['in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Not found' });
    
    if (incident.assignedOrganizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Not assigned to your organization' });
    }
    
    incident.status = status;
    await incident.save();
    
    await IncidentStatusHistory.create({ 
      incidentId: incident.id, 
      status, 
      note: note || null, 
      changedByUserId: req.user.id 
    });
    
    // Notify reporter
    await Notification.create({
      userId: incident.reporterId,
      type: 'status_update',
      payload: { incidentId: incident.id, status },
      isRead: false
    });
    
    res.json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;