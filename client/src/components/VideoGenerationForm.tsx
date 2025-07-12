import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Sparkles, Settings, Play, X } from 'lucide-react';
import { GenerationOptions } from '../types';

interface VideoGenerationFormProps {
  onGenerate: (prompt: string, imageUrl: string, options?: GenerationOptions) => void;
  loading: boolean;
}

export const VideoGenerationForm: React.FC<VideoGenerationFormProps> = ({ onGenerate, loading }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<'lifestyle' | 'entertainment' | 'educational'>('lifestyle');
  const [optimizeForViral, setOptimizeForViral] = useState(true);
  const [generateVariations, setGenerateVariations] = useState(false);
  const [variationCount, setVariationCount] = useState(3);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setImageFile(acceptedFiles[0]);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() || !imageFile) {
      alert('Please provide both a prompt and an image file');
      return;
    }

    setUploading(true);
    try {
      // Upload image and get URL
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await uploadResponse.json();

      const options: GenerationOptions = {
        contentType,
        optimizeForViral,
        generateVariations,
        variationCount: generateVariations ? variationCount : undefined,
      };

      await onGenerate(prompt, imageUrl, options);
      
      // Reset form
      setPrompt('');
      setImageFile(null);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate New Video</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your video"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to generate..."
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Image *
              </label>
              {imageFile ? (
                <div className="relative">
                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-700">{imageFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  {isDragActive ? (
                    <p className="text-blue-600">Drop the image here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-1">Drag and drop an image here, or click to select</p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG, GIF, WEBP up to 10MB</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Content Optimization */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-medium text-blue-900">Content Optimization</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lifestyle">Lifestyle</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="educational">Educational</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="optimizeForViral"
                  checked={optimizeForViral}
                  onChange={(e) => setOptimizeForViral(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="optimizeForViral" className="ml-2 block text-sm text-gray-700">
                  Optimize for viral content
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="generateVariations"
                  checked={generateVariations}
                  onChange={(e) => setGenerateVariations(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="generateVariations" className="ml-2 block text-sm text-gray-700">
                  Generate multiple variations
                </label>
              </div>

              {generateVariations && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of variations
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={variationCount}
                    onChange={(e) => setVariationCount(parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <Settings className="w-4 h-4 mr-2" />
              Advanced Settings
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || uploading || !prompt.trim() || !imageFile}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploading ? 'Uploading...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 