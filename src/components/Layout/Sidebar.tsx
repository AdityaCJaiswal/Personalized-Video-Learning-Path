import React from 'react';
import { 
  Home, 
  Play, 
  BarChart3, 
  Target, 
  Award, 
  BookOpen,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'learn', label: 'Learn', icon: Play },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}