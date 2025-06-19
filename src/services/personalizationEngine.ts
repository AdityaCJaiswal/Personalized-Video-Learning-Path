import { LearningProfile, VideoContent, Recommendation, WatchSession } from '../types';

export class PersonalizationEngine {
  static generateRecommendations(
    profile: LearningProfile,
    videoLibrary: VideoContent[],
    watchHistory: WatchSession[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Get completed video IDs
    const completedVideoIds = new Set(
      watchHistory
        .filter(session => session.completionRate >= 0.8)
        .map(session => session.videoId)
    );

    // Calculate learning velocity and preferences
    const learningVelocity = this.calculateLearningVelocity(watchHistory);
    const contentPreferences = this.analyzeContentPreferences(profile, watchHistory);

    // Generate different types of recommendations
    const nextLessons = this.findNextLessons(profile, videoLibrary, completedVideoIds, contentPreferences);
    const reviewItems = this.findReviewItems(profile, videoLibrary, watchHistory);
    const challenges = this.findChallenges(profile, videoLibrary, completedVideoIds, learningVelocity);
    const relatedContent = this.findRelatedContent(profile, videoLibrary, watchHistory);

    recommendations.push(...nextLessons, ...reviewItems, ...challenges, ...relatedContent);

    // Sort by confidence score and learning style match
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8); // Limit to top 8 recommendations
  }

  private static calculateLearningVelocity(watchHistory: WatchSession[]): number {
    if (watchHistory.length === 0) return 0.5;
    
    const recentSessions = watchHistory.slice(-10); // Last 10 sessions
    const avgCompletionRate = recentSessions.reduce((sum, session) => 
      sum + session.completionRate, 0) / recentSessions.length;
    
    const avgWatchSpeed = recentSessions.reduce((sum, session) => {
      const speedMultiplier = session.interactions.find(i => i.type === 'speed_change')?.value || 1.0;
      return sum + speedMultiplier;
    }, 0) / recentSessions.length || 1.0;

    // Velocity combines completion rate and preferred speed
    return (avgCompletionRate * avgWatchSpeed) / 1.5;
  }

  private static analyzeContentPreferences(
    profile: LearningProfile, 
    watchHistory: WatchSession[]
  ): {
    preferredDifficulty: string;
    optimalDuration: number;
    bestTimeOfDay: number;
  } {
    const completedSessions = watchHistory.filter(s => s.completionRate >= 0.8);
    
    // Analyze preferred difficulty based on successful completions
    const difficultySuccessRates = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };

    // This would be calculated from actual video metadata in watchHistory
    // For now, use profile knowledge level as basis
    const preferredDifficulty = profile.knowledgeLevel.level;
    
