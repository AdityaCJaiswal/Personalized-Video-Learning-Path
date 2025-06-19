import React from 'react';
import { TrendingUp, Eye, Brain, Target, Clock, Users, BookOpen, Award } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export function AnalyticsView() {
  const { state } = useLearning();

  if (!state.analytics || !state.currentProfile) return null;

  const engagementData = [
    { metric: 'Watch Time', value: state.analytics.engagementMetrics.averageWatchTime, color: '#3b82f6' },
    { metric: 'Completion', value: state.analytics.engagementMetrics.completionRate, color: '#10b981' },
    { metric: 'Quiz Accuracy', value: state.analytics.engagementMetrics.quizAccuracy, color: '#f59e0b' },
    { metric: 'Replay Rate', value: state.analytics.engagementMetrics.replayRate, color: '#ef4444' },
  ];

  const learningPatterns = [
    { time: '6 AM', focus: 65, retention: 70 },
    { time: '9 AM', focus: 85, retention: 88 },
    { time: '12 PM', focus: 75, retention: 72 },
    { time: '3 PM', focus: 95, retention: 92 },
    { time: '6 PM', focus: 80, retention: 85 },
    { time: '9 PM', focus: 60, retention: 65 },
  ];

  const learningStyleData = [
    { style: 'Visual', value: state.currentProfile.learningStyle.visual, fullMark: 100 },
    { style: 'Auditory', value: state.currentProfile.learningStyle.auditory, fullMark: 100 },
    { style: 'Kinesthetic', value: state.currentProfile.learningStyle.kinesthetic, fullMark: 100 },
    { style: 'Reading', value: state.currentProfile.learningStyle.reading, fullMark: 100 },
  ];

  const adaptationMetrics = [
    { category: 'Content Difficulty', adaptation: 87, baseline: 60 },
    { category: 'Pacing Speed', adaptation: 92, baseline: 70 },
    { category: 'Learning Style', adaptation: 95, baseline: 50 },
    { category: 'Quiz Timing', adaptation: 78, baseline: 65 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Analytics</h1>
          <p className="text-gray-600">Detailed insights into your learning patterns and AI adaptation effectiveness</p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Watch Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {state.analytics.engagementMetrics.averageWatchTime}m
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% vs baseline</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {state.analytics.engagementMetrics.completionRate}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+18% vs baseline</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quiz Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {state.analytics.engagementMetrics.quizAccuracy}%
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Brain className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+15% vs baseline</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Adaptation Score</p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">Highly personalized</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Learning Patterns */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Learning Patterns</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={state.analytics.dailyWatchTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#3b82f6"
                    fill="url(#dailyGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Learning Efficiency Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">AI-Enhanced Learning Efficiency</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={state.analytics.learningEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Your learning efficiency has improved by <span className="font-semibold text-green-600">23%</span> since starting with AI personalization
            </p>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Optimal Learning Times */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Optimal Learning Times</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={learningPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Bar dataKey="focus" fill="#3b82f6" name="Focus Level" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="retention" fill="#10b981" name="Retention Rate" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-gray-600">Focus Level</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-gray-600">Retention Rate</span>
              </div>
            </div>
          </div>

          {/* AI Adaptation Effectiveness */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">AI Adaptation Effectiveness</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adaptationMetrics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="category" type="category" stroke="#6b7280" width={100} />
                  <Bar dataKey="baseline" fill="#e5e7eb" name="Before AI" radius={[0, 2, 2, 0]} />
                  <Bar dataKey="adaptation" fill="#3b82f6" name="With AI" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                <span className="text-gray-600">Before AI</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-gray-600">With AI Personalization</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}