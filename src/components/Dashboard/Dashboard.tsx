import React from 'react';
import { Play, Clock, Target, TrendingUp, Star, BookOpen } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { InteractiveLearningTree } from '../LearningTree/InteractiveLearningTree';
import { mockVideoLibrary } from '../../data/mockData';

interface DashboardProps {
  onVideoSelect: (videoId: string) => void;
}

export function Dashboard({ onVideoSelect }: DashboardProps) {
  const { state } = useLearning();

  if (!state.currentProfile) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {state.currentProfile.name}!
            </h1>
            <p className="text-gray-600">
              Your personalized learning journey continues. You're on a {state.currentProfile.progress.streakDays} day streak!
            </p>
          </div>

          {/* Recommended Videos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
              <span className="text-sm text-gray-500">Personalized by AI</span>
            </div>
            
            <div className="space-y-4">
              {state.recommendations.slice(0, 3).map((rec) => {
                const video = mockVideoLibrary.find(v => v.id === rec.videoId);
                if (!video) return null;

                return (
                  <div
                    key={rec.id}
                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                    onClick={() => onVideoSelect(video.id)}
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {rec.reason}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(video.duration)}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${getDifficultyColor(video.difficulty)}`}>
                          {video.difficulty}
                        </span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {Math.round(rec.confidence * 100)}% match
                        </span>
                      </div>
                    </div>
                    <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Play className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Videos Library */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Video Library</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockVideoLibrary.map((video) => (
                <div
                  key={video.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                  onClick={() => onVideoSelect(video.id)}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(video.difficulty)}`}>
                      {video.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Learning Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Watch Time</span>
                  <span className="font-medium text-gray-900">
                    {Math.round(state.currentProfile.progress.totalWatchTime / 60)} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed Videos</span>
                  <span className="font-medium text-gray-900">
                    {state.currentProfile.progress.completedVideos}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Quiz Score</span>
                  <span className="font-medium text-gray-900">
                    {state.currentProfile.progress.averageQuizScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-medium text-blue-600">
                    {state.currentProfile.progress.streakDays} days
                  </span>
                </div>
              </div>
            </div>

            {/* Learning Style */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Learning Style</h3>
              <div className="space-y-3">
                {Object.entries(state.currentProfile.learningStyle).map(([style, value]) => {
                  if (style === 'dominant') return null;
                  const percentage = typeof value === 'number' ? value : 0;
                  return (
                    <div key={style}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-gray-600">{style}</span>
                        <span className="font-medium text-gray-900">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Your dominant style is <span className="font-medium text-blue-600 capitalize">
                  {state.currentProfile.learningStyle.dominant}
                </span>
              </p>
            </div>

            {/* Weekly Goal */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Goal</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Target</span>
                  <span className="font-medium text-gray-900">
                    {Math.round(state.currentProfile.progress.weeklyGoal / 60)} hours
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((state.currentProfile.progress.totalWatchTime / state.currentProfile.progress.weeklyGoal) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Keep going! You're making great progress.
                </p>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI Insights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">Learning Pattern</p>
                  <p className="text-xs text-blue-600">Best performance at 2-4 PM</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">Recommendation</p>
                  <p className="text-xs text-green-600">Ready for intermediate React</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium">Prediction</p>
                  <p className="text-xs text-purple-600">92% quiz success rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Interactive Learning Tree */}
      <div className="w-80 border-l border-gray-200 bg-white p-4">
        <InteractiveLearningTree onVideoSelect={onVideoSelect} />
      </div>
    </div>
  );
}