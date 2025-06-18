const Video = require('../models/Video');
const WatchSession = require('../models/WatchSession');
const Recommendation = require('../models/Recommendation');
const logger = require('../utils/logger');

class AIRecommendationEngine {
  constructor() {
    this.algorithms = {
      contentBased: this.contentBasedFiltering.bind(this),
      collaborative: this.collaborativeFiltering.bind(this),
      hybrid: this.hybridFiltering.bind(this)
    };
  }

  async generateRecommendations(user, options = {}) {
    const {
      limit = 10,
      algorithm = 'hybrid',
      includeReasons = false
    } = options;

    try {
      logger.info(`Generating recommendations for user ${user._id} using ${algorithm} algorithm`);

      // Get user's watch history
      const watchHistory = await WatchSession.find({ userId: user._id })
        .populate('videoId')
        .sort({ createdAt: -1 })
        .limit(100);

      // Generate recommendations based on selected algorithm
      const recommendations = await this.algorithms[algorithm](user, watchHistory, limit);

      // Add reasons if requested
      if (includeReasons) {
        recommendations.forEach(rec => {
          rec.reasons = this.generateReasons(rec, user, watchHistory);
        });
      }

      // Save recommendations to database
      await this.saveRecommendations(user._id, recommendations);

      return recommendations;

    } catch (error) {
      logger.error('Error generating recommendations:', error);
      throw error;
    }
  }

