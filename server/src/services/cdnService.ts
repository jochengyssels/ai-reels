import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';

interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'auto';
  transformation?: any[];
  publicId?: string;
}

interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  format: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
}

export class CDNService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadVideo(filePath: string, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const uploadOptions = {
        folder: options.folder || 'ai-reels/videos',
        resource_type: 'video',
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' },
          { width: 1080, height: 1920, crop: 'fill', gravity: 'auto' }
        ],
        ...options
      };

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

      logger.info(`Video uploaded to CDN: ${result.public_id}`);

      return {
        url: result.url,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        format: result.format,
        size: result.bytes,
        duration: result.duration,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      logger.error('Failed to upload video to CDN:', error);
      throw new Error(`CDN upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadImage(filePath: string, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const uploadOptions = {
        folder: options.folder || 'ai-reels/images',
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' },
          { width: 1080, height: 1920, crop: 'fill', gravity: 'auto' }
        ],
        ...options
      };

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

      logger.info(`Image uploaded to CDN: ${result.public_id}`);

      return {
        url: result.url,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      logger.error('Failed to upload image to CDN:', error);
      throw new Error(`CDN upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFromUrl(url: string, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const uploadOptions = {
        folder: options.folder || 'ai-reels/external',
        resource_type: 'auto',
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' }
        ],
        ...options
      };

      const result = await cloudinary.uploader.upload(url, uploadOptions);

      logger.info(`File uploaded from URL to CDN: ${result.public_id}`);

      return {
        url: result.url,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        format: result.format,
        size: result.bytes,
        duration: result.duration,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      logger.error('Failed to upload from URL to CDN:', error);
      throw new Error(`CDN upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(publicId: string, resourceType: 'image' | 'video' = 'video'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      logger.info(`File deleted from CDN: ${publicId}`);
    } catch (error) {
      logger.error('Failed to delete file from CDN:', error);
      throw new Error(`CDN deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateThumbnail(videoUrl: string, options: any = {}): Promise<string> {
    try {
      const thumbnailOptions = {
        width: 400,
        height: 600,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto:good',
        ...options
      };

      const result = await cloudinary.url(videoUrl, {
        transformation: [thumbnailOptions],
        resource_type: 'video'
      });

      return result;
    } catch (error) {
      logger.error('Failed to generate thumbnail:', error);
      throw new Error(`Thumbnail generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async optimizeVideo(videoUrl: string, options: any = {}): Promise<string> {
    try {
      const optimizationOptions = {
        quality: 'auto:good',
        fetch_format: 'auto',
        width: 1080,
        height: 1920,
        crop: 'fill',
        gravity: 'auto',
        ...options
      };

      const result = await cloudinary.url(videoUrl, {
        transformation: [optimizationOptions],
        resource_type: 'video'
      });

      return result;
    } catch (error) {
      logger.error('Failed to optimize video:', error);
      throw new Error(`Video optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFileInfo(publicId: string, resourceType: 'image' | 'video' = 'video'): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });

      return result;
    } catch (error) {
      logger.error('Failed to get file info from CDN:', error);
      throw new Error(`CDN info fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const cdnService = new CDNService(); 