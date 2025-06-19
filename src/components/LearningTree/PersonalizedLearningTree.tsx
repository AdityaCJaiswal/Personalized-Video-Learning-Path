import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Lock, Play, Star, Clock, Target, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { PersonalizedLearningEngine } from '../../services/personalizedLearningEngine';
import { getCoursesForUser, videoLibrary } from '../../data/courseData';

interface PersonalizedLearningTreeProps {
  onVideoSelect: (videoId: string) => void;
  isCompact?: boolean;
  selectedCourse?: string;
}

export function PersonalizedLearningTree({ 
  onVideoSelect, 
  isCompact = false, 
  selectedCourse 
}: PersonalizedLearningTreeProps) {
  const { state, dispatch } = useLearning();
  const [personalizedPath, setPersonalizedPath] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  useEffect(() => {
    if (state.currentProfile) {
      generatePersonalizedPath();
    }
  }, [state.watchHistory, state.currentProfile, selectedCourse]);

  const generatePersonalizedPath = () => {
    if (!state.currentProfile) return;

    const userCourses = getCoursesForUser(state.currentProfile);
    const filteredCourses = selectedCourse 
      ? userCourses.filter(course => course.id === selectedCourse)
      : userCourses;

    const completedVideos = new Set(
      state.watchHistory
        .filter(session => session.completionRate >= 0.8)
        .map(session => session.videoId)
    );

    const inProgressVideos = new Set(
      state.watchHistory
        .filter(session => session.completionRate > 0 && session.completionRate < 0.8)
        .map(session => session.videoId)
    );

    const pathNodes: any[] = [];

    for (const course of filteredCourses) {
      for (const node of course.learningPath) {
        // Check prerequisites
        const prerequisitesMet = node.prerequisites.length === 0 || 
          node.prerequisites.every((prereq: string) => {
            const prereqNode = course.learningPath.find((n: any) => n.id === prereq);
            return prereqNode ? prereqNode.videoIds.every((id: string) => completedVideos.has(id)) : true;
          });

        // Calculate node status
        const nodeCompletedVideos = node.videoIds.filter((id: string) => completedVideos.has(id));
        const nodeInProgressVideos = node.videoIds.filter((id: string) => inProgressVideos.has(id));
        
        let status = 'locked';
        if (prerequisitesMet) {
          if (nodeCompletedVideos.length === node.videoIds.length) {
            status = 'completed';
          } else if (nodeCompletedVideos.length > 0 || nodeInProgressVideos.length > 0) {
            status = 'in-progress';
          } else {
            status = 'available';
          }
        }

        pathNodes.push({
          ...node,
          id: `${course.id}-${node.id}`,
          courseTitle: course.title,
          courseId: course.id,
          status,
          completedVideos: nodeCompletedVideos.length,
          totalVideos: node.videoIds.length,
          level: 1,
        });
      }
    }

    setPersonalizedPath(pathNodes);

    // Auto-expand available and in-progress nodes
    const autoExpand = new Set<string>();
    pathNodes.forEach(node => {
      if (node.status === 'available' || node.status === 'in-progress') {
        autoExpand.add(node.id);
      }
    });
    setExpandedNodes(autoExpand);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-300 bg-green-50';
      case 'in-progress':
        return 'border-blue-300 bg-blue-50';
      case 'available':
        return 'border-amber-300 bg-amber-50';
      case 'locked':
        return 'border-gray-300 bg-gray-50 opacity-60';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string, size = 'h-4 w-4') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${size} text-green-500`} />;
      case 'in-progress':
        return <Play className={`${size} text-blue-500`} />;
      case 'available':
        return <Circle className={`${size} text-amber-500`} />;
      case 'locked':
        return <Lock className={`${size} text-gray-400`} />;
      default:
        return <Circle className={`${size} text-gray-400`} />;
    }
  };

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    
    if (node.status !== 'locked' && node.videoIds.length > 0) {
      // Find the first incomplete video in the node
      const completedVideos = new Set(
        state.watchHistory
          .filter(session => session.completionRate >= 0.8)
          .map(session => session.videoId)
      );
      
      const nextVideo = node.videoIds.find((id: string) => !completedVideos.has(id)) || node.videoIds[0];
      console.log('Selecting video from node:', nextVideo, 'from node:', node);
      
      // Find the video in the library and set it as current video
      const video = videoLibrary.find(v => v.id === nextVideo);
      if (video) {
        console.log('Found video:', video);
        dispatch({ type: 'SET_CURRENT_VIDEO', payload: video });
      }
      
      onVideoSelect(nextVideo);
    }
  };

  const calculateOverallProgress = () => {
    if (personalizedPath.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const totalNodes = personalizedPath.length;
    const completedNodes = personalizedPath.filter(node => node.status === 'completed').length;
    
    return {
      completed: completedNodes,
      total: totalNodes,
      percentage: totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0,
    };
  };

  const progress = calculateOverallProgress();

  // Group nodes by course
  const nodesByCourse = personalizedPath.reduce((acc, node) => {
    if (!acc[node.courseId]) {
      acc[node.courseId] = {
        title: node.courseTitle,
        nodes: [],
      };
    }
    acc[node.courseId].nodes.push(node);
    return acc;
  }, {} as Record<string, { title: string; nodes: any[] }>);

  if (!state.currentProfile) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${
        isCompact ? 'p-3' : 'p-4'
      } h-full flex flex-col items-center justify-center`}>
        <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 text-center">Complete your assessment to see your learning path</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${
      isCompact ? 'p-3' : 'p-4'
    } h-full flex flex-col`}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-bold text-gray-900 ${isCompact ? 'text-sm' : 'text-lg'}`}>
            {selectedCourse ? 'Course Progress' : 'Learning Path'}
          </h3>
          <div className="flex items-center space-x-1 text-xs">
            <Target className="h-3 w-3 text-blue-600" />
            <span className="font-medium text-blue-600">{progress.percentage}%</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {progress.completed} of {progress.total} modules completed
        </p>
      </div>

      {/* Legend */}
      {!isCompact && (
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Play className="h-3 w-3 text-blue-500" />
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center space-x-1">
            <Circle className="h-3 w-3 text-amber-500" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <Lock className="h-3 w-3 text-gray-400" />
            <span className="text-gray-600">Locked</span>
          </div>
        </div>
      )}

      {/* Learning Path */}
      <div className="flex-1 overflow-auto">
        {personalizedPath.length > 0 ? (
          <div className="space-y-3">
            {Object.entries(nodesByCourse).map(([courseId, courseData]) => (
              <div key={courseId} className="space-y-2">
                {/* Course Header (only show if multiple courses) */}
                {!selectedCourse && Object.keys(nodesByCourse).length > 1 && (
                  <div className="text-xs font-medium text-gray-700 px-2 py-1 bg-gray-100 rounded">
                    {courseData.title}
                  </div>
                )}
                
                {/* Course Nodes */}
                {courseData.nodes.map(node => (
                  <div key={node.id} className="space-y-2">
                    <div
                      onClick={() => handleNodeClick(node)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                        getStatusColor(node.status)
                      } ${selectedNode?.id === node.id ? 'ring-2 ring-blue-500 ring-offset-1' : ''} ${
                        node.status === 'locked' ? 'cursor-not-allowed' : 'hover:scale-[1.02]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {/* Status Icon */}
                          <div className="mt-0.5">
                            {getStatusIcon(node.status, 'h-4 w-4')}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h5 className={`font-medium text-gray-900 leading-tight ${
                              isCompact ? 'text-sm' : 'text-base'
                            }`}>
                              {node.title}
                            </h5>
                            <p className={`text-gray-600 leading-tight ${
                              isCompact ? 'text-xs' : 'text-sm'
                            } ${isCompact ? 'line-clamp-1' : 'line-clamp-2'}`}>
                              {node.description}
                            </p>
                            
                            {/* Progress and Metadata */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{node.estimatedMinutes}m</span>
                                <span>•</span>
                                <span>{node.completedVideos}/{node.totalVideos} videos</span>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                node.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                node.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {node.difficulty[0].toUpperCase()}
                              </span>
                            </div>

                            {/* Video Progress Bar */}
                            {node.totalVideos > 1 && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div
                                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${(node.completedVideos / node.totalVideos) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Prerequisites */}
                            {node.prerequisites.length > 0 && node.status === 'locked' && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                  Complete previous modules to unlock
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        {node.status !== 'locked' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNodeClick(node);
                            }}
                            className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                          >
                            <Play className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h4 className="font-medium text-gray-900 mb-2">Building your learning path...</h4>
            <p className="text-sm text-gray-600">
              {selectedCourse 
                ? 'Loading course content for your level'
                : 'Creating a personalized learning experience based on your assessment'
              }
            </p>
          </div>
        )}
      </div>

      {/* Selected Node Quick Info */}
      {selectedNode && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-blue-900 text-sm truncate">
                {selectedNode.title}
              </h4>
              <p className="text-xs text-blue-700 mt-1">
                {selectedNode.status === 'completed' ? 'Completed' : 
                 selectedNode.status === 'in-progress' ? 'Continue learning' :
                 'Start learning'}
              </p>
            </div>
            <button
              onClick={() => handleNodeClick(selectedNode)}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              {selectedNode.status === 'completed' ? 'Review' : 'Start'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}