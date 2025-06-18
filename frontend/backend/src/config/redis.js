const logger = require('../utils/logger');

// Mock Redis client for WebContainer environment
class MockRedisClient {
  constructor() {
    this.connected = false;
    this.cache = new Map();
    logger.info('Using in-memory cache (Redis not available in WebContainer)');
  }

  async connect() {
    this.connected = true;
    logger.info('Mock Redis client connected');
    return this;
  }

  async get(key) {
    return this.cache.get(key) || null;
  }

  async set(key, value, options = {}) {
    this.cache.set(key, value);
    if (options.EX) {
      // Simple TTL implementation
      setTimeout(() => {
        this.cache.delete(key);
      }, options.EX * 1000);
    }
    return 'OK';
  }

  async del(key) {
    return this.cache.delete(key) ? 1 : 0;
  }

  async quit() {
    this.connected = false;
    this.cache.clear();
    logger.info('Mock Redis client disconnected');
  }

  async ping() {
    return 'PONG';
  }
}

// Cache service wrapper
class CacheService {
  constructor() {
    this.client = new MockRedisClient();
    this.isConnected = false;
  }

  async connect() {
    try {
      await this.client.connect();
      this.isConnected = true;
      logger.info('Cache service connected');
    } catch (error) {
      logger.error('Cache connection failed:', error.message);
      throw error;
    }
  }

  async get(key) {
    if (!this.isConnected) {
      await this.connect();
    }
    return await this.client.get(key);
  }

  async set(key, value, ttl = 3600) {
    if (!this.isConnected) {
      await this.connect();
    }
    return await this.client.set(key, JSON.stringify(value), { EX: ttl });
  }

  async del(key) {
    if (!this.isConnected) {
      await this.connect();
    }
    return await this.client.del(key);
  }

  async quit() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

const cacheService = new CacheService();

module.exports = cacheService;