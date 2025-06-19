const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  youtubeId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  thumbnail: String,
  duration: Number, // in seconds
  channelTitle: String,
  publishedAt: Date,
  tags: [String],
  category: String,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  topics: [String],
  viewCount: Number,
  likeCount: Number,
  metadata: {
    transcriptAvailable: { type: Boolean, default: false },
    closedCaptionsAvailable: { type: Boolean, default: false },
    language: { type: String, default: 'en' }
  },
  aiAnalysis: {
    complexity: Number, // 1-10 scale
    keyTopics: [String],
    prerequisites: [String],
    learningObjectives: [String],
    summary: String
  },
  engagement: {
    averageWatchTime: Number,
    completionRate: Number,
    userRatings: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
videoSchema.index({ topics: 1 });
videoSchema.index({ difficulty: 1 });
videoSchema.index({ category: 1 });
videoSchema.index({ 'aiAnalysis.complexity': 1 });

module.exports = mongoose.model('Video', videoSchema);