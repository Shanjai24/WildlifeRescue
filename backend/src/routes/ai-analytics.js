import express from 'express';
import MLClient from '../services/ml-client.js';

const router = express.Router();

/**
 * @route   POST /api/predictions/migration
 * @desc    Get wildlife migration predictions
 */
router.post('/migration', async (req, res) => {
    try {
        const { species, region, season } = req.body;
        const result = await MLClient.predictMigration(species, region, season);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/predictions/poaching-hotspots
 * @desc    Get poaching hotspot predictions
 */
router.post('/poaching-hotspots', async (req, res) => {
    try {
        const { region } = req.body;
        const result = await MLClient.predictPoachingHotspots(region);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/predictions/disease-risk
 * @desc    Get disease outbreak risk prediction
 */
router.post('/disease-risk', async (req, res) => {
    try {
        const { species, region, currentCases } = req.body;
        const result = await MLClient.predictDiseaseOutbreak(species, region, currentCases);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/analytics/impact-report
 * @desc    Get conservation impact report
 */
router.get('/impact-report', async (req, res) => {
    try {
        const result = await MLClient.getImpactReport();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/analytics/population-trends
 * @desc    Get population trend analytics
 */
router.post('/population-trends', async (req, res) => {
    try {
        const { species, region } = req.body;
        const result = await MLClient.getPopulationTrends(species, region);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/analytics/biodiversity
 * @desc    Get biodiversity index and metrics
 */
router.post('/biodiversity', async (req, res) => {
    try {
        const { region } = req.body;
        const result = await MLClient.getBiodiversityMetrics(region);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
