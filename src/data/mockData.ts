import { VideoContent, LearningProfile, AnalyticsData, Recommendation } from '../types';

export const mockVideoLibrary: VideoContent[] = [
  {
    id: 'js-intro',
    title: 'JavaScript Introduction: What is Programming?',
    description: 'Start your programming journey with JavaScript basics and understand what programming really means.',
    duration: 1200,
    difficulty: 'beginner',
    subjects: ['JavaScript', 'Programming Fundamentals'],
    videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
    thumbnailUrl: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q1',
        question: 'What is JavaScript primarily used for?',
        options: ['Web development', 'Database management', 'Hardware control', 'Image editing'],
        correctAnswer: 0,
        explanation: 'JavaScript is primarily used for web development, both frontend and backend.',
        difficulty: 'easy',
      },
    ],
    prerequisites: [],
    learningObjectives: ['Understand what programming is', 'Learn JavaScript basics', 'Set up development environment'],
  },
  {
    id: 'js-variables',
    title: 'JavaScript Variables and Data Types',
    description: 'Master variables, data types, and basic operations in JavaScript.',
    duration: 1800,
    difficulty: 'beginner',
    subjects: ['JavaScript', 'Programming Fundamentals'],
    videoUrl: 'https://www.youtube.com/watch?v=9emXNzqCKyg',
    thumbnailUrl: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q2',
        question: 'Which keyword creates a variable that cannot be reassigned?',
        options: ['var', 'let', 'const', 'final'],
        correctAnswer: 2,
        explanation: 'const creates variables that cannot be reassigned after declaration.',
        difficulty: 'easy',
      },
    ],
    prerequisites: ['js-intro'],
    learningObjectives: ['Declare variables', 'Understand data types', 'Perform basic operations'],
  },
  {
    id: 'react-intro',
    title: 'Introduction to React: What and Why?',
    description: 'Understand what React is, why it exists, and how it revolutionizes web development.',
    duration: 1800,
    difficulty: 'intermediate',
    subjects: ['React', 'Frontend Development'],
    videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
    thumbnailUrl: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q6',
        question: 'What is React?',
        options: ['A database', 'A JavaScript library for building UIs', 'A web server', 'A CSS framework'],
        correctAnswer: 1,
        explanation: 'React is a JavaScript library specifically designed for building user interfaces.',
        difficulty: 'easy',
      },
    ],
    prerequisites: ['js-variables'],
    learningObjectives: ['Understand React concepts', 'Learn component-based architecture', 'Set up React environment'],
  },
  {
    id: 'python-intro',
    title: 'Python Introduction: Your First Programming Language',
    description: 'Start your programming journey with Python, one of the most beginner-friendly languages.',
    duration: 1500,
    difficulty: 'beginner',
    subjects: ['Python', 'Programming Fundamentals'],
    videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    thumbnailUrl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q11',
        question: 'What makes Python special for beginners?',
        options: ['Complex syntax', 'Readable syntax', 'No variables', 'Only for experts'],
        correctAnswer: 1,
        explanation: 'Python is known for its readable, English-like syntax that makes it beginner-friendly.',
        difficulty: 'easy',
      },
    ],
    prerequisites: [],
    learningObjectives: ['Understand Python basics', 'Set up Python environment', 'Write first Python program'],
  },
  {
    id: 'html-basics',
    title: 'HTML Fundamentals: Structure of the Web',
    description: 'Learn HTML, the foundation of all web pages and web applications.',
    duration: 1800,
    difficulty: 'beginner',
    subjects: ['HTML', 'Web Development'],
    videoUrl: 'https://www.youtube.com/watch?v=mU6anWqZJcc',
    thumbnailUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q13',
        question: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
        correctAnswer: 0,
        explanation: 'HTML stands for Hyper Text Markup Language.',
        difficulty: 'easy',
      },
    ],
    prerequisites: [],
    learningObjectives: ['Understand HTML structure', 'Create basic web pages', 'Use HTML elements'],
  },
  {
    id: 'css-basics',
    title: 'CSS Fundamentals: Styling the Web',
    description: 'Learn CSS to make your web pages beautiful and responsive.',
    duration: 2100,
    difficulty: 'beginner',
    subjects: ['CSS', 'Web Development', 'Styling'],
    videoUrl: 'https://www.youtube.com/watch?v=1PnVor36_40',
    thumbnailUrl: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q14',
        question: 'Which CSS property changes text color?',
        options: ['background-color', 'color', 'text-color', 'font-color'],
        correctAnswer: 1,
        explanation: 'The color property is used to change text color in CSS.',
        difficulty: 'easy',
      },
    ],
    prerequisites: ['html-basics'],
    learningObjectives: ['Style HTML elements', 'Understand CSS selectors', 'Create layouts'],
  },
];