    // Calculate optimal duration from successful sessions
    const avgSuccessfulDuration = completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => sum + s.totalDuration, 0) / completedSessions.length
      : 1800; // Default 30 minutes

    return {
      preferredDifficulty,
      optimalDuration: avgSuccessfulDuration,
      bestTimeOfDay: 14 // 2 PM default, would be calculated from session timestamps
    };
  }

  private static findNextLessons(
    profile: LearningProfile,
    videoLibrary: VideoContent[],
    completedVideoIds: Set<string>,
    preferences: any
  ): Recommendation[] {
    const availableVideos = videoLibrary.filter(video => {
      // Not already completed
      if (completedVideoIds.has(video.id)) return false;
      
      // Prerequisites met
      const prerequisitesMet = video.prerequisites.every(prereq => 
        completedVideoIds.has(prereq)
      );
      
      // Subject matches interests
      const subjectMatch = video.subjects.some(subject => 
        profile.subjects.includes(subject)
      );
      
      // Appropriate difficulty based on velocity and preference
      const difficultyMatch = this.isDifficultyAppropriate(
        video.difficulty,
        profile.knowledgeLevel.level,
        preferences.preferredDifficulty
      );

      // Duration preference
      const durationMatch = Math.abs(video.duration - preferences.optimalDuration) < 900; // Within 15 minutes

      return prerequisitesMet && subjectMatch && difficultyMatch && durationMatch;
    });

    return availableVideos.slice(0, 3).map(video => {
      const confidence = this.calculateRecommendationConfidence(video, profile);
      return {
        id: `next-${video.id}`,
        videoId: video.id,
        title: video.title,
        reason: this.generatePersonalizedReason(video, profile, 'next_lesson'),
        confidence,
        category: 'next_lesson' as const,
      };
    });
  }

  private static findReviewItems(
    profile: LearningProfile,
    videoLibrary: VideoContent[],
    watchHistory: WatchSession[]
  ): Recommendation[] {
    // Find videos with concerning patterns
    const reviewCandidates = watchHistory.filter(session => {
      const replayCount = session.interactions.filter(i => i.type === 'replay').length;
      const quizScore = session.quizResults ? this.calculateQuizScore(session.quizResults) : 1;
      
      return session.completionRate < 0.7 || 
             quizScore < 0.6 || 
             replayCount > 3; // High replay indicates confusion
    }).map(session => session.videoId);

    const reviewVideos = videoLibrary.filter(video => 
      reviewCandidates.includes(video.id)
    );

    return reviewVideos.slice(0, 2).map(video => {
      const confidence = 0.8; // High confidence for review items
      return {
        id: `review-${video.id}`,
        videoId: video.id,
        title: video.title,
        reason: this.generatePersonalizedReason(video, profile, 'review'),
        confidence,
        category: 'review' as const,
      };
    });
  }

  private static findChallenges(
    profile: LearningProfile,
    videoLibrary: VideoContent[],
    completedVideoIds: Set<string>,
    learningVelocity: number
  ): Recommendation[] {
    // Only suggest challenges if learning velocity is high
    if (learningVelocity < 0.7) return [];

    const challengeVideos = videoLibrary.filter(video => {
      const isNotCompleted = !completedVideoIds.has(video.id);
      const isAdvanced = video.difficulty === 'advanced';
      const isInUserSubjects = video.subjects.some(subject => profile.subjects.includes(subject));
      
      return isNotCompleted && isAdvanced && isInUserSubjects;
    });

    return challengeVideos.slice(0, 1).map(video => ({
      id: `challenge-${video.id}`,
      videoId: video.id,
      title: video.title,
      reason: this.generatePersonalizedReason(video, profile, 'challenge'),
      confidence: 0.6 + (learningVelocity * 0.3), // Higher confidence for fast learners
      category: 'challenge' as const,
    }));
  }

  private static findRelatedContent(
    profile: LearningProfile,
    videoLibrary: VideoContent[],
    watchHistory: WatchSession[]
  ): Recommendation[] {
    const recentSubjects = new Set(
      watchHistory.slice(-5).map(session => {
        const video = videoLibrary.find(v => v.id === session.videoId);
        return video?.subjects || [];
      }).flat()
    );

    const relatedVideos = videoLibrary.filter(video => 
      video.subjects.some(subject => recentSubjects.has(subject)) &&
      !watchHistory.some(session => session.videoId === video.id)
    );

    return relatedVideos.slice(0, 2).map(video => ({
      id: `related-${video.id}`,
      videoId: video.id,
      title: video.title,
      reason: this.generatePersonalizedReason(video, profile, 'related'),
      confidence: 0.7,
      category: 'related' as const,
    }));
  }

  private static generatePersonalizedReason(
    video: VideoContent,
    profile: LearningProfile,
    category: string
  ): string {
    const dominantStyle = profile.learningStyle.dominant;
    
    const styleReasons = {
      visual: "with enhanced visual diagrams and animations",
      auditory: "with detailed audio explanations",
      kinesthetic: "with hands-on coding exercises",
      reading: "with comprehensive written materials"
    };

    const categoryReasons = {
      next_lesson: `Perfect next step in your ${video.subjects[0]} journey`,
      review: `Strengthen your understanding with ${styleReasons[dominantStyle]}`,
      challenge: `Ready for advanced concepts? This ${video.difficulty} lesson ${styleReasons[dominantStyle]}`,
      related: `Explore related ${video.subjects.join(' and ')} concepts ${styleReasons[dominantStyle]}`
    };

    return categoryReasons[category as keyof typeof categoryReasons] || 
           `Recommended based on your ${dominantStyle} learning style`;
  }

  private static calculateRecommendationConfidence(
    video: VideoContent,
    profile: LearningProfile
  ): number {
    let confidence = 0.5;

    // Subject match boost
    const subjectMatches = video.subjects.filter(subject => 
      profile.subjects.includes(subject)
    ).length;
    confidence += (subjectMatches / video.subjects.length) * 0.3;

    // Difficulty appropriateness
    if (this.isDifficultyAppropriate(video.difficulty, profile.knowledgeLevel.level)) {
      confidence += 0.2;
    }

    // Learning style optimization potential
    confidence += this.calculateStyleMatchScore(video, profile) * 0.3;

    return Math.min(confidence, 0.99);
  }

  private static calculateStyleMatchScore(video: VideoContent, profile: LearningProfile): number {
    // This would analyze video metadata to determine style compatibility
    // For now, return a score based on dominant learning style
    const dominantStyleScore = profile.learningStyle[profile.learningStyle.dominant as keyof typeof profile.learningStyle];
    return (dominantStyleScore as number) / 100;
  }

  private static isDifficultyAppropriate(
    videoDifficulty: string,
    userLevel: string,
    preferredDifficulty?: string
  ): boolean {
    const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
    const videoIndex = difficultyOrder.indexOf(videoDifficulty);
    const userIndex = difficultyOrder.indexOf(userLevel);
    
    // Allow same level, one level up, or preferred difficulty
    return videoIndex <= userIndex + 1 || videoDifficulty === preferredDifficulty;
  }

  private static calculateQuizScore(quizResults: any[]): number {
    if (quizResults.length === 0) return 1;
    const correct = quizResults.filter(result => result.isCorrect).length;
    return correct / quizResults.length;
  }

  static adaptVideoContent(
    video: VideoContent,
    profile: LearningProfile
  ): VideoContent {
    const adaptedVideo = { ...video };
    const dominantStyle = profile.learningStyle.dominant;

    // Adapt content description based on learning style
    const adaptations = {
      visual: {
        suffix: " (Enhanced with interactive diagrams, code visualizations, and step-by-step animations)",
        emphasis: "Visual elements and diagrams will be highlighted"
      },
      auditory: {
        suffix: " (Features detailed verbal explanations, discussions, and audio-focused content)",
        emphasis: "Audio explanations and verbal walkthroughs will be emphasized"
      },
      kinesthetic: {
        suffix: " (Includes hands-on coding exercises, interactive examples, and practical applications)",
        emphasis: "Interactive coding and hands-on practice will be prioritized"
      },
      reading: {
        suffix: " (Supplemented with comprehensive notes, text explanations, and written materials)",
        emphasis: "Detailed text content and comprehensive notes will be provided"
      }
    };

    const adaptation = adaptations[dominantStyle];
    adaptedVideo.description += adaptation.suffix;

    // Add personalized learning objectives
    adaptedVideo.learningObjectives = [
      ...video.learningObjectives,
      `Optimized for ${dominantStyle} learning style`,
      adaptation.emphasis
    ];

    return adaptedVideo;
  }

  static calculateLearningEfficiency(
    watchHistory: WatchSession[],
    profile: LearningProfile
  ): number {
    if (watchHistory.length === 0) return 0;

    const recentSessions = watchHistory.slice(-10); // Last 10 sessions
    
    // Factors that contribute to efficiency
    const avgCompletionRate = recentSessions.reduce((sum, session) => 
      sum + session.completionRate, 0) / recentSessions.length;
    
    const avgQuizScore = recentSessions.reduce((sum, session) => {
      const quizScore = session.quizResults ? this.calculateQuizScore(session.quizResults) : 0.8;
      return sum + quizScore;
    }, 0) / recentSessions.length;

    const replayRate = recentSessions.reduce((sum, session) => {
      const replays = session.interactions.filter(i => i.type === 'replay').length;
      return sum + (replays / session.totalDuration * 100); // Replays per minute
    }, 0) / recentSessions.length;

    // Efficiency formula: (completion * quiz performance) - (replay penalty)
    const efficiency = (avgCompletionRate * avgQuizScore * 100) - (replayRate * 5);
    
    return Math.max(Math.min(Math.round(efficiency), 100), 0);
  }

  static generateLearningInsights(
    profile: LearningProfile,
    watchHistory: WatchSession[],
    analytics: any
  ): {
    patterns: string[];
    recommendations: string[];
    predictions: { metric: string; value: string; confidence: number }[];
  } {
    const insights = {
      patterns: [],
      recommendations: [],
      predictions: []
    };

    // Analyze learning patterns
    if (watchHistory.length > 5) {
      const bestPerformanceSessions = watchHistory
        .filter(s => s.completionRate > 0.9)
        .slice(-5);
      
      if (bestPerformanceSessions.length > 2) {
        insights.patterns.push("You perform best with shorter, focused sessions");
        insights.recommendations.push("Try breaking complex topics into 20-30 minute segments");
      }
    }

    // Generate predictions based on current trajectory
    const currentEfficiency = this.calculateLearningEfficiency(watchHistory, profile);
    
    insights.predictions.push(
      {
        metric: "Completion Time",
        value: "8 days",
        confidence: 0.85
      },
      {
        metric: "Quiz Success Rate",
        value: `${Math.min(currentEfficiency + 5, 98)}%`,
        confidence: 0.78
      },
      {
        metric: "Next Difficulty Level",
        value: profile.knowledgeLevel.level === 'beginner' ? 'Intermediate' : 'Advanced',
        confidence: 0.72
      }
    );

    return insights;
  }
}