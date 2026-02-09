import { Router } from 'express';
import { auth, role } from '../middleware/auth.js';
import { Incident, IncidentStatusHistory, Notification, Organization, Rescuer, User } from '../lib/db.js';
import { classifyPriority, matchOrganizations } from '../services/ai.js';

const router = Router();

router.post('/', auth(), role('animal_lover'), async (req, res) => {
  try {
    const { addressText, latitude, longitude, animalCategory, incidentType, description } = req.body;
    if (!animalCategory || !incidentType || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const priority = classifyPriority({ description, animalCategory, incidentType });
    
    const incident = await Incident.create({
      reporterId: req.user.id,
      addressText: addressText || null,
      latitude: latitude || null,
      longitude: longitude || null,
      animalCategory,
      incidentType,
      description,
      priority
    });
    
    await IncidentStatusHistory.create({ 
      incidentId: incident.id, 
      status: 'reported', 
      changedByUserId: req.user.id 
    });
    
    const candidates = await matchOrganizations({ incident });
    
    for (const org of candidates) {
      const rescuers = await Rescuer.findAll({ where: { OrganizationId: org.id }, include: User });
      for (const rescuer of rescuers) {
        await Notification.create({
          userId: rescuer.UserId,
          type: 'incident_alert',
          payload: { incidentId: incident.id, priority, organizationId: org.id },
          isRead: false
        });
      }
    }
    
    res.status(201).json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', auth(), async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Not found' });
    
    if (req.user.role === 'animal_lover' && incident.reporterId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', auth(), role('animal_lover'), async (req, res) => {
  try {
    const incidents = await Incident.findAll({ 
      where: { reporterId: req.user.id }, 
      order: [['createdAt', 'DESC']] 
    });
    res.json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;