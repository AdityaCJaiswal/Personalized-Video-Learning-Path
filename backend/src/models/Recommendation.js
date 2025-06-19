const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  reasons: [{
    type: String,
    enum: [
      'learning_style_match',
      'topic_interest',
      'difficulty_appropriate',
      'similar_users',
      'trending',
      'completion_pattern',
      'time_preference',
      'prerequisite_met'
    ]
  }],
  metadata: {
    algorithm: String,
    version: String,
    confidence: Number,
    factors: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['pending', 'shown', 'clicked', 'watched', 'dismissed'],
    default: 'pending'
  },
  shownAt: Date,
  clickedAt: Date,
  dismissedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, {
  timestamps: true
});

// Indexes
recommendationSchema.index({ userId: 1, score: -1 });
recommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
recommendationSchema.index({ status: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);