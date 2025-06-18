import { LearningProfile, VideoContent, Recommendation, WatchSession } from '../types';
import { YouTubeAnalytics } from './youtubeService';

export interface UserBehaviorPattern {
  engagementLevel: 'low' | 'medium' | 'high';
  learningVelocity: number; // 0-1 scale
  difficultyPreference: 'easy' | 'challenging' | 'adaptive';
  attentionSpan: number; // in minutes
  optimalSessionLength: number; // in minutes
  strugglingTopics: string[];
  masteredTopics: string[];
  preferredTimeOfDay: number; // hour of day
  interactionPatterns: {
    pauseFrequency: number;
    replayFrequency: number;
    speedChangeFrequency: number;
    seekBackFrequency: number;
  };
  comprehensionIndicators: {
    quizPerformance: number;
    completionRate: number;
    consistentProgress: boolean;
    retentionRate: number;
  };
}

export interface AIRecommendationContext {
  userProfile: LearningProfile;
  behaviorPattern: UserBehaviorPattern;
  recentAnalytics: YouTubeAnalytics[];
  watchHistory: WatchSession[];
  currentStruggleAreas: string[];
  learningGoals: string[];
  timeConstraints: {
    availableTime: number; // minutes
    preferredSessionLength: number;
  };
}

export class AIRecommendationEngine {
  private static readonly ENGAGEMENT_WEIGHTS = {
    watchTime: 0.25,
    interactionQuality: 0.20,
    quizPerformance: 0.20,
    completionRate: 0.15,
    consistentProgress: 0.10,
    focusRetention: 0.10,
  };

  private static readonly DIFFICULTY_PROGRESSION = {
    beginner: { next: 'intermediate', threshold: 0.8 },
    intermediate: { next: 'advanced', threshold: 0.85 },
    advanced: { next: 'expert', threshold: 0.9 },
  };

