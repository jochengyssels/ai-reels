import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Instagram, Bell, Save } from 'lucide-react';
import { Settings as SettingsType } from '../types';

interface SettingsProps {
  userId: string;
}

export const Settings: React.FC<SettingsProps> = ({ userId }) => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setSettings(result.data.settings);
        setInstagramConnected(result.data.settings.instagramConnected);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        // Show success message
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInstagramConnect = async () => {
    // This would typically redirect to Instagram OAuth
    alert('Instagram connection would redirect to OAuth flow');
  };

  const handleInstagramDisconnect = async () => {
    try {
      const response = await fetch('/api/instagram/disconnect', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setInstagramConnected(false);
        alert('Instagram account disconnected');
      }
    } catch (error) {
      console.error('Failed to disconnect Instagram:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <SettingsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Settings not found</h3>
        <p className="text-gray-600">Unable to load your settings</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Instagram Connection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <Instagram className="w-6 h-6 text-pink-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Instagram Connection</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Account Status</p>
              <p className="text-sm text-gray-600">
                {instagramConnected ? 'Connected' : 'Not connected'}
              </p>
            </div>
            <button
              onClick={instagramConnected ? handleInstagramDisconnect : handleInstagramConnect}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                instagramConnected
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-pink-600 text-white hover:bg-pink-700'
              }`}
            >
              {instagramConnected ? 'Disconnect' : 'Connect Instagram'}
            </button>
          </div>
        </div>
      </div>

      {/* Generation Preferences */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generation Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Width
            </label>
            <input
              type="number"
              value={settings.defaultWidth}
              onChange={(e) => setSettings({...settings, defaultWidth: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Height
            </label>
            <input
              type="number"
              value={settings.defaultHeight}
              onChange={(e) => setSettings({...settings, defaultHeight: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default FPS
            </label>
            <input
              type="number"
              value={settings.defaultFps}
              onChange={(e) => setSettings({...settings, defaultFps: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Quality
            </label>
            <select
              value={settings.defaultQuality}
              onChange={(e) => setSettings({...settings, defaultQuality: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posting Preferences */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Posting Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoPost"
              checked={settings.autoPost}
              onChange={(e) => setSettings({...settings, autoPost: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoPost" className="ml-2 block text-sm text-gray-700">
              Automatically post completed videos to Instagram
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Caption
            </label>
            <textarea
              value={settings.defaultCaption || ''}
              onChange={(e) => setSettings({...settings, defaultCaption: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter default caption for your videos..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Hashtags
            </label>
            <input
              type="text"
              value={settings.defaultHashtags.join(' ')}
              onChange={(e) => setSettings({...settings, defaultHashtags: e.target.value.split(' ')})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#reels #viral #trending"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <Bell className="w-6 h-6 text-gray-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
              Email notifications
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pushNotifications"
              checked={settings.pushNotifications}
              onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
              Push notifications
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}; 