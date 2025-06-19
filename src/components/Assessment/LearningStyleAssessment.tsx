import React, { useState } from 'react';
import { Brain, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface AssessmentProps {
  onComplete: (results: any) => void;
}

const assessmentQuestions = [
  {
    id: 'q1',
    question: 'When learning something new, I prefer to:',
    options: [
      { text: 'See diagrams, charts, or visual demonstrations', style: 'visual', weight: 3 },
      { text: 'Listen to explanations and discussions', style: 'auditory', weight: 3 },
      { text: 'Practice hands-on activities immediately', style: 'kinesthetic', weight: 3 },
      { text: 'Read detailed instructions and notes', style: 'reading', weight: 3 },
    ],
  },
  {
    id: 'q2',
    question: 'I remember information best when:',
    options: [
      { text: 'I can visualize it in my mind', style: 'visual', weight: 2 },
      { text: 'I hear it explained aloud', style: 'auditory', weight: 2 },
      { text: 'I write it down or take notes', style: 'reading', weight: 2 },
      { text: 'I can connect it to real experiences', style: 'kinesthetic', weight: 2 },
    ],
  },
  {
    id: 'q3',
    question: 'During a presentation, I focus most on:',
    options: [
      { text: 'The slides and visual content', style: 'visual', weight: 2 },
      { text: 'The speaker\'s voice and tone', style: 'auditory', weight: 2 },
      { text: 'Taking detailed notes', style: 'reading', weight: 2 },
      { text: 'How I can apply the information', style: 'kinesthetic', weight: 2 },
    ],
  },
  {
    id: 'q4',
    question: 'What\'s your current experience level with technology and computers?',
    options: [
      { text: 'Complete beginner - I want to learn the basics', level: 'beginner', weight: 1 },
      { text: 'Some basic knowledge - I know a little', level: 'beginner', weight: 1 },
      { text: 'Intermediate understanding - I\'m comfortable with basics', level: 'intermediate', weight: 1 },
      { text: 'Advanced experience - I want to deepen my knowledge', level: 'advanced', weight: 1 },
    ],
  },
  {
    id: 'q5',
    question: 'Which topics are you most interested in learning about?',
    options: [
      { text: 'Computer Fundamentals & How Technology Works', subjects: ['Computer Fundamentals', 'Computer Science', 'Technology'], weight: 1 },
      { text: 'Programming & Software Development', subjects: ['JavaScript', 'Programming Fundamentals', 'Python'], weight: 1 },
      { text: 'Web Development & Creating Websites', subjects: ['Web Development', 'HTML', 'CSS', 'JavaScript'], weight: 1 },
      { text: 'All of the above - I want a comprehensive foundation', subjects: ['Computer Fundamentals', 'JavaScript', 'Web Development', 'Programming Fundamentals'], weight: 1 },
    ],
  },
];

export function LearningStyleAssessment({ onComplete }: AssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);

  const handleAnswer = (questionId: string, option: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleNameSubmit = () => {
    if (name.trim()) {
      setShowNameInput(false);
    }
  };

  const calculateResults = () => {
    const styles = { visual: 0, auditory: 0, kinesthetic: 0, reading: 0 };
    let level = 'beginner';
    let subjects = ['Computer Fundamentals', 'JavaScript'];

    Object.values(answers).forEach((answer: any) => {
      if (answer.style) {
        styles[answer.style as keyof typeof styles] += answer.weight;
      }
      if (answer.level) {
        level = answer.level;
      }
      if (answer.subjects) {
        subjects = answer.subjects;
      }
    });

    const dominant = Object.entries(styles).reduce((a, b) => 
      styles[a[0] as keyof typeof styles] > styles[b[0] as keyof typeof styles] ? a : b
    )[0];

    const results = {
      name,
      ...styles,
      dominant,
      level,
      subjects,
    };

    console.log('Assessment results:', results);
    onComplete(results);
  };

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full inline-block mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AdaptiveLearn</h1>
            <p className="text-gray-600">Let's personalize your learning experience</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                What's your name?
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your name"
                onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              />
            </div>
            <button
              onClick={handleNameSubmit}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Start Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = assessmentQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Learning Style Assessment</h2>
            <span className="text-sm text-gray-500">
              {currentQuestion + 1} of {assessmentQuestions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">{question.question}</h3>
          <div className="grid gap-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, option)}
                className={`p-4 text-left border-2 rounded-lg transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 ${
                  answers[question.id] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    answers[question.id] === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[question.id] === option && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!answers[question.id]}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{currentQuestion === assessmentQuestions.length - 1 ? 'Complete' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}