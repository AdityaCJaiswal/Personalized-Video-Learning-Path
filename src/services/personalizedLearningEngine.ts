import { LearningProfile, VideoContent, Recommendation, WatchSession } from '../types';
import { 
  courses, 
  videoLibrary, 
  getCoursesForUser, 
  getNextVideoInPath, 
  generatePersonalizedLearningPath,
  getRecommendedCourses,
  LearningPathNode 
} from '../data/courseData';

export interface PersonalizedLearningContext {
  profile: LearningProfile;
  watchHistory: WatchSession[];
  currentCourse?: string;
  learningGoals: string[];
  timeAvailable: number; // minutes per session
  preferredDifficulty: 'adaptive' | 'easy' | 'challenging';
}

export class PersonalizedLearningEngine {
  static generatePersonalizedRecommendations(
    context: PersonalizedLearningContext
  ): Recommendation[] {
    const { profile, watchHistory } = context;
    const recommendations: Recommendation[] = [];
    
    // Get completed video IDs
    const completedVideoIds = watchHistory
      .filter(session => session.completionRate >= 0.8)
      .map(session => session.videoId);
    
    // Get user's courses
    const userCourses = getCoursesForUser(profile);
    
    // Generate different types of recommendations
    const nextLessons = this.generateNextLessonRecommendations(context, userCourses, completedVideoIds);
    const reviewContent = this.generateReviewRecommendations(context, completedVideoIds);
    const newCourses = this.generateNewCourseRecommendations(context, userCourses);
    const challengeContent = this.generateChallengeRecommendations(context, completedVideoIds);
    
    recommendations.push(...nextLessons, ...reviewContent, ...newCourses, ...challengeContent);
    
    // Sort by relevance and confidence
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);
  }
  
  private static generateNextLessonRecommendations(
    context: PersonalizedLearningContext,
    userCourses: any[],
    completedVideoIds: string[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    for (const course of userCourses) {
      const nextVideo = getNextVideoInPath(course.id, completedVideoIds);
      
      if (nextVideo) {
        const confidence = this.calculateConfidence(nextVideo, context, 'next_lesson');
        const reason = this.generatePersonalizedReason(nextVideo, context, 'next_lesson', course);
        
        recommendations.push({
          id: `next-${course.id}-${nextVideo.id}`,
          videoId: nextVideo.id,
          title: nextVideo.title,
          reason,
          confidence,
          category: 'next_lesson',
        });
      }
    }
    
    return recommendations.slice(0, 3);
  }
  
  private static generateReviewRecommendations(
    context: PersonalizedLearningContext,
    completedVideoIds: string[]
  ): Recommendation[] {
    const { watchHistory, profile } = context;
    const recommendations: Recommendation[] = [];
    
    // Find videos with low completion rates or poor quiz performance
    const strugglingVideos = watchHistory.filter(session => {
      const isCompleted = completedVideoIds.includes(session.videoId);
      const hasLowCompletion = session.completionRate < 0.7;
      const hasRecentActivity = Date.now() - session.startTime.getTime() < 7 * 24 * 60 * 60 * 1000; // Last 7 days
      
      return !isCompleted && hasLowCompletion && hasRecentActivity;
    });
    
    for (const session of strugglingVideos.slice(0, 2)) {
      const video = videoLibrary.find(v => v.id === session.videoId);
      if (video) {
        recommendations.push({
          id: `review-${video.id}`,
          videoId: video.id,
          title: video.title,
          reason: this.generatePersonalizedReason(video, context, 'review'),
          confidence: 0.85,
          category: 'review',
        });
      }
    }
    
    return recommendations;
  }
  
  private static generateNewCourseRecommendations(
    context: PersonalizedLearningContext,
    currentCourses: any[]
  ): Recommendation[] {
    const { profile } = context;
    const recommendations: Recommendation[] = [];
    
    // Get recommended courses not yet started
    const recommendedCourses = getRecommendedCourses(profile);
    const currentCourseIds = currentCourses.map(c => c.id);
    const newCourses = recommendedCourses.filter(course => !currentCourseIds.includes(course.id));
    
    for (const course of newCourses.slice(0, 2)) {
      const firstVideo = course.learningPath[0]?.videoIds[0];
      const video = videoLibrary.find(v => v.id === firstVideo);
      
      if (video) {
        recommendations.push({
          id: `new-course-${course.id}`,
          videoId: video.id,
          title: `Start: ${course.title}`,
          reason: `Begin your journey in ${course.category.toLowerCase()} with this ${course.difficulty} course`,
          confidence: 0.75,
          category: 'next_lesson',
        });
      }
    }
    
    return recommendations;
  }
  
  private static generateChallengeRecommendations(
    context: PersonalizedLearningContext,
    completedVideoIds: string[]
  ): Recommendation[] {
    const { profile } = context;
    const recommendations: Recommendation[] = [];
    
    // Only suggest challenges if user prefers them or is advanced
    if (context.preferredDifficulty === 'challenging' || profile.knowledgeLevel.level === 'advanced') {
      const challengeVideos = videoLibrary.filter(video => 
        video.difficulty === 'advanced' &&
        !completedVideoIds.includes(video.id) &&
        video.subjects.some(subject => profile.subjects.includes(subject))
      );
      
      for (const video of challengeVideos.slice(0, 1)) {
        recommendations.push({
          id: `challenge-${video.id}`,
          videoId: video.id,
          title: video.title,
          reason: this.generatePersonalizedReason(video, context, 'challenge'),
          confidence: 0.65,
          category: 'challenge',
        });
      }
    }
    
    return recommendations;
  }
  
  private static calculateConfidence(
    video: VideoContent,
    context: PersonalizedLearningContext,
    category: string
  ): number {
    let confidence = 0.5;
    
    // Subject alignment
    const subjectMatch = video.subjects.filter(subject => 
      context.profile.subjects.includes(subject)
    ).length / video.subjects.length;
    confidence += subjectMatch * 0.3;
    
    // Difficulty appropriateness
    const difficultyMatch = this.isDifficultyAppropriate(video.difficulty, context.profile.knowledgeLevel.level);
    if (difficultyMatch) confidence += 0.2;
    
    // Time availability
    const timeMatch = video.duration <= context.timeAvailable * 60;
    if (timeMatch) confidence += 0.15;
    
    // Learning style alignment
    confidence += this.calculateLearningStyleAlignment(video, context.profile) * 0.2;
    
    // Category bonus
    const categoryBonus = {
      'next_lesson': 0.15,
      'review': 0.1,
      'challenge': 0.05,
      'related': 0.05,
    };
    confidence += categoryBonus[category as keyof typeof categoryBonus] || 0;
    
    return Math.min(confidence, 0.99);
  }
  
  private static isDifficultyAppropriate(videoDifficulty: string, userLevel: string): boolean {
    const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
    const videoIndex = difficultyOrder.indexOf(videoDifficulty);
    const userIndex = difficultyOrder.indexOf(userLevel);
    
    return Math.abs(videoIndex - userIndex) <= 1;
  }
  
  private static calculateLearningStyleAlignment(video: VideoContent, profile: LearningProfile): number {
    // This would analyze video metadata in a real implementation
    // For now, return based on dominant learning style
    const dominantStyleScore = profile.learningStyle[profile.learningStyle.dominant as keyof typeof profile.learningStyle];
    return (dominantStyleScore as number) / 100;
  }
  
  private static generatePersonalizedReason(
    video: VideoContent,
    context: PersonalizedLearningContext,
    category: string,
    course?: any
  ): string {
    const { profile } = context;
    const dominantStyle = profile.learningStyle.dominant;
    
    const styleEnhancements = {
      visual: 'enhanced with visual demonstrations and diagrams',
      auditory: 'optimized with detailed audio explanations',
      kinesthetic: 'featuring hands-on exercises and practical examples',
      reading: 'supplemented with comprehensive notes and text materials',
    };
    
    const baseReasons = {
      next_lesson: course ? 
        `Continue your ${course.title} journey - ${styleEnhancements[dominantStyle]}` :
        `Perfect next step based on your ${dominantStyle} learning style`,
      review: `Strengthen your foundation - ${styleEnhancements[dominantStyle]}`,
      challenge: `Ready for advanced concepts? This challenging content is ${styleEnhancements[dominantStyle]}`,
      related: `Explore related ${video.subjects[0]} concepts ${styleEnhancements[dominantStyle]}`,
    };
    
    return baseReasons[category as keyof typeof baseReasons] || 
           `Recommended based on your ${dominantStyle} learning style`;
  }
  
  static generatePersonalizedLearningPath(
    profile: LearningProfile,
    watchHistory: WatchSession[]
  ): LearningPathNode[] {
    const completedVideoIds = watchHistory
      .filter(session => session.completionRate >= 0.8)
      .map(session => session.videoId);
    
    return generatePersonalizedLearningPath(profile, completedVideoIds);
  }
  
  static getPersonalizedVideoLibrary(
    profile: LearningProfile,
    watchHistory: WatchSession[]
  ): VideoContent[] {
    const userCourses = getCoursesForUser(profile);
    const completedVideoIds = new Set(
      watchHistory
        .filter(session => session.completionRate >= 0.8)
        .map(session => session.videoId)
    );
    
    // Get all videos from user's courses
    const courseVideoIds = new Set(
      userCourses.flatMap(course => 
        course.learningPath.flatMap((node: any) => node.videoIds)
      )
    );
    
    // Filter videos to show only relevant ones
    return videoLibrary.filter(video => {
      // Must be in user's courses
      if (!courseVideoIds.has(video.id)) return false;
      
      // Check if prerequisites are met
      const prerequisitesMet = video.prerequisites.every(prereq => 
        completedVideoIds.has(prereq)
      );
      
      // Show if prerequisites met or if it's a beginner video
      return prerequisitesMet || video.difficulty === 'beginner';
    });
  }
  
  static getCurrentCourseProgress(
    profile: LearningProfile,
    watchHistory: WatchSession[]
  ): { [courseId: string]: { completed: number; total: number; percentage: number } } {
    const userCourses = getCoursesForUser(profile);
    const completedVideoIds = new Set(
      watchHistory
        .filter(session => session.completionRate >= 0.8)
        .map(session => session.videoId)
    );
    
    const progress: { [courseId: string]: { completed: number; total: number; percentage: number } } = {};
    
    for (const course of userCourses) {
      const totalVideos = course.learningPath.flatMap((node: any) => node.videoIds).length;
      const completedVideos = course.learningPath
        .flatMap((node: any) => node.videoIds)
        .filter((videoId: string) => completedVideoIds.has(videoId)).length;
      
      progress[course.id] = {
        completed: completedVideos,
        total: totalVideos,
        percentage: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
      };
    }
    
    return progress;
  }
}