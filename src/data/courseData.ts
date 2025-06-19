import { VideoContent, LearningProfile } from '../types';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  prerequisites: string[];
  learningPath: LearningPathNode[];
  tags: string[];
  isEnrolled?: boolean;
}

export interface LearningPathNode {
  id: string;
  title: string;
  description: string;
  videoIds: string[];
  prerequisites: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  isOptional: boolean;
  category: string;
}

// Expanded video library with more diverse content
export const videoLibrary: VideoContent[] = [
  // Computer Fundamentals Course
  {
    id: 'computer-basics',
    title: 'Computer Fundamentals: How Computers Work',
    description: 'Understand the basic principles of how computers operate and process information.',
    duration: 1500,
    difficulty: 'beginner',
    subjects: ['Computer Science', 'Computer Fundamentals', 'Technology'],
    videoUrl: 'mCq8-xTH7jA', // Direct video ID
    thumbnailUrl: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q1',
        question: 'What is the main function of a CPU?',
        options: ['Store data', 'Process instructions', 'Display graphics', 'Connect to internet'],
        correctAnswer: 1,
        explanation: 'The CPU (Central Processing Unit) is responsible for processing instructions and performing calculations.',
        difficulty: 'easy',
      },
    ],
    prerequisites: [],
    learningObjectives: ['Understand computer components', 'Learn how data is processed', 'Explore computer architecture'],
  },
  {
    id: 'binary-numbers',
    title: 'Binary Numbers and Data Representation',
    description: 'Learn how computers represent and process data using binary numbers.',
    duration: 1800,
    difficulty: 'beginner',
    subjects: ['Computer Science', 'Computer Fundamentals', 'Mathematics'],
    videoUrl: '1GSjbWt0c9M', // Direct video ID
    thumbnailUrl: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q2',
        question: 'What is the binary representation of the decimal number 5?',
        options: ['101', '110', '011', '100'],
        correctAnswer: 0,
        explanation: 'The decimal number 5 is represented as 101 in binary (4 + 0 + 1 = 5).',
        difficulty: 'easy',
      },
    ],
    prerequisites: ['computer-basics'],
    learningObjectives: ['Understand binary system', 'Convert between number systems', 'Learn data representation'],
  },
  {
    id: 'algorithms-intro',
    title: 'Introduction to Algorithms and Problem Solving',
    description: 'Discover the fundamentals of algorithms and computational thinking.',
    duration: 2100,
    difficulty: 'beginner',
    subjects: ['Computer Science', 'Algorithms', 'Problem Solving'],
    videoUrl: '6hfOvs8pY1k', // Direct video ID
    thumbnailUrl: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q3',
        question: 'What is an algorithm?',
        options: ['A computer program', 'A step-by-step procedure to solve a problem', 'A type of computer', 'A programming language'],
        correctAnswer: 1,
        explanation: 'An algorithm is a step-by-step procedure or set of rules to solve a problem or complete a task.',
        difficulty: 'easy',
      },
    ],
    prerequisites: ['binary-numbers'],
    learningObjectives: ['Understand algorithms', 'Learn problem-solving techniques', 'Practice logical thinking'],
  },
  // JavaScript Fundamentals Course
  {
    id: 'js-intro',
    title: 'JavaScript Introduction: What is Programming?',
    description: 'Start your programming journey with JavaScript basics and understand what programming really means.',
    duration: 1200,
    difficulty: 'beginner',
    subjects: ['JavaScript', 'Programming Fundamentals'],
    videoUrl: 'W6NZfCO5SIk', // Direct video ID
    thumbnailUrl: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q4',
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
    videoUrl: '9emXNzqCKyg', // Direct video ID for testing
    thumbnailUrl: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q5',
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
    id: 'js-functions',
    title: 'JavaScript Functions and Scope',
    description: 'Learn to create reusable code with functions and understand variable scope.',
    duration: 2100,
    difficulty: 'beginner',
    subjects: ['JavaScript', 'Programming Fundamentals'],
    videoUrl: 'N8ap4k_1QEQ', // Direct video ID
    thumbnailUrl: 'https://images.pexels.com/photos/11035540/pexels-photo-11035540.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q6',
        question: 'What is the correct syntax for a function declaration?',
        options: ['function myFunc() {}', 'func myFunc() {}', 'def myFunc() {}', 'function: myFunc() {}'],
        correctAnswer: 0,
        explanation: 'Function declarations start with the function keyword followed by the name.',
        difficulty: 'easy',
      },
    ],
    prerequisites: ['js-variables'],
    learningObjectives: ['Create functions', 'Understand scope', 'Use parameters and return values'],
  },
  {
    id: 'react-intro',
    title: 'Introduction to React: What and Why?',
    description: 'Understand what React is, why it exists, and how it revolutionizes web development.',
    duration: 1800,
    difficulty: 'intermediate',
    subjects: ['React', 'Frontend Development'],
    videoUrl: 'Tn6-PIqc4UM', // Direct video ID
    thumbnailUrl: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q7',
        question: 'What is React?',
        options: ['A database', 'A JavaScript library for building UIs', 'A web server', 'A CSS framework'],
        correctAnswer: 1,
        explanation: 'React is a JavaScript library specifically designed for building user interfaces.',
        difficulty: 'easy',
      },
    ],
    prerequisites: ['js-functions'],
    learningObjectives: ['Understand React concepts', 'Learn component-based architecture', 'Set up React environment'],
  },
  {
    id: 'python-intro',
    title: 'Python Introduction: Your First Programming Language',
    description: 'Start your programming journey with Python, one of the most beginner-friendly languages.',
    duration: 1500,
    difficulty: 'beginner',
    subjects: ['Python', 'Programming Fundamentals'],
    videoUrl: 'rfscVS0vtbw', // Direct video ID
    thumbnailUrl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q8',
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
    videoUrl: 'mU6anWqZJcc', // Direct video ID
    thumbnailUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q9',
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
    videoUrl: '1PnVor36_40', // Direct video ID
    thumbnailUrl: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    transcripts: [],
    quizQuestions: [
      {
        id: 'q10',
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

// Course definitions with learning paths - FIXED VIDEO IDS
export const courses: Course[] = [
  {
    id: 'computer-fundamentals',
    title: 'Computer Fundamentals',
    description: 'Master the basics of how computers work and computational thinking',
    category: 'Computer Science',
    difficulty: 'beginner',
    estimatedHours: 8,
    prerequisites: [],
    tags: ['computer', 'fundamentals', 'basics', 'science', 'technology', 'computing', 'cs'],
    learningPath: [
      {
        id: 'computer-basics-module',
        title: 'Computer Basics',
        description: 'Learn how computers work and process information',
        videoIds: ['computer-basics', 'binary-numbers'], // Fixed: These IDs now match the video library
        prerequisites: [],
        difficulty: 'beginner',
        estimatedMinutes: 55,
        isOptional: false,
        category: 'fundamentals',
      },
      {
        id: 'algorithms-module',
        title: 'Introduction to Algorithms',
        description: 'Understand algorithms and problem-solving techniques',
        videoIds: ['algorithms-intro'], // Fixed: This ID now matches the video library
        prerequisites: ['computer-basics-module'],
        difficulty: 'beginner',
        estimatedMinutes: 35,
        isOptional: false,
        category: 'problem-solving',
      },
    ],
  },
  {
    id: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'Master the basics of JavaScript programming from scratch',
    category: 'Programming',
    difficulty: 'beginner',
    estimatedHours: 12,
    prerequisites: [],
    tags: ['javascript', 'programming', 'web-development', 'fundamentals', 'js', 'coding'],
    learningPath: [
      {
        id: 'js-basics',
        title: 'JavaScript Basics',
        description: 'Learn the fundamentals of JavaScript programming',
        videoIds: ['js-intro', 'js-variables'], // Fixed: These IDs now match the video library
        prerequisites: [],
        difficulty: 'beginner',
        estimatedMinutes: 50,
        isOptional: false,
        category: 'fundamentals',
      },
      {
        id: 'js-functions-module',
        title: 'Functions and Control Flow',
        description: 'Master functions and program control',
        videoIds: ['js-functions'], // Fixed: This ID now matches the video library
        prerequisites: ['js-basics'],
        difficulty: 'beginner',
        estimatedMinutes: 35,
        isOptional: false,
        category: 'core-concepts',
      },
    ],
  },
  {
    id: 'react-development',
    title: 'React Development',
    description: 'Build modern web applications with React',
    category: 'Frontend',
    difficulty: 'intermediate',
    estimatedHours: 15,
    prerequisites: ['javascript-fundamentals'],
    tags: ['react', 'frontend', 'components', 'hooks', 'javascript', 'ui', 'web'],
    learningPath: [
      {
        id: 'react-foundations',
        title: 'React Foundations',
        description: 'Understand React and component-based architecture',
        videoIds: ['react-intro'], // Fixed: This ID now matches the video library
        prerequisites: [],
        difficulty: 'intermediate',
        estimatedMinutes: 30,
        isOptional: false,
        category: 'foundations',
      },
    ],
  },
  {
    id: 'python-programming',
    title: 'Python Programming',
    description: 'Learn Python programming from the ground up',
    category: 'Programming',
    difficulty: 'beginner',
    estimatedHours: 10,
    prerequisites: [],
    tags: ['python', 'programming', 'beginner-friendly', 'fundamentals', 'coding', 'scripting'],
    learningPath: [
      {
        id: 'python-basics',
        title: 'Python Basics',
        description: 'Get started with Python programming',
        videoIds: ['python-intro'], // Fixed: This ID now matches the video library
        prerequisites: [],
        difficulty: 'beginner',
        estimatedMinutes: 25,
        isOptional: false,
        category: 'fundamentals',
      },
    ],
  },
  {
    id: 'web-development-basics',
    title: 'Web Development Basics',
    description: 'Learn the foundations of web development',
    category: 'Web Development',
    difficulty: 'beginner',
    estimatedHours: 8,
    prerequisites: [],
    tags: ['html', 'css', 'web-development', 'frontend', 'basics', 'web', 'markup', 'styling'],
    learningPath: [
      {
        id: 'web-foundations',
        title: 'Web Foundations',
        description: 'HTML and CSS basics',
        videoIds: ['html-basics', 'css-basics'], // Fixed: These IDs now match the video library
        prerequisites: [],
        difficulty: 'beginner',
        estimatedMinutes: 65,
        isOptional: false,
        category: 'foundations',
      },
    ],
  },
];

// Helper functions for personalization
export function getCoursesForUser(profile: LearningProfile): Course[] {
  console.log('Getting courses for user profile:', profile);
  
  const userSubjects = profile.subjects.map(s => s.toLowerCase());
  const userLevel = profile.knowledgeLevel.level;
  
  console.log('User subjects:', userSubjects);
  console.log('User level:', userLevel);
  
  // More precise matching - user must have explicitly selected these interests
  const matchedCourses = courses.filter(course => {
    // Enhanced subject matching with stricter criteria
    const subjectMatch = userSubjects.some(userSubject => {
      const userSubjectLower = userSubject.toLowerCase();
      
      // Direct subject matches
      if (course.tags.some(tag => userSubjectLower.includes(tag.toLowerCase()))) {
        return true;
      }
      
      // Specific mappings for better precision
      const subjectMappings: { [key: string]: string[] } = {
        'computer fundamentals': ['computer-fundamentals'],
        'computer science': ['computer-fundamentals'],
        'technology': ['computer-fundamentals'],
        'programming fundamentals': ['javascript-fundamentals', 'python-programming'],
        'javascript': ['javascript-fundamentals'],
        'web development': ['web-development-basics', 'javascript-fundamentals'],
        'html': ['web-development-basics'],
        'css': ['web-development-basics'],
        'react': ['react-development'],
        'python': ['python-programming'],
      };
      
      for (const [key, courseIds] of Object.entries(subjectMappings)) {
        if (userSubjectLower.includes(key) && courseIds.includes(course.id)) {
          return true;
        }
      }
      
      return false;
    });
    
    // Check if course difficulty is appropriate
    const difficultyMatch = isDifficultyAppropriate(course.difficulty, userLevel);
    
    console.log(`Course ${course.title}: subjectMatch=${subjectMatch}, difficultyMatch=${difficultyMatch}`);
    
    return subjectMatch && difficultyMatch;
  });
  
  console.log('Matched courses:', matchedCourses);
  return matchedCourses;
}

export function getVideosForCourse(courseId: string): VideoContent[] {
  const course = courses.find(c => c.id === courseId);
  if (!course) return [];
  
  const videoIds = course.learningPath.flatMap(node => node.videoIds);
  return videoLibrary.filter(video => videoIds.includes(video.id));
}

export function getNextVideoInPath(courseId: string, completedVideoIds: string[]): VideoContent | null {
  const course = courses.find(c => c.id === courseId);
  if (!course) return null;
  
  for (const node of course.learningPath) {
    // Check if prerequisites are met
    const prerequisitesMet = node.prerequisites.length === 0 || 
      node.prerequisites.every(prereq => {
        const prereqNode = course.learningPath.find(n => n.id === prereq);
        return prereqNode ? prereqNode.videoIds.every(id => completedVideoIds.includes(id)) : true;
      });
    
    if (prerequisitesMet) {
      // Find first incomplete video in this node
      const incompleteVideo = node.videoIds.find(id => !completedVideoIds.includes(id));
      if (incompleteVideo) {
        return videoLibrary.find(v => v.id === incompleteVideo) || null;
      }
    }
  }
  
  return null;
}

export function generatePersonalizedLearningPath(
  profile: LearningProfile, 
  completedVideoIds: string[]
): LearningPathNode[] {
  const userCourses = getCoursesForUser(profile);
  const personalizedPath: LearningPathNode[] = [];
  
  for (const course of userCourses) {
    for (const node of course.learningPath) {
      // Check if node is accessible
      const prerequisitesMet = node.prerequisites.length === 0 || 
        node.prerequisites.every(prereq => {
          const prereqNode = course.learningPath.find(n => n.id === prereq);
          return prereqNode ? prereqNode.videoIds.every(id => completedVideoIds.includes(id)) : true;
        });
      
      // Determine node status
      const completedVideos = node.videoIds.filter(id => completedVideoIds.includes(id));
      const isCompleted = completedVideos.length === node.videoIds.length;
      const isInProgress = completedVideos.length > 0 && !isCompleted;
      const isAvailable = prerequisitesMet && !isCompleted;
      
      personalizedPath.push({
        ...node,
        id: `${course.id}-${node.id}`,
        title: `${course.title}: ${node.title}`,
        // Add status information for UI
        ...{
          status: isCompleted ? 'completed' : isInProgress ? 'in-progress' : isAvailable ? 'available' : 'locked',
          courseId: course.id,
          completedVideos: completedVideos.length,
          totalVideos: node.videoIds.length,
        }
      });
    }
  }
  
  return personalizedPath;
}

function isDifficultyAppropriate(courseDifficulty: string, userLevel: string): boolean {
  const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
  const courseIndex = difficultyOrder.indexOf(courseDifficulty);
  const userIndex = difficultyOrder.indexOf(userLevel);
  
  // Allow same level or one level up
  return courseIndex <= userIndex + 1;
}

export function getRecommendedCourses(profile: LearningProfile): Course[] {
  console.log('Getting recommended courses for profile:', profile);
  
  // Get all courses that match user interests but aren't enrolled
  const allRelevantCourses = courses.filter(course => {
    const userSubjects = profile.subjects.map(s => s.toLowerCase());
    
    return course.tags.some(tag => 
      userSubjects.some(subject => 
        subject.includes(tag.toLowerCase()) || tag.toLowerCase().includes(subject)
      )
    ) && isDifficultyAppropriate(course.difficulty, profile.knowledgeLevel.level);
  });
  
  // Sort by relevance and difficulty appropriateness
  const recommended = allRelevantCourses.sort((a, b) => {
    // Prioritize courses that match user's exact level
    const aLevelMatch = a.difficulty === profile.knowledgeLevel.level ? 1 : 0;
    const bLevelMatch = b.difficulty === profile.knowledgeLevel.level ? 1 : 0;
    
    if (aLevelMatch !== bLevelMatch) {
      return bLevelMatch - aLevelMatch;
    }
    
    // Then by subject relevance
    const aSubjectMatch = a.tags.filter(tag => 
      profile.subjects.some(subject => subject.toLowerCase().includes(tag))
    ).length;
    const bSubjectMatch = b.tags.filter(tag => 
      profile.subjects.some(subject => subject.toLowerCase().includes(tag))
    ).length;
    
    return bSubjectMatch - aSubjectMatch;
  });
  
  console.log('Recommended courses:', recommended);
  return recommended;
}

// Function to mark courses as enrolled based on user activity
export function getEnrolledCourses(profile: LearningProfile, watchHistory: any[]): string[] {
  const watchedVideoIds = watchHistory.map(session => session.videoId);
  const enrolledCourseIds: string[] = [];
  
  for (const course of courses) {
    const courseVideoIds = course.learningPath.flatMap(node => node.videoIds);
    const hasWatchedCourseVideo = courseVideoIds.some(videoId => watchedVideoIds.includes(videoId));
    
    if (hasWatchedCourseVideo) {
      enrolledCourseIds.push(course.id);
    }
  }
  
  // Also include courses that match user's selected subjects (auto-enroll based on assessment)
  const userCourses = getCoursesForUser(profile);
  userCourses.forEach(course => {
    if (!enrolledCourseIds.includes(course.id)) {
      enrolledCourseIds.push(course.id);
    }
  });
  
  return enrolledCourseIds;
}