const logger = require('../utils/logger');

// Mock database for WebContainer environment
class MockDatabase {
  constructor() {
    this.collections = new Map();
    this.connected = false;
    logger.info('Using in-memory database (MongoDB not available in WebContainer)');
  }

  async connect() {
    this.connected = true;
    logger.info('Mock database connected');
    
    // Initialize collections
    this.collections.set('users', new Map());
    this.collections.set('videos', new Map());
    this.collections.set('watchsessions', new Map());
    this.collections.set('recommendations', new Map());
    
    return this;
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    
    return {
      findOne: async (query) => {
        const collection = this.collections.get(name);
        for (const [id, doc] of collection) {
          if (this.matchesQuery(doc, query)) {
            return { _id: id, ...doc };
          }
        }
        return null;
      },
      
      find: async (query = {}) => {
        const collection = this.collections.get(name);
        const results = [];
        for (const [id, doc] of collection) {
          if (this.matchesQuery(doc, query)) {
            results.push({ _id: id, ...doc });
          }
        }
        return {
          toArray: async () => results,
          limit: (n) => ({ toArray: async () => results.slice(0, n) }),
          sort: (sortObj) => ({ 
            toArray: async () => results.sort((a, b) => {
              const key = Object.keys(sortObj)[0];
              const order = sortObj[key];
              return order === 1 ? 
                (a[key] > b[key] ? 1 : -1) : 
                (a[key] < b[key] ? 1 : -1);
            })
          })
        };
      },
      
      insertOne: async (doc) => {
        const collection = this.collections.get(name);
        const id = this.generateId();
        collection.set(id, { ...doc, createdAt: new Date() });
        return { insertedId: id };
      },
      
      updateOne: async (query, update) => {
        const collection = this.collections.get(name);
        for (const [id, doc] of collection) {
          if (this.matchesQuery(doc, query)) {
            const updatedDoc = { ...doc, ...update.$set, updatedAt: new Date() };
            collection.set(id, updatedDoc);
            return { modifiedCount: 1 };
          }
        }
        return { modifiedCount: 0 };
      },
      
      deleteOne: async (query) => {
        const collection = this.collections.get(name);
        for (const [id, doc] of collection) {
          if (this.matchesQuery(doc, query)) {
            collection.delete(id);
            return { deletedCount: 1 };
          }
        }
        return { deletedCount: 0 };
      }
    };
  }

  matchesQuery(doc, query) {
    if (!query || Object.keys(query).length === 0) return true;
    
    for (const [key, value] of Object.entries(query)) {
      if (doc[key] !== value) return false;
    }
    return true;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async close() {
    this.connected = false;
    this.collections.clear();
    logger.info('Mock database disconnected');
  }
}

let db = null;

const connectDB = async () => {
  try {
    if (!db) {
      db = new MockDatabase();
      await db.connect();
    }
    return db;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

module.exports = {
  connectDB,
  getDB
};