export const mockAnalytics: AnalyticsData = {
  dailyWatchTime: [
    { date: '2024-01-01', minutes: 45 },
    { date: '2024-01-02', minutes: 60 },
    { date: '2024-01-03', minutes: 30 },
    { date: '2024-01-04', minutes: 90 },
    { date: '2024-01-05', minutes: 75 },
    { date: '2024-01-06', minutes: 120 },
    { date: '2024-01-07', minutes: 55 },
  ],
  subjectProgress: [
    { subject: 'JavaScript', progress: 8, total: 12 },
    { subject: 'React', progress: 3, total: 8 },
    { subject: 'Python', progress: 2, total: 10 },
    { subject: 'CSS', progress: 5, total: 6 },
    { subject: 'HTML', progress: 4, total: 8 },
    { subject: 'Web Development', progress: 6, total: 10 },
  ],
  learningEfficiency: [
    { week: 'Week 1', efficiency: 72 },
    { week: 'Week 2', efficiency: 78 },
    { week: 'Week 3', efficiency: 85 },
    { week: 'Week 4', efficiency: 89 },
  ],
  engagementMetrics: {
    averageWatchTime: 42,
    completionRate: 84,
    quizAccuracy: 87,
    replayRate: 15,
  },
};

export function generateMockProfile(assessmentResults: any): LearningProfile {
  console.log('Generating profile with assessment results:', assessmentResults);
  
  return {
    id: `profile-${Date.now()}`,
    name: assessmentResults.name || 'Learner',
    learningStyle: {
      visual: assessmentResults.visual || 70,
      auditory: assessmentResults.auditory || 50,
      kinesthetic: assessmentResults.kinesthetic || 60,
      reading: assessmentResults.reading || 80,
      dominant: assessmentResults.dominant || 'visual',
    },
    knowledgeLevel: {
      subject: assessmentResults.subjects?.[0] || 'JavaScript',
      level: assessmentResults.level || 'beginner',
      score: 75,
      assessedAt: new Date(),
    },
    subjects: assessmentResults.subjects || ['JavaScript', 'React', 'Web Development'],
    preferences: {
      videoSpeed: 1.0,
      subtitles: true,
      darkMode: false,
      notifications: true,
      studyReminders: true,
    },
    progress: {
      totalWatchTime: 0,
      completedVideos: 0,
      averageQuizScore: 0,
      streakDays: 1,
      lastActive: new Date(),
      weeklyGoal: 300, // 5 hours
      achievements: [],
    },
    createdAt: new Date(),
  };
}

// Generate mock recommendations based on user profile
export function generateMockRecommendations(profile: LearningProfile): Recommendation[] {
  console.log('Generating recommendations for profile:', profile);
  
  const recommendations: Recommendation[] = [];
  
  // Filter videos based on user subjects and level
  const relevantVideos = mockVideoLibrary.filter(video => {
    const subjectMatch = video.subjects.some(subject => 
      profile.subjects.some(userSubject => 
        userSubject.toLowerCase().includes(subject.toLowerCase()) ||
        subject.toLowerCase().includes(userSubject.toLowerCase())
      )
    );
    
    const difficultyMatch = video.difficulty === profile.knowledgeLevel.level ||
      (profile.knowledgeLevel.level === 'beginner' && video.difficulty === 'intermediate');
    
    return subjectMatch && difficultyMatch;
  });

  console.log('Relevant videos found:', relevantVideos);

  // If no relevant videos found, use all beginner videos
  const videosToUse = relevantVideos.length > 0 ? relevantVideos : 
    mockVideoLibrary.filter(v => v.difficulty === 'beginner');

  // Generate different types of recommendations
  videosToUse.slice(0, 6).forEach((video, index) => {
    const categories = ['next_lesson', 'review', 'challenge', 'next_lesson', 'related', 'next_lesson'];
    const category = categories[index % categories.length];
    
    recommendations.push({
      id: `rec-${video.id}-${Date.now()}-${index}`,
      videoId: video.id,
      title: video.title,
      reason: generateRecommendationReason(video, profile, category),
      confidence: 0.75 + (Math.random() * 0.24), // 0.75 to 0.99
      category: category as any,
    });
  });

  console.log('Generated recommendations:', recommendations);
  return recommendations;
}

function generateRecommendationReason(
  video: VideoContent, 
  profile: LearningProfile, 
  category: string
): string {
  const dominantStyle = profile.learningStyle.dominant;
  
  const styleEnhancements = {
    visual: 'enhanced with visual demonstrations and diagrams',
    auditory: 'optimized with detailed audio explanations',
    kinesthetic: 'featuring hands-on exercises and practical examples',
    reading: 'supplemented with comprehensive notes and text materials',
  };

  const baseReasons = {
    next_lesson: `Perfect next step in your ${video.subjects[0]} journey - ${styleEnhancements[dominantStyle]}`,
    review: `Strengthen your understanding of ${video.subjects[0]} - ${styleEnhancements[dominantStyle]}`,
    challenge: `Ready for advanced ${video.subjects[0]} concepts? This challenging content is ${styleEnhancements[dominantStyle]}`,
    related: `Explore related ${video.subjects[0]} concepts - ${styleEnhancements[dominantStyle]}`,
  };

  return baseReasons[category as keyof typeof baseReasons] || 
         `Recommended based on your ${dominantStyle} learning style - ${styleEnhancements[dominantStyle]}`;
}