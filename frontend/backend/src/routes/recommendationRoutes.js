const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get personalized recommendations for a user
router.get('/user/:userId', auth, recommendationController.getRecommendations);

// Update recommendation status (shown, clicked, dismissed)
router.patch('/:recommendationId/status', auth, recommendationController.updateRecommendationStatus);

// Get recommendation analytics for a user
router.get('/user/:userId/analytics', auth, recommendationController.getRecommendationAnalytics);

module.exports = router;