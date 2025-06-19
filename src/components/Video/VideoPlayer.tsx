import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Settings, Maximize, RotateCcw, CheckCircle } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { InteractiveLearningTree } from '../LearningTree/InteractiveLearningTree';

export function VideoPlayer() {
  const { state, dispatch } = useLearning();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  const video = state.currentVideo;

  const handleVideoSelect = (videoId: string) => {
    // This will be handled by the parent component
    window.dispatchEvent(new CustomEvent('videoSelect', { detail: { videoId } }));
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
        
        {/* Right Sidebar - Interactive Learning Tree */}
        <div className="w-80 border-l border-gray-200 bg-white p-4">
          <InteractiveLearningTree onVideoSelect={handleVideoSelect} />
        </div>
      </div>
    );
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Check if we should show a quiz (every 25% of video)
      const progress = videoRef.current.currentTime / videoRef.current.duration;
      const quizTrigger = Math.floor(progress * 4) / 4;
      
      if (quizTrigger === 0.25 || quizTrigger === 0.5 || quizTrigger === 0.75) {
        if (!showQuiz && video.quizQuestions.length > 0) {
          setShowQuiz(true);
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    }
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleQuizSubmit = () => {
    setShowQuiz(false);
    setCurrentQuiz(prev => prev + 1);
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = video.quizQuestions[0]; // Simplified for demo

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Video Player */}
        <div className="relative bg-black flex-1">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.playbackRate = state.currentProfile?.preferences.videoSpeed || 1.0;
              }
            }}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center space-x-2 text-white text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <div className="flex-1 bg-white/20 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all duration-200"
                      style={{ width: `${(currentTime / video.duration) * 100}%` }}
                    />
                  </div>
                  <span>{formatTime(video.duration)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 text-white/80 hover:text-white transition-colors">
                  <Volume2 className="h-5 w-5" />
                </button>
                <button className="p-2 text-white/80 hover:text-white transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
                <button className="p-2 text-white/80 hover:text-white transition-colors">
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Check</h3>
            <p className="text-gray-700 mb-4">{currentQuestion.question}</p>
            
            <div className="space-y-2 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(currentQuestion.id, index)}
                  className={`w-full p-3 text-left border rounded-lg transition-colors ${
                    quizAnswers[currentQuestion.id] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
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
                disabled={quizAnswers[currentQuestion.id] === undefined}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}