  static generatePersonalizedRecommendations(
    context: AIRecommendationContext,
    videoLibrary: VideoContent[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Analyze user behavior patterns
    const behaviorInsights = this.analyzeBehaviorPatterns(context);
    
    // Generate different types of recommendations
    const nextLessons = this.generateNextLessonRecommendations(context, videoLibrary, behaviorInsights);
    const reviewContent = this.generateReviewRecommendations(context, videoLibrary, behaviorInsights);
    const challengeContent = this.generateChallengeRecommendations(context, videoLibrary, behaviorInsights);
    const adaptiveContent = this.generateAdaptiveRecommendations(context, videoLibrary, behaviorInsights);

    recommendations.push(...nextLessons, ...reviewContent, ...challengeContent, ...adaptiveContent);

    // Apply AI scoring and ranking
    return this.rankRecommendations(recommendations, context, behaviorInsights);
  }

  private static analyzeBehaviorPatterns(context: AIRecommendationContext): any {
    const { recentAnalytics, watchHistory, behaviorPattern } = context;

    return {
      learningEfficiency: this.calculateLearningEfficiency(recentAnalytics, watchHistory),
      engagementTrends: this.analyzeEngagementTrends(recentAnalytics),
      difficultyAdaptation: this.analyzeDifficultyAdaptation(watchHistory, behaviorPattern),
      contentPreferences: this.analyzeContentPreferences(watchHistory, context.userProfile),
      strugglingPatterns: this.identifyStrugglePatterns(recentAnalytics, watchHistory),
      masteryIndicators: this.identifyMasteryPatterns(recentAnalytics, watchHistory),
      optimalLearningConditions: this.identifyOptimalConditions(recentAnalytics, behaviorPattern),
    };
  }

  private static calculateLearningEfficiency(
    analytics: YouTubeAnalytics[],
    watchHistory: WatchSession[]
  ): number {
    if (analytics.length === 0) return 0.5;

    const avgEngagement = analytics.reduce((sum, a) => sum + a.engagementScore, 0) / analytics.length;
    const avgCompletion = watchHistory.reduce((sum, w) => sum + w.completionRate, 0) / watchHistory.length;
    const consistencyScore = this.calculateConsistencyScore(watchHistory);

    return (avgEngagement * 0.4 + avgCompletion * 0.4 + consistencyScore * 0.2) / 100;
  }

  private static calculateConsistencyScore(watchHistory: WatchSession[]): number {
    if (watchHistory.length < 2) return 50;

    const completionRates = watchHistory.map(w => w.completionRate);
    const variance = this.calculateVariance(completionRates);
    
    // Lower variance = higher consistency
    return Math.max(0, 100 - (variance * 100));
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private static analyzeEngagementTrends(analytics: YouTubeAnalytics[]): any {
    if (analytics.length < 2) return { trend: 'stable', confidence: 0.5 };

    const scores = analytics.map(a => a.engagementScore);
    const trend = scores[scores.length - 1] - scores[0];
    
    return {
      trend: trend > 5 ? 'improving' : trend < -5 ? 'declining' : 'stable',
      rate: Math.abs(trend) / scores.length,
      confidence: Math.min(scores.length / 10, 1),
      currentLevel: scores[scores.length - 1],
    };
  }

  private static analyzeDifficultyAdaptation(
    watchHistory: WatchSession[],
    behaviorPattern: UserBehaviorPattern
  ): any {
    const difficultyPerformance = {
      beginner: { attempts: 0, avgCompletion: 0, avgQuizScore: 0 },
      intermediate: { attempts: 0, avgCompletion: 0, avgQuizScore: 0 },
      advanced: { attempts: 0, avgCompletion: 0, avgQuizScore: 0 },
    };

    // This would be calculated from actual video metadata
    // For now, we'll use behavioral indicators
    
    const readinessForNext = behaviorPattern.comprehensionIndicators.completionRate > 0.8 &&
                            behaviorPattern.comprehensionIndicators.quizPerformance > 0.75;

    return {
      currentOptimalDifficulty: readinessForNext ? 'intermediate' : 'beginner',
      readinessScore: behaviorPattern.comprehensionIndicators.completionRate,
      adaptationNeeded: behaviorPattern.strugglingTopics.length > 2,
      recommendedProgression: readinessForNext ? 'advance' : 'consolidate',
    };
  }

  private static analyzeContentPreferences(
    watchHistory: WatchSession[],
    profile: LearningProfile
  ): any {
    // Analyze which types of content the user engages with most
    const subjectEngagement: Record<string, number> = {};
    const durationPreferences: number[] = [];

    watchHistory.forEach(session => {
      // This would map videoId to subjects in a real implementation
      durationPreferences.push(session.totalDuration);
    });

    const avgPreferredDuration = durationPreferences.length > 0 
      ? durationPreferences.reduce((sum, d) => sum + d, 0) / durationPreferences.length
      : 1800; // 30 minutes default

    return {
      preferredSubjects: profile.subjects,
      optimalDuration: avgPreferredDuration,
      learningStyleAlignment: profile.learningStyle.dominant,
      engagementPatterns: subjectEngagement,
    };
  }

  private static identifyStrugglePatterns(
    analytics: YouTubeAnalytics[],
    watchHistory: WatchSession[]
  ): string[] {
    const struggles: string[] = [];

    analytics.forEach(analytic => {
      if (analytic.comprehensionSignals.strugglingSegments.length > 2) {
        struggles.push('content_comprehension');
      }
      
      if (analytic.difficultyIndicators.pausePatterns.length > 5) {
        struggles.push('information_processing');
      }
      
      if (analytic.engagementScore < 40) {
        struggles.push('engagement_retention');
      }
    });

    return [...new Set(struggles)];
  }

  private static identifyMasteryPatterns(
    analytics: YouTubeAnalytics[],
    watchHistory: WatchSession[]
  ): string[] {
    const mastery: string[] = [];

    analytics.forEach(analytic => {
      if (analytic.comprehensionSignals.masteredSegments.length > 5) {
        mastery.push('content_mastery');
      }
      
      if (analytic.engagementScore > 80) {
        mastery.push('high_engagement');
      }
      
      if (analytic.comprehensionSignals.consistentPlayback) {
        mastery.push('smooth_learning');
      }
    });

    return [...new Set(mastery)];
  }

  private static identifyOptimalConditions(
    analytics: YouTubeAnalytics[],
    behaviorPattern: UserBehaviorPattern
  ): any {
    return {
      optimalSessionLength: behaviorPattern.optimalSessionLength,
      bestTimeOfDay: behaviorPattern.preferredTimeOfDay,
      idealDifficulty: behaviorPattern.difficultyPreference,
      recommendedBreakFrequency: behaviorPattern.attentionSpan < 20 ? 'frequent' : 'moderate',
    };
  }

  private static generateNextLessonRecommendations(
    context: AIRecommendationContext,
    videoLibrary: VideoContent[],
    insights: any
  ): Recommendation[] {
    const { userProfile, behaviorPattern } = context;
    const recommendations: Recommendation[] = [];

    // Filter videos based on prerequisites and difficulty
    const suitableVideos = videoLibrary.filter(video => {
      const difficultyMatch = this.isDifficultyAppropriate(
        video.difficulty,
        insights.difficultyAdaptation.currentOptimalDifficulty
      );
      
      const subjectMatch = video.subjects.some(subject => 
        userProfile.subjects.includes(subject)
      );
      
      const durationMatch = Math.abs(video.duration - insights.contentPreferences.optimalDuration) < 900;

      return difficultyMatch && subjectMatch && durationMatch;
    });

    suitableVideos.slice(0, 3).forEach(video => {
      const confidence = this.calculateRecommendationConfidence(video, context, insights);
      const reason = this.generatePersonalizedReason(video, context, 'next_lesson', insights);

      recommendations.push({
        id: `next-${video.id}`,
        videoId: video.id,
        title: video.title,
        reason,
        confidence,
        category: 'next_lesson',
      });
    });

    return recommendations;
  }

  private static generateReviewRecommendations(
    context: AIRecommendationContext,
    videoLibrary: VideoContent[],
    insights: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (insights.strugglingPatterns.length > 0) {
      // Find videos that address struggling areas
      const reviewVideos = videoLibrary.filter(video => {
        return video.difficulty === 'beginner' || 
               context.userProfile.subjects.some(subject => video.subjects.includes(subject));
      });

      reviewVideos.slice(0, 2).forEach(video => {
        recommendations.push({
          id: `review-${video.id}`,
          videoId: video.id,
          title: video.title,
          reason: this.generatePersonalizedReason(video, context, 'review', insights),
          confidence: 0.85,
          category: 'review',
        });
      });
    }

    return recommendations;
  }

  private static generateChallengeRecommendations(
    context: AIRecommendationContext,
    videoLibrary: VideoContent[],
    insights: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Only suggest challenges if user shows mastery patterns
    if (insights.masteryIndicators.length > 2 && insights.learningEfficiency > 0.7) {
      const challengeVideos = videoLibrary.filter(video => 
        video.difficulty === 'advanced' &&
        video.subjects.some(subject => context.userProfile.subjects.includes(subject))
      );

      challengeVideos.slice(0, 1).forEach(video => {
        recommendations.push({
          id: `challenge-${video.id}`,
          videoId: video.id,
          title: video.title,
          reason: this.generatePersonalizedReason(video, context, 'challenge', insights),
          confidence: 0.6 + (insights.learningEfficiency * 0.3),
          category: 'challenge',
        });
      });
    }

    return recommendations;
  }

  private static generateAdaptiveRecommendations(
    context: AIRecommendationContext,
    videoLibrary: VideoContent[],
    insights: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // AI-driven adaptive recommendations based on real-time behavior
    if (context.recentAnalytics.length > 0) {
      const latestAnalytics = context.recentAnalytics[context.recentAnalytics.length - 1];
      
      // If user is struggling, recommend easier content
      if (latestAnalytics.comprehensionSignals.strugglingSegments.length > 3) {
        const easierVideos = videoLibrary.filter(video => 
          video.difficulty === 'beginner' &&
          video.duration < context.timeConstraints.preferredSessionLength * 60
        );

        easierVideos.slice(0, 1).forEach(video => {
          recommendations.push({
            id: `adaptive-easier-${video.id}`,
            videoId: video.id,
            title: video.title,
            reason: 'AI detected learning difficulty - this content is optimized for your current pace',
            confidence: 0.9,
            category: 'next_lesson',
          });
        });
      }

      // If user is excelling, recommend more challenging content
      if (latestAnalytics.engagementScore > 85 && latestAnalytics.comprehensionSignals.masteredSegments.length > 4) {
        const advancedVideos = videoLibrary.filter(video => 
          video.difficulty === 'advanced' &&
          video.subjects.some(subject => context.userProfile.subjects.includes(subject))
        );

        advancedVideos.slice(0, 1).forEach(video => {
          recommendations.push({
            id: `adaptive-advanced-${video.id}`,
            videoId: video.id,
            title: video.title,
            reason: 'AI detected high mastery - ready for advanced challenges',
            confidence: 0.88,
            category: 'challenge',
          });
        });
      }
    }

    return recommendations;
  }

  private static calculateRecommendationConfidence(
    video: VideoContent,
    context: AIRecommendationContext,
    insights: any
  ): number {
    let confidence = 0.5;

    // Subject alignment
    const subjectMatch = video.subjects.filter(subject => 
      context.userProfile.subjects.includes(subject)
    ).length / video.subjects.length;
    confidence += subjectMatch * 0.25;

    // Difficulty appropriateness
    if (this.isDifficultyAppropriate(video.difficulty, insights.difficultyAdaptation.currentOptimalDifficulty)) {
      confidence += 0.2;
    }

    // Duration preference
    const durationDiff = Math.abs(video.duration - insights.contentPreferences.optimalDuration);
    const durationScore = Math.max(0, 1 - (durationDiff / 1800)); // Normalize to 30 minutes
    confidence += durationScore * 0.15;

    // Learning style alignment
    confidence += this.calculateLearningStyleAlignment(video, context.userProfile) * 0.2;

    // Behavioral pattern match
    confidence += this.calculateBehavioralMatch(video, context.behaviorPattern) * 0.2;

    return Math.min(confidence, 0.99);
  }

  private static calculateLearningStyleAlignment(video: VideoContent, profile: LearningProfile): number {
    // This would analyze video metadata to determine style compatibility
    // For now, return a score based on dominant learning style
    const dominantStyleScore = profile.learningStyle[profile.learningStyle.dominant as keyof typeof profile.learningStyle];
    return (dominantStyleScore as number) / 100;
  }

  private static calculateBehavioralMatch(video: VideoContent, behaviorPattern: UserBehaviorPattern): number {
    let score = 0.5;

    // Match video duration with user's attention span
    if (video.duration <= behaviorPattern.attentionSpan * 60) {
      score += 0.3;
    }

    // Match difficulty with user's preference
    if (video.difficulty === behaviorPattern.difficultyPreference) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  private static generatePersonalizedReason(
    video: VideoContent,
    context: AIRecommendationContext,
    category: string,
    insights: any
  ): string {
    const { userProfile, behaviorPattern } = context;
    const dominantStyle = userProfile.learningStyle.dominant;

    const styleEnhancements = {
      visual: 'enhanced with interactive diagrams and visual demonstrations',
      auditory: 'optimized with detailed explanations and audio-focused content',
      kinesthetic: 'featuring hands-on exercises and practical applications',
      reading: 'supplemented with comprehensive notes and text materials',
    };

    const baseReasons = {
      next_lesson: `Perfect next step based on your ${dominantStyle} learning style`,
      review: `Strengthen foundation - AI detected areas for improvement`,
      challenge: `Ready for advanced concepts - your mastery indicates high potential`,
      related: `Complements your recent learning in ${video.subjects[0]}`,
    };

    let reason = baseReasons[category as keyof typeof baseReasons];

    // Add behavioral insights
    if (insights.engagementTrends.trend === 'improving') {
      reason += ' - your engagement is trending upward';
    }

    if (behaviorPattern.learningVelocity > 0.8) {
      reason += ' - optimized for your fast learning pace';
    }

    if (insights.optimalLearningConditions.recommendedBreakFrequency === 'frequent') {
      reason += ' - structured for focused learning sessions';
    }

    return `${reason}, ${styleEnhancements[dominantStyle]}`;
  }

  private static rankRecommendations(
    recommendations: Recommendation[],
    context: AIRecommendationContext,
    insights: any
  ): Recommendation[] {
    return recommendations
      .sort((a, b) => {
        // Primary sort by confidence
        if (Math.abs(a.confidence - b.confidence) > 0.1) {
          return b.confidence - a.confidence;
        }

        // Secondary sort by category priority
        const categoryPriority = { next_lesson: 4, review: 3, challenge: 2, related: 1 };
        const aPriority = categoryPriority[a.category] || 0;
        const bPriority = categoryPriority[b.category] || 0;

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        // Tertiary sort by learning efficiency alignment
        return b.confidence - a.confidence;
      })
      .slice(0, 8); // Limit to top 8 recommendations
  }

  private static isDifficultyAppropriate(videoDifficulty: string, userOptimalDifficulty: string): boolean {
    const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
    const videoIndex = difficultyOrder.indexOf(videoDifficulty);
    const userIndex = difficultyOrder.indexOf(userOptimalDifficulty);
    
    // Allow same level or one level difference
    return Math.abs(videoIndex - userIndex) <= 1;
  }

  static generateLearningInsights(
    context: AIRecommendationContext,
    insights: any
  ): {
    patterns: string[];
    recommendations: string[];
    predictions: { metric: string; value: string; confidence: number }[];
  } {
    const result = {
      patterns: [],
      recommendations: [],
      predictions: [],
    };

    // Analyze patterns
    if (insights.engagementTrends.trend === 'improving') {
      result.patterns.push('Your engagement is consistently improving over time');
    }

    if (insights.masteryIndicators.includes('smooth_learning')) {
      result.patterns.push('You learn best with consistent, uninterrupted sessions');
    }

    if (insights.strugglingPatterns.includes('information_processing')) {
      result.patterns.push('You benefit from pausing to process complex information');
    }

    // Generate recommendations
    if (insights.optimalLearningConditions.recommendedBreakFrequency === 'frequent') {
      result.recommendations.push('Take short breaks every 15-20 minutes for optimal retention');
    }

    if (insights.difficultyAdaptation.recommendedProgression === 'advance') {
      result.recommendations.push('You\'re ready to tackle more challenging content');
    }

    // Make predictions
    result.predictions.push({
      metric: 'Learning Efficiency',
      value: `${Math.round(insights.learningEfficiency * 100)}%`,
      confidence: 0.85,
    });

    result.predictions.push({
      metric: 'Optimal Session Length',
      value: `${insights.optimalLearningConditions.optimalSessionLength} minutes`,
      confidence: 0.78,
    });

    result.predictions.push({
      metric: 'Next Milestone',
      value: insights.difficultyAdaptation.recommendedProgression === 'advance' ? 'Intermediate Level' : 'Foundation Mastery',
      confidence: 0.72,
    });

    return result;
  }
}