import React from 'react';
import { Trophy, Target, Calendar, TrendingUp, Star, Clock } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { InteractiveLearningTree } from '../LearningTree/InteractiveLearningTree';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function ProgressView() {
  const { state } = useLearning();

  const handleVideoSelect = (videoId: string) => {
    // This will be handled by the parent component
    window.dispatchEvent(new CustomEvent('videoSelect', { detail: { videoId } }));
  };

  if (!state.currentProfile || !state.analytics) return null;

  const weeklyData = [
    { day: 'Mon', minutes: 45, goal: 60 },
    { day: 'Tue', minutes: 60, goal: 60 },
    { day: 'Wed', minutes: 30, goal: 60 },
    { day: 'Thu', minutes: 90, goal: 60 },
    { day: 'Fri', minutes: 75, goal: 60 },
    { day: 'Sat', minutes: 120, goal: 60 },
    { day: 'Sun', minutes: 55, goal: 60 },
  ];

  const achievements = [
    { id: 1, title: 'First Video', description: 'Completed your first video', icon: '🎯', date: '2 days ago' },
    { id: 2, title: 'Streak Master', description: '7 day learning streak', icon: '🔥', date: '1 day ago' },
    { id: 3, title: 'Quiz Champion', description: '90% quiz accuracy', icon: '🏆', date: 'Today' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
            <p className="text-gray-600">Monitor your learning journey and achievements</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Watch Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(state.currentProfile.progress.totalWatchTime / 60)} min
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Videos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {state.currentProfile.progress.completedVideos}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {state.currentProfile.progress.streakDays} days
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Progress</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="goal" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Learning Efficiency Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Learning Efficiency</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={state.analytics.learningEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#3b82f6"
                    fill="url(#efficiencyGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Subject Progress</h2>
            <div className="space-y-4">
              {state.analytics.subjectProgress.map((subject) => (
                <div key={subject.subject}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{subject.subject}</span>
                    <span className="text-sm text-gray-600">
                      {subject.progress}/{subject.total} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(subject.progress / subject.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements and Learning Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-800">Best Learning Time</span>
                  <span className="font-medium text-blue-900">2-4 PM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-800">Avg. Session Length</span>
                  <span className="font-medium text-green-900">42 min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-purple-800">Preferred Difficulty</span>
                  <span className="font-medium text-purple-900">Intermediate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Interactive Learning Tree */}
      <div className="w-80 border-l border-gray-200 bg-white p-4">
        <InteractiveLearningTree onVideoSelect={handleVideoSelect} />
      </div>
    </div>
  );
}