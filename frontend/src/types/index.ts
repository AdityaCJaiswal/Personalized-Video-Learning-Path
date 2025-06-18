export interface LearningProfile {
  id: string;
  name: string;
  learningStyle: LearningStyle;
  knowledgeLevel: KnowledgeLevel;
  subjects: string[];
  preferences: LearningPreferences;
  progress: Progress;
  createdAt: Date;
}

export interface LearningStyle {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
  dominant: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

export interface KnowledgeLevel {
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  score: number;
  assessedAt: Date;
}

export interface LearningPreferences {
  videoSpeed: number;
  subtitles: boolean;
  darkMode: boolean;
  notifications: boolean;
  studyReminders: boolean;
}

export interface Progress {
  totalWatchTime: number;
  completedVideos: number;
  averageQuizScore: number;
  streakDays: number;
  lastActive: Date;
  weeklyGoal: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subjects: string[];
  videoUrl: string;
  thumbnailUrl: string;
  transcripts: Transcript[];
  quizQuestions: QuizQuestion[];
  prerequisites: string[];
  learningObjectives: string[];
}

export interface Transcript {
  timestamp: number;
  text: string;
  speaker?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WatchSession {
  videoId: string;
  startTime: Date;
  endTime?: Date;
  watchedDuration: number;
  totalDuration: number;
  completionRate: number;
  interactions: Interaction[];
  quizResults?: QuizResult[];
}

export interface Interaction {
  type: 'play' | 'pause' | 'seek' | 'replay' | 'speed_change';
  timestamp: number;
  value?: any;
}

export interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface Recommendation {
  id: string;
  videoId: string;
  title: string;
  reason: string;
  confidence: number;
  category: 'next_lesson' | 'review' | 'challenge' | 'related';
}

export interface AnalyticsData {
  dailyWatchTime: { date: string; minutes: number }[];
  subjectProgress: { subject: string; progress: number; total: number }[];
  learningEfficiency: { week: string; efficiency: number }[];
  engagementMetrics: {
    averageWatchTime: number;
    completionRate: number;
    quizAccuracy: number;
    replayRate: number;
  };
}