  async contentBasedFiltering(user, watchHistory, limit) {
    const watchedVideoIds = watchHistory.map(session => session.videoId._id);
    const userTopics = user.preferences.topics || [];
    const userDifficulty = user.preferences.difficulty;

    // Build query based on user preferences
    const query = {
      _id: { $nin: watchedVideoIds }, // Exclude already watched videos
      $or: [
        { topics: { $in: userTopics } },
        { category: { $in: userTopics } }
      ]
    };

    if (userDifficulty !== 'adaptive') {
      query.difficulty = userDifficulty;
    }

    const videos = await Video.find(query)
      .sort({ 'engagement.averageWatchTime': -1, viewCount: -1 })
      .limit(limit * 2); // Get more to allow for scoring

    // Score videos based on user preferences
    const scoredVideos = videos.map(video => ({
      video,
      score: this.calculateContentScore(video, user, watchHistory)
    }));

    // Sort by score and return top recommendations
    return scoredVideos
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        videoId: item.video._id,
        video: item.video,
        score: item.score,
        algorithm: 'content-based'
      }));
  }

  async collaborativeFiltering(user, watchHistory, limit) {
    // Find similar users based on watch patterns
    const similarUsers = await this.findSimilarUsers(user, watchHistory);
    
    if (similarUsers.length === 0) {
      // Fallback to content-based if no similar users found
      return this.contentBasedFiltering(user, watchHistory, limit);
    }

    const watchedVideoIds = watchHistory.map(session => session.videoId._id);
    const similarUserIds = similarUsers.map(u => u.userId);

    // Get videos watched by similar users
    const similarUserSessions = await WatchSession.find({
      userId: { $in: similarUserIds },
      videoId: { $nin: watchedVideoIds },
      completed: true
    }).populate('videoId');

    // Score videos based on similar user preferences
    const videoScores = {};
    similarUserSessions.forEach(session => {
      const videoId = session.videoId._id.toString();
      if (!videoScores[videoId]) {
        videoScores[videoId] = {
          video: session.videoId,
          score: 0,
          count: 0
        };
      }
      
      // Weight by user similarity
      const userSimilarity = similarUsers.find(u => u.userId.equals(session.userId))?.similarity || 0;
      videoScores[videoId].score += userSimilarity;
      videoScores[videoId].count += 1;
    });

    // Convert to array and sort
    const recommendations = Object.values(videoScores)
      .map(item => ({
        videoId: item.video._id,
        video: item.video,
        score: item.score / item.count, // Average score
        algorithm: 'collaborative'
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }

  async hybridFiltering(user, watchHistory, limit) {
    const contentRecs = await this.contentBasedFiltering(user, watchHistory, Math.ceil(limit * 0.7));
    const collaborativeRecs = await this.collaborativeFiltering(user, watchHistory, Math.ceil(limit * 0.5));

    // Combine and deduplicate
    const combinedRecs = new Map();
    
    // Add content-based recommendations with weight
    contentRecs.forEach(rec => {
      combinedRecs.set(rec.videoId.toString(), {
        ...rec,
        score: rec.score * 0.6, // Weight content-based at 60%
        algorithm: 'hybrid'
      });
    });

    // Add collaborative recommendations with weight
    collaborativeRecs.forEach(rec => {
      const videoId = rec.videoId.toString();
      if (combinedRecs.has(videoId)) {
        // Combine scores if video exists in both
        const existing = combinedRecs.get(videoId);
        existing.score = (existing.score + rec.score * 0.4); // Weight collaborative at 40%
      } else {
        combinedRecs.set(videoId, {
          ...rec,
          score: rec.score * 0.4,
          algorithm: 'hybrid'
        });
      }
    });

    return Array.from(combinedRecs.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  calculateContentScore(video, user, watchHistory) {
    let score = 0;

    // Topic relevance
    const userTopics = user.preferences.topics || [];
    const videoTopics = video.topics || [];
    const topicOverlap = videoTopics.filter(topic => userTopics.includes(topic)).length;
    score += (topicOverlap / Math.max(userTopics.length, 1)) * 0.3;

    // Difficulty match
    if (user.preferences.difficulty === video.difficulty) {
      score += 0.2;
    }

    // Learning style match
    if (user.learningStyle) {
      // Visual learners prefer videos with good thumbnails and visual content
      if (user.learningStyle.visual > 0.5 && video.thumbnail) {
        score += 0.1;
      }
      // Auditory learners prefer longer videos
      if (user.learningStyle.auditory > 0.5 && video.duration > 600) {
        score += 0.1;
      }
    }

    // Video quality indicators
    score += Math.min(video.viewCount / 100000, 0.1); // Popularity boost
    score += Math.min(video.likeCount / 1000, 0.1); // Like ratio boost

    // Recency boost for newer content
    const daysSincePublished = (Date.now() - new Date(video.publishedAt)) / (1000 * 60 * 60 * 24);
    if (daysSincePublished < 30) {
      score += 0.05;
    }

    return Math.min(score, 1); // Cap at 1.0
  }

  async findSimilarUsers(user, watchHistory) {
    // This is a simplified similarity calculation
    // In production, you'd use more sophisticated algorithms like cosine similarity
    
    const userVideoIds = watchHistory.map(session => session.videoId._id);
    
    if (userVideoIds.length === 0) {
      return [];
    }

    // Find users who watched similar videos
    const similarUserSessions = await WatchSession.aggregate([
      {
        $match: {
          videoId: { $in: userVideoIds },
          userId: { $ne: user._id }
        }
      },
      {
        $group: {
          _id: '$userId',
          commonVideos: { $addToSet: '$videoId' },
          totalSessions: { $sum: 1 }
        }
      },
      {
        $match: {
          totalSessions: { $gte: 2 } // At least 2 common videos
        }
      }
    ]);

    // Calculate similarity scores
    const similarUsers = similarUserSessions.map(userGroup => ({
      userId: userGroup._id,
      similarity: userGroup.commonVideos.length / userVideoIds.length
    })).filter(user => user.similarity > 0.1) // Minimum 10% similarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Top 10 similar users

    return similarUsers;
  }

  generateReasons(recommendation, user, watchHistory) {
    const reasons = [];
    const video = recommendation.video;

    // Check for topic matches
    const userTopics = user.preferences.topics || [];
    const videoTopics = video.topics || [];
    if (videoTopics.some(topic => userTopics.includes(topic))) {
      reasons.push('topic_interest');
    }

    // Check difficulty appropriateness
    if (user.preferences.difficulty === video.difficulty) {
      reasons.push('difficulty_appropriate');
    }

    // Check learning style match
    if (user.learningStyle && user.learningStyle.visual > 0.6) {
      reasons.push('learning_style_match');
    }

    // Check if it's trending
    if (video.viewCount > 50000) {
      reasons.push('trending');
    }

    return reasons;
  }

  async saveRecommendations(userId, recommendations) {
    const recommendationDocs = recommendations.map(rec => ({
      userId,
      videoId: rec.videoId,
      score: rec.score,
      reasons: rec.reasons || [],
      metadata: {
        algorithm: rec.algorithm,
        version: '1.0',
        confidence: rec.score
      }
    }));

    try {
      await Recommendation.insertMany(recommendationDocs);
      logger.info(`Saved ${recommendationDocs.length} recommendations for user ${userId}`);
    } catch (error) {
      logger.error('Error saving recommendations:', error);
    }
  }
}

module.exports = new AIRecommendationEngine();