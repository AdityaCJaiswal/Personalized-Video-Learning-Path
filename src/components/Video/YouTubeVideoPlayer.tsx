import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Settings, Maximize, RotateCcw, CheckCircle, SkipBack, SkipForward, Gauge, Clock } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { PersonalizedLearningTree } from '../LearningTree/PersonalizedLearningTree';
import { YouTubeService } from '../../services/youtubeService';

export function YouTubeVideoPlayer() {
  const { state, dispatch } = useLearning();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<string | undefined>();
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const youtubeServiceRef = useRef<YouTubeService | null>(null);
  const progressUpdateRef = useRef<NodeJS.Timeout>();

  const video = state.currentVideo;

  const handleVideoSelect = (videoId: string) => {
    window.dispatchEvent(new CustomEvent('videoSelect', { detail: { videoId } }));
  };

  // Determine current course based on the video
  useEffect(() => {
    if (video) {
      // Import courses to find which course this video belongs to
      import('../../data/courseData').then(({ courses }) => {
        const course = courses.find(c => 
          c.learningPath.some(node => 
            node.videoIds.includes(video.id)
          )
        );
        setCurrentCourse(course?.id);
      });
    }
  }, [video]);

  // Initialize YouTube service
  useEffect(() => {
    youtubeServiceRef.current = new YouTubeService(
      (analytics) => {
        console.log('Analytics updated:', analytics);
      },
      (interaction) => {
        console.log('Interaction:', interaction);
      },
      () => {
        console.log('Player is ready');
        setIsPlayerReady(true);
        setPlayerError(null);
        setIsLoading(false);
        
        if (youtubeServiceRef.current) {
          const videoDuration = youtubeServiceRef.current.getDuration();
          setDuration(videoDuration);
          startProgressTracking();
        }
      },
      (error) => {
        console.error('Player error:', error);
        setPlayerError(error);
        setIsPlayerReady(false);
        setIsLoading(false);
      }
    );

    return () => {
      if (youtubeServiceRef.current) {
        youtubeServiceRef.current.destroyPlayer();
      }
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
      }
    };
  }, []);

  // Initialize player when video changes
  useEffect(() => {
    if (video && playerContainerRef.current && youtubeServiceRef.current) {
      initializePlayer();
    }

    return () => {
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
      }
    };
  }, [video]);

  const extractYouTubeVideoId = (url: string): string | null => {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^#&?]*)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    return null;
  };

  const initializePlayer = async () => {
    if (!video || !playerContainerRef.current || !youtubeServiceRef.current) {
      console.log('Cannot initialize player - missing requirements');
      return;
    }

    setIsLoading(true);
    setIsPlayerReady(false);
    setPlayerError(null);

    try {
      let videoId = extractYouTubeVideoId(video.videoUrl);
      
      if (!videoId) {
        videoId = video.id;
      }
      
      if (!videoId) {
        throw new Error('Invalid video ID or URL');
      }

      console.log('Initializing player with video ID:', videoId);

      await youtubeServiceRef.current.createPlayer(playerContainerRef.current, videoId, {
        height: '100%',
        width: '100%',
      });

    } catch (error) {
      console.error('Failed to initialize YouTube player:', error);
      setPlayerError(`Failed to load video: ${error.message}`);
      setIsLoading(false);
    }
  };

  const startProgressTracking = () => {
    if (progressUpdateRef.current) {
      clearInterval(progressUpdateRef.current);
    }

    progressUpdateRef.current = setInterval(() => {
      if (youtubeServiceRef.current && youtubeServiceRef.current.isReady()) {
        try {
          const current = youtubeServiceRef.current.getCurrentTime();
          const total = youtubeServiceRef.current.getDuration();
          const playerState = youtubeServiceRef.current.getPlayerState();
          
          setCurrentTime(current);
          setDuration(total);
          setIsPlaying(playerState === window.YT?.PlayerState?.PLAYING);

          checkQuizTriggers(current, total);
        } catch (error) {
          console.warn('Error updating progress:', error);
        }
      }
    }, 1000);
  };

  const checkQuizTriggers = (current: number, total: number) => {
    if (!video.quizQuestions.length) return;

    const progress = current / total;
    const shouldShowQuiz = progress > 0.25 && progress < 0.26 && !showQuiz;

    if (shouldShowQuiz) {
      setShowQuiz(true);
      if (youtubeServiceRef.current) {
        youtubeServiceRef.current.pause();
      }
    }
  };

  const togglePlay = () => {
    if (!youtubeServiceRef.current || !isPlayerReady) return;

    try {
      if (isPlaying) {
        youtubeServiceRef.current.pause();
      } else {
        youtubeServiceRef.current.play();
      }
    } catch (error) {
      console.warn('Error toggling play:', error);
    }
  };

  const handleSeek = (seconds: number) => {
    if (!youtubeServiceRef.current || !isPlayerReady) return;
    try {
      youtubeServiceRef.current.seekTo(seconds);
    } catch (error) {
      console.warn('Error seeking:', error);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!youtubeServiceRef.current || !isPlayerReady) return;
    try {
      youtubeServiceRef.current.setPlaybackRate(rate);
      setPlaybackRate(rate);
    } catch (error) {
      console.warn('Error changing playback rate:', error);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!youtubeServiceRef.current || !isPlayerReady) return;
    try {
      youtubeServiceRef.current.setVolume(newVolume);
      setVolume(newVolume);
    } catch (error) {
      console.warn('Error changing volume:', error);
    }
  };

  const handleQuizSubmit = () => {
    setShowQuiz(false);
    if (youtubeServiceRef.current && isPlayerReady) {
      try {
        youtubeServiceRef.current.play();
      } catch (error) {
        console.warn('Error resuming video:', error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
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
          <PersonalizedLearningTree onVideoSelect={handleVideoSelect} />
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
        <div className="relative bg-black" style={{ height: '70vh', minHeight: '500px' }}>
          {/* YouTube Player Container */}
          <div ref={playerContainerRef} className="w-full h-full"></div>

          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-lg">Loading video player...</p>
                <p className="text-sm text-gray-300 mt-2">Video ID: {extractYouTubeVideoId(video.videoUrl) || video.id}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {playerError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-white text-center max-w-md">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <p className="text-lg mb-4">{playerError}</p>
                <div className="space-y-2">
                  <button
                    onClick={initializePlayer}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mr-2"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${extractYouTubeVideoId(video.videoUrl) || video.id}`, '_blank')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Watch on YouTube
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Video ID: {extractYouTubeVideoId(video.videoUrl) || video.id}
                </p>
              </div>
            </div>
          )}

          {/* Custom Video Controls Overlay */}
          {isPlayerReady && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 text-white text-sm mb-3">
                  <span className="font-medium">{formatTime(currentTime)}</span>
                  <div 
                    className="flex-1 bg-white/30 rounded-full h-2 cursor-pointer hover:h-3 transition-all duration-200"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      handleSeek(percent * duration);
                    }}
                  >
                    <div
                      className="bg-red-600 h-full rounded-full transition-all duration-200 relative"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full opacity-0 hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                  <span className="font-medium">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <SkipBack className="h-5 w-5 text-white" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 text-white" />
                    ) : (
                      <Play className="h-6 w-6 text-white" />
                    )}
                  </button>

                  <button
                    onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <SkipForward className="h-5 w-5 text-white" />
                  </button>

                  <div className="flex items-center space-x-3">
                    <Volume2 className="h-5 w-5 text-white" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-24 accent-red-600"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Playback Speed */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-3 text-white/80 hover:text-white transition-colors flex items-center space-x-2 bg-white/20 rounded-lg"
                    >
                      <Gauge className="h-5 w-5" />
                      <span className="text-sm font-medium">{playbackRate}x</span>
                    </button>
                    
                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-3 min-w-[140px] border border-white/20">
                        <div className="text-white text-sm font-medium mb-3">Playback Speed</div>
                        <div className="space-y-1">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => {
                                handlePlaybackRateChange(rate);
                                setShowSettings(false);
                              }}
                              className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-white/20 transition-colors ${
                                playbackRate === rate ? 'text-red-400 bg-white/10' : 'text-white'
                              }`}
                            >
                              {rate}x {rate === 1 ? '(Normal)' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="p-3 text-white/80 hover:text-white transition-colors bg-white/20 rounded-lg">
                    <Settings className="h-5 w-5" />
                  </button>
                  <button className="p-3 text-white/80 hover:text-white transition-colors bg-white/20 rounded-lg">
                    <Maximize className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Information */}
        <div className="bg-white p-6 flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{video.title}</h1>
                <p className="text-gray-600 mb-4 text-lg leading-relaxed">{video.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="capitalize bg-gray-100 px-3 py-1 rounded-full font-medium">{video.difficulty}</span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(video.duration)}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {video.subjects.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Objectives</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {video.learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Personalized Learning Tree with Course Context */}
      <div className="w-80 border-l border-gray-200 bg-white p-4">
        <PersonalizedLearningTree 
          onVideoSelect={handleVideoSelect} 
          isCompact 
          selectedCourse={currentCourse}
        />
      </div>

      {/* Quiz Modal */}
      {showQuiz && currentQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Knowledge Check</h3>
            <p className="text-gray-700 mb-6 text-lg">{currentQuestion.question}</p>
            
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className="w-full p-4 text-left border-2 rounded-lg transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <span className="font-medium">{option}</span>
                </button>
              ))}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowQuiz(false)}
                className="flex-1 px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Skip
              </button>
              <button
                onClick={handleQuizSubmit}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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