import { Router } from 'express';
import { role } from '../middleware/auth.js';

import jwt from 'jsonwebtoken';

const router = Router();
// Map userId -> Client Response object
let clients = new Map();

// SSE Endpoint
router.get('/stream', (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(401).json({ error: 'Missing token' });
    }

    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        userId = decoded.id;
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Add client to map
    if (!clients.has(userId)) {
        clients.set(userId, []);
    }
    const clientData = { id: Date.now(), res };
    clients.get(userId).push(clientData);

    console.log(`🔌 Client connected: User ${userId}`);

    // Send initial connection message, required to establish connection
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notification stream' })}\n\n`);

    // Remove client on disconnect
    req.on('close', () => {
        const userClients = clients.get(userId);
        if (userClients) {
            const updatedClients = userClients.filter(c => c.id !== clientData.id);
            if (updatedClients.length === 0) {
                clients.delete(userId);
            } else {
                clients.set(userId, updatedClients);
            }
        }
        console.log(`🔌 Client disconnected: User ${userId}`);
    });
});

// Broadcast function to send data to specific users
export const sendToUsers = (userIds, data) => {
    userIds.forEach(userId => {
        const userClients = clients.get(userId);
        if (userClients) {
            userClients.forEach(client => {
                client.res.write(`data: ${JSON.stringify(data)}\n\n`);
            });
        }
    });
};

// broadcast to all (admin use case mostly)
export const broadcast = (data) => {
    clients.forEach((userClients) => {
        userClients.forEach(client => {
            client.res.write(`data: ${JSON.stringify(data)}\n\n`);
        });
    });
};

export default router;
