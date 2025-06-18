import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Lock, Play, Star, Clock, Target, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { mockVideoLibrary } from '../../data/mockData';

interface TreeNode {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  prerequisites: string[];
  children: TreeNode[];
  videoId?: string;
  level: number;
  category: string;
}

interface InteractiveLearningTreeProps {
  onVideoSelect: (videoId: string) => void;
  isCompact?: boolean;
}

export function InteractiveLearningTree({ onVideoSelect, isCompact = false }: InteractiveLearningTreeProps) {
  const { state } = useLearning();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['fundamentals']));

  useEffect(() => {
    generateTreeData();
  }, [state.watchHistory]);

  const generateTreeData = () => {
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

    // Create a cleaner, more organized tree structure
    const categories: TreeNode[] = [
      {
        id: 'fundamentals',
        title: 'Programming Fundamentals',
        description: 'Core programming concepts',
        status: 'available',
        difficulty: 'beginner',
        duration: 0,
        prerequisites: [],
        level: 0,
        category: 'fundamentals',
        children: [
          {
            id: 'js-basics-1',
            title: 'JavaScript Variables',
            description: 'Variables & Data Types',
            status: completedVideos.has('js-basics-1') ? 'completed' : 
                   inProgressVideos.has('js-basics-1') ? 'in-progress' : 'available',
            difficulty: 'beginner',
            duration: 1800,
            prerequisites: [],
            level: 1,
            category: 'fundamentals',
            videoId: 'js-basics-1',
            children: []
          },
          {
            id: 'js-functions',
            title: 'JavaScript Functions',
            description: 'Functions & Scope',
            status: completedVideos.has('js-basics-1') ? 
                   (completedVideos.has('js-functions') ? 'completed' : 
                    inProgressVideos.has('js-functions') ? 'in-progress' : 'available') : 'locked',
            difficulty: 'beginner',
            duration: 2100,
            prerequisites: ['js-basics-1'],
            level: 1,
            category: 'fundamentals',
            children: []
          }
        ]
      },
      {
        id: 'frontend',
        title: 'Frontend Development',
        description: 'UI/UX Development',
        status: completedVideos.has('js-basics-1') ? 'available' : 'locked',
        difficulty: 'intermediate',
        duration: 0,
        prerequisites: ['js-basics-1'],
        level: 0,
        category: 'frontend',
        children: [
          {
            id: 'react-intro',
            title: 'React Basics',
            description: 'Components & JSX',
            status: completedVideos.has('js-basics-1') ? 
                   (completedVideos.has('react-intro') ? 'completed' : 
                    inProgressVideos.has('react-intro') ? 'in-progress' : 'available') : 'locked',
            difficulty: 'intermediate',
            duration: 2400,
            prerequisites: ['js-basics-1'],
            level: 1,
            category: 'frontend',
            videoId: 'react-intro',
            children: []
          },
          {
            id: 'react-hooks',
            title: 'React Hooks',
            description: 'State & Effects',
            status: completedVideos.has('react-intro') ? 'available' : 'locked',
            difficulty: 'intermediate',
            duration: 2700,
            prerequisites: ['react-intro'],
            level: 1,
            category: 'frontend',
            children: []
          }
        ]
      },
      {
        id: 'advanced',
        title: 'Advanced Topics',
        description: 'Complex Concepts',
        status: completedVideos.has('react-intro') ? 'available' : 'locked',
        difficulty: 'advanced',
        duration: 0,
        prerequisites: ['react-intro'],
        level: 0,
        category: 'advanced',
        children: [
          {
            id: 'algorithms-sorting',
            title: 'Sorting Algorithms',
            description: 'Bubble & Quick Sort',
            status: completedVideos.has('react-intro') ? 
                   (completedVideos.has('algorithms-sorting') ? 'completed' : 
                    inProgressVideos.has('algorithms-sorting') ? 'in-progress' : 'available') : 'locked',
            difficulty: 'advanced',
            duration: 3000,
            prerequisites: ['react-intro'],
            level: 1,
            category: 'advanced',
            videoId: 'algorithms-sorting',
            children: []
          }
        ]
      }
    ];

    setTreeData(categories);
    
    // Auto-expand categories with available or completed children
    const autoExpand = new Set<string>();
    categories.forEach(category => {
      if (category.children.some(child => 
        child.status === 'available' || child.status === 'completed' || child.status === 'in-progress'
      )) {
        autoExpand.add(category.id);
      }
    });
    setExpandedCategories(autoExpand);
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

  const handleNodeClick = (node: TreeNode) => {
    setSelectedNode(node);
    
    // Only navigate to video if it's not locked and has a videoId
    if (node.videoId && node.status !== 'locked') {
      onVideoSelect(node.videoId);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const calculateProgress = () => {
    const allNodes = treeData.reduce((acc, category) => [...acc, ...category.children], [] as TreeNode[]);
    const completed = allNodes.filter(node => node.status === 'completed').length;
    const total = allNodes.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const progress = calculateProgress();

  const renderCategory = (category: TreeNode) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasAvailableChildren = category.children.some(child => 
      child.status === 'available' || child.status === 'completed' || child.status === 'in-progress'
    );

    return (
      <div key={category.id} className="mb-4">
        {/* Category Header */}
        <button
          onClick={() => toggleCategory(category.id)}
          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-sm ${
            hasAvailableChildren ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
              <BookOpen className={`h-4 w-4 ${hasAvailableChildren ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            <div className="text-left">
              <h4 className={`font-medium ${isCompact ? 'text-sm' : 'text-base'} ${
                hasAvailableChildren ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {category.title}
              </h4>
              <p className={`text-xs text-gray-500 ${isCompact ? 'hidden' : 'block'}`}>
                {category.children.filter(c => c.status === 'completed').length}/{category.children.length} completed
              </p>
            </div>
          </div>
          
          {/* Category Progress Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              category.children.every(c => c.status === 'completed') ? 'bg-green-500' :
              category.children.some(c => c.status === 'completed' || c.status === 'in-progress') ? 'bg-blue-500' :
              'bg-gray-300'
            }`} />
          </div>
        </button>

        {/* Category Children */}
        {isExpanded && (
          <div className="mt-2 ml-4 space-y-2">
            {category.children.map(child => (
              <div
                key={child.id}
                onClick={() => handleNodeClick(child)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                  getStatusColor(child.status)
                } ${selectedNode?.id === child.id ? 'ring-2 ring-blue-500 ring-offset-1' : ''} ${
                  child.status === 'locked' ? 'cursor-not-allowed' : 'hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Status Icon */}
                    <div className="mt-0.5">
                      {getStatusIcon(child.status, 'h-4 w-4')}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h5 className={`font-medium text-gray-900 leading-tight ${
                        isCompact ? 'text-sm' : 'text-base'
                      }`}>
                        {child.title}
                      </h5>
                      <p className={`text-gray-600 leading-tight ${
                        isCompact ? 'text-xs' : 'text-sm'
                      } ${isCompact ? 'line-clamp-1' : 'line-clamp-2'}`}>
                        {child.description}
                      </p>
                      
                      {/* Metadata */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(child.duration)}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          child.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                          child.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {child.difficulty[0].toUpperCase()}
                        </span>
                      </div>

                      {/* Prerequisites */}
                      {child.prerequisites.length > 0 && child.status === 'locked' && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Requires: {child.prerequisites.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {child.videoId && child.status !== 'locked' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onVideoSelect(child.videoId!);
                      }}
                      className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                    >
                      <Play className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${
      isCompact ? 'p-3' : 'p-4'
    } h-full flex flex-col`}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-bold text-gray-900 ${isCompact ? 'text-sm' : 'text-lg'}`}>
            Learning Path
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
          {progress.completed} of {progress.total} topics completed
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

      {/* Tree Structure */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-2">
          {treeData.map(category => renderCategory(category))}
        </div>
      </div>

      {/* Selected Node Quick Info */}
      {selectedNode && selectedNode.videoId && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-blue-900 text-sm truncate">
                {selectedNode.title}
              </h4>
              <p className="text-xs text-blue-700 mt-1">
                Click to start learning
              </p>
            </div>
            <button
              onClick={() => selectedNode.videoId && onVideoSelect(selectedNode.videoId)}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
}