import express from 'express';
import MLClient from '../services/ml-client.js';
import multer from 'multer';

const router = express.Router();
const upload = multer(); // For handling multipart/form-data (images)

/**
 * @route   POST /api/ai/identify-species
 * @desc    Upload image for species identification
 */
router.post('/identify-species', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image provided' });
        }

        // In a real app, we might need to convert Buffer to a readable stream or similar
        // for the Flask API, but axios/FormData often handles Buffers well.
        const result = await MLClient.predictSpecies(req.file.buffer);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/ai/assess-injury
 * @desc    Upload image for injury assessment
 */
router.post('/assess-injury', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image provided' });
        }

        const result = await MLClient.assessInjury(req.file.buffer);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/ai/process-report
 * @desc    Process incident description via NLP
 */
router.post('/process-report', async (req, res) => {
    try {
        const { description } = req.body;
        const result = await MLClient.processReport(description);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/ai/optimize-assignment
 * @desc    Optimize rescuer assignment for an incident
 */
router.post('/optimize-assignment', async (req, res) => {
    try {
        const { incident, rescuers } = req.body;
        const result = await MLClient.optimizeAssignment(incident, rescuers);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/ai/optimize-route
 * @desc    Optimize route for multiple incidents
 */
router.post('/optimize-route', async (req, res) => {
    try {
        const { startLocation, incidents } = req.body;
        const result = await MLClient.optimizeRoute(startLocation, incidents);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
