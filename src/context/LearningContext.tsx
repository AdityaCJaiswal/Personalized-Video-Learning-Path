import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { LearningProfile, VideoContent, WatchSession, Recommendation, AnalyticsData } from '../types';

interface LearningState {
  currentProfile: LearningProfile | null;
  videoLibrary: VideoContent[];
  currentVideo: VideoContent | null;
  watchHistory: WatchSession[];
  recommendations: Recommendation[];
  analytics: AnalyticsData | null;
  isAssessmentComplete: boolean;
  realTimeAnalytics: any[];
  behaviorPattern: any;
}

type LearningAction =
  | { type: 'SET_PROFILE'; payload: LearningProfile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<LearningProfile> }
  | { type: 'SET_CURRENT_VIDEO'; payload: VideoContent }
  | { type: 'ADD_WATCH_SESSION'; payload: WatchSession }
  | { type: 'UPDATE_RECOMMENDATIONS'; payload: Recommendation[] }
  | { type: 'SET_ANALYTICS'; payload: AnalyticsData }
  | { type: 'UPDATE_LEARNING_ANALYTICS'; payload: any }
  | { type: 'UPDATE_BEHAVIOR_PATTERN'; payload: any }
  | { type: 'COMPLETE_ASSESSMENT' }
  | { type: 'RESET_PROFILE' };

const initialState: LearningState = {
  currentProfile: null,
  videoLibrary: [],
  currentVideo: null,
  watchHistory: [],
  recommendations: [],
  analytics: null,
  isAssessmentComplete: false,
  realTimeAnalytics: [],
  behaviorPattern: null,
};

const LearningContext = createContext<{
  state: LearningState;
  dispatch: React.Dispatch<LearningAction>;
} | null>(null);

function learningReducer(state: LearningState, action: LearningAction): LearningState {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, currentProfile: action.payload };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        currentProfile: state.currentProfile
          ? { ...state.currentProfile, ...action.payload }
          : null,
      };
    case 'SET_CURRENT_VIDEO':
      return { ...state, currentVideo: action.payload };
    case 'ADD_WATCH_SESSION':
      return {
        ...state,
        watchHistory: [...state.watchHistory, action.payload],
      };
    case 'UPDATE_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
    case 'UPDATE_LEARNING_ANALYTICS':
      return {
        ...state,
        realTimeAnalytics: [...state.realTimeAnalytics, action.payload],
      };
    case 'UPDATE_BEHAVIOR_PATTERN':
      return { ...state, behaviorPattern: action.payload };
    case 'COMPLETE_ASSESSMENT':
      return { ...state, isAssessmentComplete: true };
    case 'RESET_PROFILE':
      return { ...initialState };
    default:
      return state;
  }
}

export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(learningReducer, initialState);

  return (
    <LearningContext.Provider value={{ state, dispatch }}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
}