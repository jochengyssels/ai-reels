import React from 'react';
import { Clock, CheckCircle, XCircle, Play, Eye, Heart, MessageSquare, Share2 } from 'lucide-react';
import { Video } from '../types';

interface VideoQueueProps {
  videos: Video[];
  onRefresh: () => void;
}

export const VideoQueue: React.FC<VideoQueueProps> = ({ videos, onRefresh }) => {
  const getStatusIcon = (status: Video['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'GENERATING':
        return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'POSTED':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Video['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'GENERATING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'POSTED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Video Queue</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos in queue</h3>
          <p className="text-gray-600">Start generating videos to see them here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(video.status)}
                    <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(video.status)}`}>
                      {video.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{video.description || video.prompt}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>Created: {formatDate(video.createdAt)}</span>
                    {video.generatedAt && (
                      <span>Generated: {formatDate(video.generatedAt)}</span>
                    )}
                    {video.postedAt && (
                      <span>Posted: {formatDate(video.postedAt)}</span>
                    )}
                  </div>

                  {/* Performance Metrics */}
                  {video.status === 'POSTED' && (
                    <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{video.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{video.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{video.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{video.shares}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {video.status === 'COMPLETED' && video.videoUrl && (
                    <button
                      onClick={() => window.open(video.videoUrl, '_blank')}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View
                    </button>
                  )}
                  {video.status === 'COMPLETED' && !video.instagramPostId && (
                    <button
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Post to Instagram
                    </button>
                  )}
                  {video.status === 'FAILED' && (
                    <button
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 