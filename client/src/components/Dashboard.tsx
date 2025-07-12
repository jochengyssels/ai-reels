import React, { useState, useEffect } from 'react';
import { VideoGenerationForm } from './VideoGenerationForm';
import { VideoQueue } from './VideoQueue';
import { Analytics } from './Analytics';
import { Settings } from './Settings';
import { User, Video } from '../types';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'queue' | 'analytics' | 'settings'>('generate');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  const handleVideoGeneration = async (prompt: string, imageUrl: string, options?: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          prompt, 
          imageUrl, 
          title: prompt.substring(0, 50),
          ...options 
        }),
      });

      if (!response.ok) throw new Error('Generation failed');
      
      const result = await response.json();
      setVideos(prev => [...prev, result.data.video]);
    } catch (error) {
      console.error('Generation error:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setVideos(result.data.videos);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">AI Reels Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.firstName || user.username}!</p>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-8 px-6 py-4 border-b border-gray-200">
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'generate' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('generate')}
            >
              Generate
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'queue' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('queue')}
            >
              Queue ({videos.filter(v => v.status === 'PENDING' || v.status === 'GENERATING').length})
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </nav>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'generate' && (
              <VideoGenerationForm
                onGenerate={handleVideoGeneration}
                loading={loading}
              />
            )}
            {activeTab === 'queue' && (
              <VideoQueue 
                videos={videos} 
                onRefresh={fetchVideos}
              />
            )}
            {activeTab === 'analytics' && (
              <Analytics userId={user.id} />
            )}
            {activeTab === 'settings' && (
              <Settings userId={user.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 