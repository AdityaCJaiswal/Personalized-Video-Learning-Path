import React from 'react';
import { Brain, User, Bell, Settings, LogOut } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { state } = useLearning();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AdaptiveLearn</h1>
              <p className="text-xs text-gray-500">Personalized Learning Platform</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            {state.currentProfile && (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {state.currentProfile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {state.currentProfile.progress.streakDays} day streak
                  </p>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-full">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}