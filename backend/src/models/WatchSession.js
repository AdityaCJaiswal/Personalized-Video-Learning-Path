const mongoose = require('mongoose');

const watchSessionSchema = new mongoose.Schema({
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
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  watchDuration: Number, // in seconds
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  interactions: [{
    type: {
      type: String,
      enum: ['pause', 'play', 'seek', 'speed_change', 'fullscreen', 'volume_change']
    },
    timestamp: Number, // video timestamp in seconds
    value: mongoose.Schema.Types.Mixed, // additional data based on interaction type
    createdAt: { type: Date, default: Date.now }
  }],
  engagement: {
    attentionScore: Number, // 0-100 based on interaction patterns
    comprehensionIndicators: {
      pauseFrequency: Number,
      rewindCount: Number,
      speedAdjustments: Number
    }
  },
  context: {
    device: String,
    browser: String,
    screenSize: String,
    networkSpeed: String
  }
}, {
  timestamps: true
});

// Indexes
watchSessionSchema.index({ userId: 1, videoId: 1 });
watchSessionSchema.index({ startTime: -1 });
watchSessionSchema.index({ completed: 1 });

module.exports = mongoose.model('WatchSession', watchSessionSchema);