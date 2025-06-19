import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LearningProvider, useLearning } from './context/LearningContext';
import { AuthForm } from './components/Auth/AuthForm';
import { LearningStyleAssessment } from './components/Assessment/LearningStyleAssessment';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { PersonalizedDashboard } from './components/Dashboard/PersonalizedDashboard';
import { YouTubeVideoPlayer } from './components/Video/YouTubeVideoPlayer';
import { ProgressView } from './components/Progress/ProgressView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { PersonalizedLearningTree } from './components/LearningTree/PersonalizedLearningTree';
import { videoLibrary } from './data/courseData';
import { generateMockProfile, mockAnalytics } from './data/mockData';
import { PersonalizationEngine } from './services/personalizationEngine';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { state, dispatch } = useLearning();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>();

  // Initialize mock data
  useEffect(() => {
    if (user && !state.analytics) {
      dispatch({ type: 'SET_ANALYTICS', payload: mockAnalytics });
    }
  }, [user, state.analytics, dispatch]);

  const handleAssessmentComplete = (assessmentResults: any) => {
    const profile = generateMockProfile(assessmentResults);
    dispatch({ type: 'SET_PROFILE', payload: profile });
    dispatch({ type: 'COMPLETE_ASSESSMENT' });
  };

  const handleVideoSelect = (videoId: string) => {
    console.log('Video selected:', videoId);
    const video = videoLibrary.find(v => v.id === videoId);
    if (video) {
      console.log('Found video:', video);
      if (state.currentProfile) {
        const adaptedVideo = PersonalizationEngine.adaptVideoContent(video, state.currentProfile);
        dispatch({ type: 'SET_CURRENT_VIDEO', payload: adaptedVideo });
      } else {
        dispatch({ type: 'SET_CURRENT_VIDEO', payload: video });
      }
      setActiveTab('learn');
    } else {
      console.error('Video not found:', videoId);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    setActiveTab('progress'); // Show course progress when course is selected
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!user) {
    return <AuthForm />;
  }

  const renderMainContent = () => {
    if (!state.isAssessmentComplete || !state.currentProfile) {
      return <LearningStyleAssessment onComplete={handleAssessmentComplete} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <PersonalizedDashboard 
            onVideoSelect={handleVideoSelect}
            onCourseSelect={handleCourseSelect}
          />
        );
      case 'learn':
        return <YouTubeVideoPlayer />;
      case 'progress':
        return (
          <div className="flex h-screen bg-gray-50">
            <div className="flex-1">
              <ProgressView />
            </div>
            <div className="w-80 border-l border-gray-200 bg-white p-4">
              <PersonalizedLearningTree 
                onVideoSelect={handleVideoSelect} 
                isCompact 
                selectedCourse={selectedCourse}
              />
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="flex h-screen bg-gray-50">
            <div className="flex-1">
              <AnalyticsView />
            </div>
            <div className="w-80 border-l border-gray-200 bg-white p-4">
              <PersonalizedLearningTree 
                onVideoSelect={handleVideoSelect} 
                isCompact 
                selectedCourse={selectedCourse}
              />
            </div>
          </div>
        );
      default:
        return (
          <PersonalizedDashboard 
            onVideoSelect={handleVideoSelect}
            onCourseSelect={handleCourseSelect}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {state.isAssessmentComplete && state.currentProfile && <Header />}
      
      <div className="flex">
        {state.isAssessmentComplete && state.currentProfile && (
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        )}
        
        <main className={`flex-1 ${state.isAssessmentComplete && state.currentProfile ? 'ml-0' : ''}`}>
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LearningProvider>
        <AppContent />
      </LearningProvider>
    </AuthProvider>
  );
}

export default App;