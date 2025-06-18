import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Settings, Maximize, RotateCcw, CheckCircle, SkipBack, SkipForward, Gauge } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { InteractiveLearningTree } from '../LearningTree/InteractiveLearningTree';
import { YouTubeService, YouTubeAnalytics } from '../../services/youtubeService';
import { Interaction } from '../../types';

export function YouTubeVideoPlayer() {
  const { state, dispatch } = useLearning();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState<YouTubeAnalytics | null>(null);
  const [realTimeInsights, setRealTimeInsights] = useState<string[]>([]);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const youtubeServiceRef = useRef<YouTubeService | null>(null);
  const progressUpdateRef = useRef<NodeJS.Timeout>();

  const video = state.currentVideo;

  const handleVideoSelect = (videoId: string) => {
    window.dispatchEvent(new CustomEvent('videoSelect', { detail: { videoId } }));
  };

  useEffect(() => {
    if (video && playerContainerRef.current) {
      initializeYouTubePlayer();
    }

    return () => {
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
      }
      setIsPlayerReady(false);
    };
  }, [video]);

  const initializeYouTubePlayer = async () => {
    if (!video || !playerContainerRef.current) return;

    // Reset player ready state
    setIsPlayerReady(false);

    // Extract YouTube video ID from URL or use the video ID directly
    const videoId = extractYouTubeVideoId(video.videoUrl) || video.id;

    try {
      youtubeServiceRef.current = new YouTubeService(
        handleAnalyticsUpdate,
        handleInteraction
      );

      await youtubeServiceRef.current.createPlayer('youtube-player', videoId, {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
        },
      });

      // Set player as ready after successful initialization
      setIsPlayerReady(true);

      // Start progress tracking
      startProgressTracking();
    } catch (error) {
      console.error('Failed to initialize YouTube player:', error);
      setIsPlayerReady(false);
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const startProgressTracking = () => {
    progressUpdateRef.current = setInterval(() => {
      if (youtubeServiceRef.current && isPlayerReady) {
        const current = youtubeServiceRef.current.getCurrentTime();
        const total = youtubeServiceRef.current.getDuration();
        
        setCurrentTime(current);
        setDuration(total);

        // Check for quiz triggers
        checkQuizTriggers(current, total);
        
        // Update learning session
        updateLearningSession(current, total);
      }
    }, 1000);
  };

  const handleAnalyticsUpdate = (newAnalytics: YouTubeAnalytics) => {
    setAnalytics(newAnalytics);
    generateRealTimeInsights(newAnalytics);
  };

  const handleInteraction = (interaction: Interaction) => {
    // Track interaction in learning context
    if (state.currentProfile) {
      // This would be sent to the backend for AI analysis
      console.log('User interaction:', interaction);
    }
  };

  const generateRealTimeInsights = (analytics: YouTubeAnalytics) => {
    const insights: string[] = [];

    if (analytics.engagementScore > 80) {
      insights.push('🔥 High engagement detected!');
    } else if (analytics.engagementScore < 40) {
      insights.push('💡 Consider taking a break or trying a different approach');
    }

    if (analytics.comprehensionSignals.strugglingSegments.length > 2) {
      insights.push('🤔 Detected difficulty - consider reviewing prerequisites');
    }

    if (analytics.comprehensionSignals.masteredSegments.length > 3) {
      insights.push('🎯 Great progress! Ready for advanced topics');
    }

    if (analytics.difficultyIndicators.speedChanges.length > 3) {
      insights.push('⚡ Adaptive learning detected - AI adjusting recommendations');
    }

    setRealTimeInsights(insights);
  };

  const checkQuizTriggers = (current: number, total: number) => {
    if (!video.quizQuestions.length) return;

    const progress = current / total;
    const shouldShowQuiz = progress > 0.25 && progress < 0.26 && !showQuiz;

    if (shouldShowQuiz) {
      setShowQuiz(true);
      if (youtubeServiceRef.current && isPlayerReady) {
        youtubeServiceRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const updateLearningSession = (current: number, total: number) => {
    if (!state.currentProfile || !youtubeServiceRef.current) return;

    const sessionData = youtubeServiceRef.current.getSessionData();
    const analytics = youtubeServiceRef.current.getAnalytics();

    // This would typically be sent to the backend
    const learningData = {
      userId: state.currentProfile.id,
      videoId: video?.id,
      currentTime: current,
      totalDuration: total,
      completionRate: current / total,
      engagementScore: analytics.engagementScore,
      comprehensionSignals: analytics.comprehensionSignals,
      interactions: sessionData.interactions || [],
    };

    // Update local state for immediate UI feedback
    dispatch({
      type: 'UPDATE_LEARNING_ANALYTICS',
      payload: learningData,
    });
  };

  const togglePlay = () => {
    if (!youtubeServiceRef.current || !isPlayerReady) return;

    if (isPlaying) {
      youtubeServiceRef.current.pause();
    } else {
      youtubeServiceRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (seconds: number) => {
    if (!youtubeServiceRef.current || !isPlayerReady) return;
    youtubeServiceRef.current.seekTo(seconds);
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!youtubeServiceRef.current || !isPlayerReady) return;
    youtubeServiceRef.current.setPlaybackRate(rate);
    setPlaybackRate(rate);
  };

  const handleQuizSubmit = () => {
    setShowQuiz(false);
    if (youtubeServiceRef.current && isPlayerReady) {
      youtubeServiceRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!video || !state.currentProfile) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Video Selected</h2>
            <p className="text-gray-600">Please select a video from the dashboard to start learning.</p>
          </div>
        </div>
        
        <div className="w-80 border-l border-gray-200 bg-white p-4">
          <InteractiveLearningTree onVideoSelect={handleVideoSelect} />
        </div>
      </div>
    );
  }

  const currentQuestion = video.quizQuestions[0];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Video Player Container */}
        <div className="relative bg-black flex-1" ref={playerContainerRef}>
          {/* YouTube Player */}
          <div id="youtube-player" className="w-full h-full"></div>

          {/* Player Loading Indicator */}
          {!isPlayerReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading player...</p>
              </div>
            </div>
          )}

          {/* Custom Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-white text-sm mb-2">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-1 bg-white/20 rounded-full h-2 cursor-pointer"
                     onClick={(e) => {
                       if (!isPlayerReady) return;
                       const rect = e.currentTarget.getBoundingClientRect();
                       const percent = (e.clientX - rect.left) / rect.width;
                       handleSeek(percent * duration);
                     }}>
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                  disabled={!isPlayerReady}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipBack className="h-5 w-5 text-white" />
                </button>

                <button
                  onClick={togglePlay}
                  disabled={!isPlayerReady}
                  className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white" />
                  )}
                </button>

                <button
                  onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                  disabled={!isPlayerReady}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipForward className="h-5 w-5 text-white" />
                </button>

                <div className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5 text-white" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    disabled={!isPlayerReady}
                    className="w-20 accent-red-600 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Playback Speed */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    disabled={!isPlayerReady}
                    className="p-2 text-white/80 hover:text-white transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Gauge className="h-5 w-5" />
                    <span className="text-sm">{playbackRate}x</span>
                  </button>
                  
                  {showSettings && isPlayerReady && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-[120px]">
                      <div className="text-white text-sm font-medium mb-2">Playback Speed</div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => {
                            handlePlaybackRateChange(rate);
                            setShowSettings(false);
                          }}
                          className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 ${
                            playbackRate === rate ? 'text-red-400' : 'text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  disabled={!isPlayerReady}
                  className="p-2 text-white/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button 
                  disabled={!isPlayerReady}
                  className="p-2 text-white/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Learning Insights */}
          {realTimeInsights.length > 0 && (
            <div className="absolute top-4 right-4 bg-black/80 rounded-lg p-3 max-w-xs">
              <h4 className="text-white font-medium text-sm mb-2">AI Insights</h4>
              <div className="space-y-1">
                {realTimeInsights.map((insight, index) => (
                  <p key={index} className="text-white/90 text-xs">{insight}</p>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Score Display */}
          {analytics && (
            <div className="absolute top-4 left-4 bg-black/80 rounded-lg p-3">
              <div className="text-white text-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <span>Engagement:</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    analytics.engagementScore >= 80 ? 'bg-green-600' :
                    analytics.engagementScore >= 60 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}>
                    {Math.round(analytics.engagementScore)}%
                  </div>
                </div>
                <div className="text-xs text-white/70">
                  Completion: {Math.round(analytics.comprehensionSignals.completionLikelihood * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Information */}
        <div className="bg-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
              <p className="text-gray-600 mb-4">{video.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="capitalize">{video.difficulty}</span>
                <span>{formatTime(video.duration)}</span>
                <span>{video.subjects.join(', ')}</span>
              </div>

              {/* AI-Generated Learning Insights */}
              {analytics && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Learning Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Mastered Segments:</span>
                      <span className="ml-2 font-medium">{analytics.comprehensionSignals.masteredSegments.length}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Challenging Areas:</span>
                      <span className="ml-2 font-medium">{analytics.comprehensionSignals.strugglingSegments.length}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Attention Spans:</span>
                      <span className="ml-2 font-medium">{analytics.attentionSpans.length}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Replay Segments:</span>
                      <span className="ml-2 font-medium">{analytics.difficultyIndicators.replaySegments.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Learning Objectives</h3>
            <ul className="space-y-1">
              {video.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Interactive Learning Tree */}
      <div className="w-80 border-l border-gray-200 bg-white p-4">
        <InteractiveLearningTree onVideoSelect={handleVideoSelect} isCompact />
      </div>

      {/* Quiz Modal */}
      {showQuiz && currentQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Knowledge Check</h3>
            <p className="text-gray-700 mb-4">{currentQuestion.question}</p>
            
            <div className="space-y-2 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className="w-full p-3 text-left border rounded-lg transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowQuiz(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleQuizSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}