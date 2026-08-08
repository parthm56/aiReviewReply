import express from 'express';
import { authMiddleware } from '../../shared/auth.middleware.js';
import {
    listApps, createApp, updateApp, deleteApp, testConnection,
    listReviews, fetchReviews, generateReviewReply, publishReply,
    sandbox, getAiConfig, saveAiConfig
} from '../Controllers/apps.controller.js';

const router = express.Router();
router.use(authMiddleware); // all app routes are protected

// Apps CRUD
router.get('/', listApps);
router.post('/', createApp);
router.put('/:id', updateApp);
router.delete('/:id', deleteApp);

// Connection test
router.post('/:id/test-connection', testConnection);

// Reviews
router.get('/:id/reviews', listReviews);
router.post('/:id/fetch-reviews', fetchReviews);
router.post('/:id/reviews/:reviewId/generate', generateReviewReply);
router.post('/:id/reviews/:reviewId/publish', publishReply);

// Sandbox
router.post('/:id/sandbox', sandbox);

// AI config (user-level, mounted here for convenience)
router.get('/ai-config', getAiConfig);
router.post('/ai-config', saveAiConfig);

export default router;
