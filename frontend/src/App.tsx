import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LearningProvider, useLearning } from './context/LearningContext';
import { AuthForm } from './components/Auth/AuthForm';
import { LearningStyleAssessment } from './components/Assessment/LearningStyleAssessment';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { YouTubeVideoPlayer } from './components/Video/YouTubeVideoPlayer';
import { ProgressView } from './components/Progress/ProgressView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { mockVideoLibrary, mockAnalytics, mockRecommendations, generateMockProfile } from './data/mockData';
import { PersonalizationEngine } from './services/personalizationEngine';
import { AIRecommendationEngine } from './services/aiRecommendationEngine';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { state, dispatch } = useLearning();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Initialize mock data
  useEffect(() => {
    if (user && !state.analytics) {
      dispatch({ type: 'SET_ANALYTICS', payload: mockAnalytics });
      dispatch({ type: 'UPDATE_RECOMMENDATIONS', payload: mockRecommendations });
    }
  }, [user, state.analytics, dispatch]);

  // Handle video selection from learning tree
  useEffect(() => {
    const handleVideoSelect = (event: CustomEvent) => {
      const { videoId } = event.detail;
      handleVideoSelectInternal(videoId);
    };

    window.addEventListener('videoSelect', handleVideoSelect as EventListener);
    return () => {
      window.removeEventListener('videoSelect', handleVideoSelect as EventListener);
    };
  }, [state.currentProfile]);

  // Generate AI-powered recommendations when behavior patterns change
  useEffect(() => {
    if (state.currentProfile && state.realTimeAnalytics.length > 0 && state.behaviorPattern) {
      generateAIRecommendations();
    }
  }, [state.realTimeAnalytics, state.behaviorPattern]);

  const handleAssessmentComplete = (assessmentResults: any) => {
    const profile = generateMockProfile(assessmentResults);
    dispatch({ type: 'SET_PROFILE', payload: profile });
    dispatch({ type: 'COMPLETE_ASSESSMENT' });
    
    // Generate initial recommendations
    const recommendations = PersonalizationEngine.generateRecommendations(
      profile,
      mockVideoLibrary,
      []
    );
    dispatch({ type: 'UPDATE_RECOMMENDATIONS', payload: recommendations });
  };

  const handleVideoSelectInternal = (videoId: string) => {
    const video = mockVideoLibrary.find(v => v.id === videoId);
    if (video && state.currentProfile) {
      const adaptedVideo = PersonalizationEngine.adaptVideoContent(video, state.currentProfile);
      dispatch({ type: 'SET_CURRENT_VIDEO', payload: adaptedVideo });
      setActiveTab('learn');
    }
  };

  const generateAIRecommendations = async () => {
    if (!state.currentProfile || !state.behaviorPattern) return;

    try {
      const context = {
        userProfile: state.currentProfile,
        behaviorPattern: state.behaviorPattern,
        recentAnalytics: state.realTimeAnalytics.slice(-5), // Last 5 analytics
        watchHistory: state.watchHistory,
        currentStruggleAreas: state.behaviorPattern.strugglingTopics || [],
        learningGoals: state.currentProfile.subjects,
        timeConstraints: {
          availableTime: 60, // Default 60 minutes
          preferredSessionLength: state.behaviorPattern.optimalSessionLength || 30,
        },
      };

      const aiRecommendations = AIRecommendationEngine.generatePersonalizedRecommendations(
        context,
        mockVideoLibrary
      );

      dispatch({ type: 'UPDATE_RECOMMENDATIONS', payload: aiRecommendations });
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    }
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
        return <Dashboard onVideoSelect={handleVideoSelectInternal} />;
      case 'learn':
        return <YouTubeVideoPlayer />;
      case 'progress':
        return <ProgressView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <Dashboard onVideoSelect={handleVideoSelectInternal} />;
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