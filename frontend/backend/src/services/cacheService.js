const cacheService = require('../config/redis');
const logger = require('../utils/logger');

class CacheManager {
  constructor() {
    this.cache = cacheService;
  }

  async get(key) {
    try {
      const value = await this.cache.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.cache.set(key, value, ttl);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error.message);
      return false;
    }
  }

  async del(key) {
    try {
      await this.cache.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error.message);
      return false;
    }
  }

  async getUserRecommendations(userId) {
    return await this.get(`recommendations:${userId}`);
  }

  async setUserRecommendations(userId, recommendations, ttl = 1800) {
    return await this.set(`recommendations:${userId}`, recommendations, ttl);
  }

  async getUserProfile(userId) {
    return await this.get(`profile:${userId}`);
  }

  async setUserProfile(userId, profile, ttl = 3600) {
    return await this.set(`profile:${userId}`, profile, ttl);
  }

  async getVideoMetadata(videoId) {
    return await this.get(`video:${videoId}`);
  }

  async setVideoMetadata(videoId, metadata, ttl = 7200) {
    return await this.set(`video:${videoId}`, metadata, ttl);
  }
}

module.exports = new CacheManager();