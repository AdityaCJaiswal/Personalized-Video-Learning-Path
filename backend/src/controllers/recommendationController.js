const Recommendation = require('../models/Recommendation');
const Video = require('../models/Video');
const User = require('../models/User');
const aiRecommendationEngine = require('../services/aiRecommendationEngine');
const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');

class RecommendationController {
  // Get personalized recommendations for a user
  async getRecommendations(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 10, refresh = false } = req.query;

      // Check cache first (unless refresh is requested)
      if (!refresh) {
        const cachedRecommendations = await cacheService.get(`recommendations:${userId}`);
        if (cachedRecommendations) {
          return res.json({
            success: true,
            data: cachedRecommendations,
            cached: true
          });
        }
      }

      // Get user profile
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate recommendations using AI engine
      const recommendations = await aiRecommendationEngine.generateRecommendations(user, {
        limit: parseInt(limit),
        includeReasons: true
      });

      // Cache the results
      await cacheService.set(`recommendations:${userId}`, recommendations, 3600); // 1 hour

      res.json({
        success: true,
        data: recommendations,
        cached: false
      });

    } catch (error) {
      logger.error('Error getting recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendations'
      });
    }
  }

  // Update recommendation status (shown, clicked, dismissed)
  async updateRecommendationStatus(req, res) {
    try {
      const { recommendationId } = req.params;
      const { status, metadata } = req.body;

      const recommendation = await Recommendation.findById(recommendationId);
      if (!recommendation) {
        return res.status(404).json({
          success: false,
          message: 'Recommendation not found'
        });
      }

      // Update status and timestamp
      recommendation.status = status;
      if (status === 'shown') {
        recommendation.shownAt = new Date();
      } else if (status === 'clicked') {
        recommendation.clickedAt = new Date();
      } else if (status === 'dismissed') {
        recommendation.dismissedAt = new Date();
      }

      // Add any additional metadata
      if (metadata) {
        recommendation.metadata = { ...recommendation.metadata, ...metadata };
      }

      await recommendation.save();

      res.json({
        success: true,
        data: recommendation
      });

    } catch (error) {
      logger.error('Error updating recommendation status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update recommendation status'
      });
    }
  }

  // Get recommendation analytics
  async getRecommendationAnalytics(req, res) {
    try {
      const { userId } = req.params;
      const { timeframe = '7d' } = req.query;

      // Calculate date range
      const now = new Date();
      const daysBack = timeframe === '30d' ? 30 : timeframe === '7d' ? 7 : 1;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Aggregate recommendation metrics
      const analytics = await Recommendation.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRecommendations: { $sum: 1 },
            shown: { $sum: { $cond: [{ $eq: ['$status', 'shown'] }, 1, 0] } },
            clicked: { $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] } },
            watched: { $sum: { $cond: [{ $eq: ['$status', 'watched'] }, 1, 0] } },
            dismissed: { $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] } },
            averageScore: { $avg: '$score' }
          }
        }
      ]);

      const result = analytics[0] || {
        totalRecommendations: 0,
        shown: 0,
        clicked: 0,
        watched: 0,
        dismissed: 0,
        averageScore: 0
      };

      // Calculate rates
      result.clickThroughRate = result.shown > 0 ? (result.clicked / result.shown) * 100 : 0;
      result.watchRate = result.clicked > 0 ? (result.watched / result.clicked) * 100 : 0;
      result.dismissalRate = result.shown > 0 ? (result.dismissed / result.shown) * 100 : 0;

      res.json({
        success: true,
        data: result,
        timeframe
      });

    } catch (error) {
      logger.error('Error getting recommendation analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendation analytics'
      });
    }
  }
}

module.exports = new RecommendationController();