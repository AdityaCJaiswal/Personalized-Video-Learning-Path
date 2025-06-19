import React, { useEffect, useState } from 'react';
import { Play, Clock, Target, TrendingUp, Star, BookOpen, Award, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { PersonalizedLearningEngine } from '../../services/personalizedLearningEngine';
import { getCoursesForUser, getRecommendedCourses, getEnrolledCourses } from '../../data/courseData';
import { mockVideoLibrary, generateMockRecommendations } from '../../data/mockData';
import { apiService } from '../../services/apiService';

interface PersonalizedDashboardProps {
  onVideoSelect: (videoId: string) => void;
  onCourseSelect: (courseId: string) => void;
}

export function PersonalizedDashboard({ onVideoSelect, onCourseSelect }: PersonalizedDashboardProps) {
  const { state, dispatch } = useLearning();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');

  useEffect(() => {
    if (state.currentProfile) {
      console.log('Profile available, generating content...', state.currentProfile);
      testBackendAndGenerateContent();
    }
  }, [state.currentProfile, state.watchHistory, dispatch]);

  const testBackendAndGenerateContent = async () => {
    if (!state.currentProfile) return;

    setIsLoading(true);
    setBackendStatus('testing');
    
    try {
      // Test backend connection
      const connectionTest = await apiService.testConnection();
      
      if (connectionTest.success) {
        console.log('✅ Backend connected successfully!');
        setBackendStatus('connected');
        
        // Try to get recommendations from backend
        try {
          const backendRecommendations = await apiService.getRecommendations(state.currentProfile.id);
          console.log('Backend recommendations:', backendRecommendations);
          
          if (backendRecommendations.success && backendRecommendations.data) {
            setRecommendations(backendRecommendations.data);
            dispatch({ type: 'UPDATE_RECOMMENDATIONS', payload: backendRecommendations.data });
          } else {
            throw new Error('No recommendations from backend');
          }
        } catch (error) {
          console.log('Backend recommendations failed, using mock data:', error);
          generateMockContent();
        }
      } else {
        throw new Error('Backend connection failed');
      }
    } catch (error) {
      console.log('❌ Backend not available, using mock data:', error);
      setBackendStatus('disconnected');
      generateMockContent();
    }
  };

  const generateMockContent = () => {
    if (!state.currentProfile) return;

    try {
      // Generate recommendations
      const mockRecs = generateMockRecommendations(state.currentProfile);
      console.log('Generated mock recommendations:', mockRecs);
      setRecommendations(mockRecs);
      dispatch({ type: 'UPDATE_RECOMMENDATIONS', payload: mockRecs });

      // Get enrolled courses
      const enrolledCourseIds = getEnrolledCourses(state.currentProfile, state.watchHistory);
      const userCourses = getCoursesForUser(state.currentProfile);
      const enrolled = userCourses.filter(course => enrolledCourseIds.includes(course.id));
      console.log('Enrolled courses:', enrolled);
      setEnrolledCourses(enrolled);

      // Get available courses
      const allRecommended = getRecommendedCourses(state.currentProfile);
      const available = allRecommended.filter(course => !enrolledCourseIds.includes(course.id));
      console.log('Available courses:', available);
      setAvailableCourses(available);

    } catch (error) {
      console.error('Error generating mock content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!state.currentProfile) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Assessment</h2>
          <p className="text-gray-600">Please complete the learning style assessment to see your personalized dashboard.</p>
        </div>
      </div>
    );
  }

  const courseProgress = PersonalizedLearningEngine.getCurrentCourseProgress(
    state.currentProfile,
    state.watchHistory
  );

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
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Section with Backend Status */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {state.currentProfile.name}!
            </h1>
            <p className="text-gray-600">
              Continue your personalized learning journey. You're on a {state.currentProfile.progress.streakDays} day streak!
            </p>
          </div>
          
          {/* Backend Status Indicator */}
          <div className="flex items-center space-x-2">
            {backendStatus === 'connected' && (
              <>
                <Wifi className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Backend Connected</span>
              </>
            )}
            {backendStatus === 'disconnected' && (
              <>
                <WifiOff className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-orange-600 font-medium">Demo Mode</span>
              </>
            )}
            {backendStatus === 'testing' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-600 font-medium">Connecting...</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized content...</p>
        </div>
      )}

      {!isLoading && (
        <>
          {/* My Courses (Enrolled) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
              <span className="text-sm text-gray-500">{enrolledCourses.length} enrolled</span>
            </div>
            
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.map((course) => {
                  const progress = courseProgress[course.id] || { completed: 0, total: 0, percentage: 0 };
                  return (
                    <div
                      key={course.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                      onClick={() => onCourseSelect(course.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{course.title}</h3>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{progress.completed}/{progress.total} lessons</span>
                          <span>{progress.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">{course.estimatedHours}h total</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to start learning?</h3>
                <p className="text-gray-600 mb-4">Based on your assessment, we've found perfect courses for you below!</p>
              </div>
            )}
          </div>

          {/* Personalized Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
              <div className="flex items-center space-x-2">
                {backendStatus === 'connected' && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">AI-powered</span>
                )}
                <span className="text-sm text-gray-500">
                  {backendStatus === 'connected' ? 'Live recommendations' : 'Demo suggestions'}
                </span>
              </div>
            </div>
            
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.slice(0, 4).map((rec) => {
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
                        className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-medium text-gray-900 line-clamp-2">{video.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ml-2 flex-shrink-0 ${
                            rec.category === 'next_lesson' ? 'bg-blue-100 text-blue-800' :
                            rec.category === 'review' ? 'bg-orange-100 text-orange-800' :
                            rec.category === 'challenge' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rec.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{rec.reason}</p>
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
                      <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
                        <Play className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generating recommendations...</h3>
                <p className="text-gray-600">We're analyzing your learning style to create personalized suggestions</p>
              </div>
            )}
          </div>

          {/* Discover New Courses */}
          {availableCourses.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Discover New Courses</h2>
                <span className="text-sm text-gray-500">Based on your interests</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCourses.slice(0, 4).map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                    onClick={() => onCourseSelect(course.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{course.title}</h3>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">New</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{course.estimatedHours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Watch Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(state.currentProfile.progress.totalWatchTime / 60)}m
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {state.currentProfile.progress.completedVideos}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Backend Status</p>
                  <p className="text-lg font-bold text-gray-900">
                    {backendStatus === 'connected' ? 'Live' : 'Demo'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  backendStatus === 'connected' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {backendStatus === 'connected' ? (
                    <Wifi className="h-6 w-6 text-green-600" />
                  ) : (
                    <WifiOff className="h-6 w-6 text-orange-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}