import { VideoContent, LearningProfile, AnalyticsData, Recommendation } from '../types';

export const mockVideoLibrary: VideoContent[] = [
  {
    id: 'js-basics-1',
    title: 'JavaScript Fundamentals: Variables and Data Types',
    description: 'Learn the foundation of JavaScript programming with variables, data types, and basic operations.',
    duration: 1800, // 30 minutes
    difficulty: 'beginner',
    subjects: ['JavaScript', 'Programming'],
    videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', // JavaScript Tutorial for Beginners
    thumbnailUrl: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [
      { timestamp: 0, text: 'Welcome to JavaScript Fundamentals' },
      { timestamp: 30, text: 'Today we will learn about variables and data types' },
    ],
    quizQuestions: [
      {
        id: 'q1',
        question: 'Which keyword is used to declare a variable that can be reassigned?',
        options: ['const', 'let', 'var', 'final'],
        correctAnswer: 1,
        explanation: 'let allows you to declare variables that can be reassigned later.',
        difficulty: 'easy',
      },
    ],
    prerequisites: [],
    learningObjectives: ['Understand variable declaration', 'Learn data types', 'Practice basic operations'],
  },
  {
    id: 'react-intro',
    title: 'Introduction to React: Components and JSX',
    description: 'Discover the power of React library for building user interfaces.',
    duration: 2400, // 40 minutes
    difficulty: 'intermediate',
    subjects: ['React', 'Frontend Development'],
    videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', // React in 100 Seconds
    thumbnailUrl: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [
      { timestamp: 0, text: 'Introduction to React framework' },
      { timestamp: 45, text: 'Understanding components and JSX syntax' },
    ],
    quizQuestions: [
      {
        id: 'q2',
        question: 'What does JSX stand for?',
        options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript eXtension'],
        correctAnswer: 0,
        explanation: 'JSX stands for JavaScript XML, allowing you to write HTML-like syntax in JavaScript.',
        difficulty: 'medium',
      },
    ],
    prerequisites: ['js-basics-1'],
    learningObjectives: ['Create React components', 'Write JSX syntax', 'Understand virtual DOM'],
  },
  {
    id: 'algorithms-sorting',
    title: 'Sorting Algorithms: Bubble Sort and Quick Sort',
    description: 'Master fundamental sorting algorithms with visual explanations and implementation.',
    duration: 3000, // 50 minutes
    difficulty: 'advanced',
    subjects: ['Algorithms', 'Computer Science'],
    videoUrl: 'https://www.youtube.com/watch?v=kPRA0W1kECg', // Sorting Algorithms Explained
    thumbnailUrl: 'https://images.pexels.com/photos/11035540/pexels-photo-11035540.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [
      { timestamp: 0, text: 'Today we explore sorting algorithms' },
      { timestamp: 60, text: 'Starting with bubble sort implementation' },
    ],
    quizQuestions: [
      {
        id: 'q3',
        question: 'What is the time complexity of bubble sort in the worst case?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correctAnswer: 2,
        explanation: 'Bubble sort has O(n²) time complexity in the worst case due to nested loops.',
        difficulty: 'hard',
      },
    ],
    prerequisites: ['js-basics-1'],
    learningObjectives: ['Implement sorting algorithms', 'Analyze time complexity', 'Compare algorithm efficiency'],
  },
  {
    id: 'python-basics',
    title: 'Python Programming Fundamentals',
    description: 'Learn Python programming from scratch with practical examples.',
    duration: 2700, // 45 minutes
    difficulty: 'beginner',
    subjects: ['Python', 'Programming'],
    videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', // Python Tutorial for Beginners
    thumbnailUrl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [
      { timestamp: 0, text: 'Welcome to Python programming' },
      { timestamp: 30, text: 'Setting up Python environment' },
    ],
    quizQuestions: [
      {
        id: 'q4',
        question: 'Which of the following is the correct way to create a list in Python?',
        options: ['list = []', 'list = ()', 'list = {}', 'list = ""'],
        correctAnswer: 0,
        explanation: 'Square brackets [] are used to create lists in Python.',
        difficulty: 'easy',
      },
    ],
    prerequisites: [],
    learningObjectives: ['Understand Python syntax', 'Learn data structures', 'Write basic programs'],
  },
  {
    id: 'machine-learning-intro',
    title: 'Introduction to Machine Learning',
    description: 'Explore the fundamentals of machine learning and AI concepts.',
    duration: 3600, // 60 minutes
    difficulty: 'intermediate',
    subjects: ['Machine Learning', 'AI', 'Data Science'],
    videoUrl: 'https://www.youtube.com/watch?v=ukzFI9rgwfU', // Machine Learning Explained
    thumbnailUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [
      { timestamp: 0, text: 'Introduction to machine learning concepts' },
      { timestamp: 60, text: 'Types of machine learning algorithms' },
    ],
    quizQuestions: [
      {
        id: 'q5',
        question: 'What are the three main types of machine learning?',
        options: ['Supervised, Unsupervised, Reinforcement', 'Linear, Non-linear, Deep', 'Classification, Regression, Clustering', 'Training, Testing, Validation'],
        correctAnswer: 0,
        explanation: 'The three main types are Supervised, Unsupervised, and Reinforcement Learning.',
        difficulty: 'medium',
      },
    ],
    prerequisites: ['python-basics'],
    learningObjectives: ['Understand ML concepts', 'Learn algorithm types', 'Explore real-world applications'],
  },
  {
    id: 'web-development-html-css',
    title: 'Web Development: HTML & CSS Fundamentals',
    description: 'Build your first website with HTML and CSS from scratch.',
    duration: 2100, // 35 minutes
    difficulty: 'beginner',
    subjects: ['HTML', 'CSS', 'Web Development'],
    videoUrl: 'https://www.youtube.com/watch?v=mU6anWqZJcc', // HTML & CSS Tutorial
    thumbnailUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [
      { timestamp: 0, text: 'Welcome to web development' },
      { timestamp: 30, text: 'Understanding HTML structure' },
    ],
    quizQuestions: [
      {
        id: 'q6',
        question: 'Which HTML tag is used to create a hyperlink?',
        options: ['<link>', '<a>', '<href>', '<url>'],
        correctAnswer: 1,
        explanation: 'The <a> tag is used to create hyperlinks in HTML.',
        difficulty: 'easy',
      },
    ],
    prerequisites: [],
    learningObjectives: ['Create HTML structure', 'Style with CSS', 'Build responsive layouts'],
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
    { subject: 'Algorithms', progress: 2, total: 10 },
    { subject: 'CSS', progress: 5, total: 6 },
    { subject: 'Python', progress: 4, total: 8 },
    { subject: 'Machine Learning', progress: 1, total: 6 },
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

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    videoId: 'react-intro',
    title: 'Introduction to React: Components and JSX',
    reason: 'Based on your JavaScript mastery and visual learning preference',
    confidence: 0.92,
    category: 'next_lesson',
  },
  {
    id: 'rec-2',
    videoId: 'python-basics',
    title: 'Python Programming Fundamentals',
    reason: 'Expand your programming knowledge with Python',
    confidence: 0.85,
    category: 'next_lesson',
  },
  {
    id: 'rec-3',
    videoId: 'js-basics-1',
    title: 'JavaScript Fundamentals: Variables and Data Types',
    reason: 'Review detected - strengthen foundation based on recent struggles',
    confidence: 0.78,
    category: 'review',
  },
  {
    id: 'rec-4',
    videoId: 'machine-learning-intro',
    title: 'Introduction to Machine Learning',
    reason: 'Challenge yourself with advanced AI concepts',
    confidence: 0.65,
    category: 'challenge',
  },
  {
    id: 'rec-5',
    videoId: 'web-development-html-css',
    title: 'Web Development: HTML & CSS Fundamentals',
    reason: 'Perfect complement to your JavaScript skills',
    confidence: 0.88,
    category: 'related',
  },
];

export function generateMockProfile(assessmentResults: any): LearningProfile {
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