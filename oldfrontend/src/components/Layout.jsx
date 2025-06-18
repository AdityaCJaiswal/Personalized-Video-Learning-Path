// src/components/Layout.jsx
import React from 'react';

const Layout = ({ children, roadmap }) => {
  return (
    <div className="h-screen flex">
      {/* Left Navbar */}
      <div className="w-1/6 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">📚 LearnPath</h2>
        <ul className="space-y-2">
          <li><Link to="/" className="hover:text-green-400">Dashboard</Link></li>
  <li><Link to="/videos" className="hover:text-green-400">My Videos</Link></li>
  <li><Link to="/progress" className="hover:text-green-400">Progress</Link></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        {children}
      </div>

      {/* Right Roadmap Tree */}
      <div className="w-1/5 bg-white border-l p-4">
        <h3 className="text-lg font-semibold mb-3">🗺️ Learning Roadmap</h3>
        {roadmap}
      </div>
    </div>
  );
};

export default Layout;
