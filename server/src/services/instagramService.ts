import axios, { AxiosResponse } from 'axios';
import { logger } from '../utils/logger';

interface InstagramMediaResponse {
  id: string;
  status_code?: string;
}

interface InstagramPublishResponse {
  id: string;
  permalink?: string;
}

interface PostReelOptions {
  videoUrl: string;
  caption: string;
  hashtags?: string[];
  location?: string;
  thumbOffset?: number;
}

export class InstagramService {
  private accessToken: string;
  private baseURL: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.baseURL = 'https://graph.facebook.com/v18.0';
  }

  async postReel(options: PostReelOptions): Promise<InstagramPublishResponse> {
    try {
      logger.info('Starting Instagram reel posting process');

      // Step 1: Create media object
      const mediaId = await this.createMediaObject(options);
      logger.info(`Media object created with ID: ${mediaId}`);

      // Step 2: Poll for processing completion
      await this.waitForMediaProcessing(mediaId);
      logger.info('Media processing completed');

      // Step 3: Publish the media
      const publishResponse = await this.publishMedia(mediaId);
      logger.info(`Reel published successfully with ID: ${publishResponse.id}`);

      return publishResponse;
    } catch (error) {
      logger.error('Instagram posting failed:', error);
      throw new Error(`Failed to post reel to Instagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createMediaObject(options: PostReelOptions): Promise<string> {
    const { videoUrl, caption, hashtags = [], location, thumbOffset } = options;
    
    const fullCaption = hashtags.length > 0 
      ? `${caption}\n\n${hashtags.join(' ')}`
      : caption;

    const mediaData: any = {
      media_type: 'REELS',
      video_url: videoUrl,
      caption: fullCaption,
      access_token: this.accessToken,
    };

    // Add optional parameters
    if (location) {
      mediaData.location_id = location;
    }

    if (thumbOffset !== undefined) {
      mediaData.thumb_offset = thumbOffset;
    }

    try {
      const response: AxiosResponse<InstagramMediaResponse> = await axios.post(
        `${this.baseURL}/me/media`,
        mediaData,
        {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.id) {
        throw new Error('No media ID returned from Instagram API');
      }

      return response.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`Failed to create media object: ${errorMessage}`);
      }
      throw error;
    }
  }

  private async waitForMediaProcessing(mediaId: string): Promise<void> {
    const maxAttempts = 20; // Increased for longer videos
    const pollInterval = 5000; // 5 seconds
    let attempts = 0;

    logger.info(`Starting media processing poll for media ID: ${mediaId}`);

    while (attempts < maxAttempts) {
      try {
        const response: AxiosResponse<InstagramMediaResponse> = await axios.get(
          `${this.baseURL}/${mediaId}`,
          {
            params: {
              fields: 'status_code',
              access_token: this.accessToken,
            },
            timeout: 10000,
          }
        );

        const status = response.data.status_code;
        logger.info(`Media processing status: ${status} (attempt ${attempts + 1}/${maxAttempts})`);

        if (status === 'FINISHED') {
          logger.info('Media processing completed successfully');
          return;
        } else if (status === 'ERROR') {
          throw new Error('Media processing failed on Instagram side');
        } else if (status === 'IN_PROGRESS') {
          // Continue polling
        } else {
          logger.warn(`Unknown status code: ${status}`);
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
          logger.warn(`Timeout on attempt ${attempts + 1}, retrying...`);
          attempts++;
          continue;
        }
        throw error;
      }
    }

    throw new Error(`Media processing timeout after ${maxAttempts} attempts`);
  }

  private async publishMedia(mediaId: string): Promise<InstagramPublishResponse> {
    try {
      const response: AxiosResponse<InstagramPublishResponse> = await axios.post(
        `${this.baseURL}/me/media_publish`,
        {
          creation_id: mediaId,
          access_token: this.accessToken,
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`Failed to publish media: ${errorMessage}`);
      }
      throw error;
    }
  }

  async getMediaInfo(mediaId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/${mediaId}`,
        {
          params: {
            fields: 'id,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
            access_token: this.accessToken,
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`Failed to get media info: ${errorMessage}`);
      }
      throw error;
    }
  }

  async deleteMedia(mediaId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/${mediaId}`,
        {
          params: {
            access_token: this.accessToken,
          },
          timeout: 10000,
        }
      );

      logger.info(`Media deleted successfully: ${mediaId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`Failed to delete media: ${errorMessage}`);
      }
      throw error;
    }
  }

  async validateAccessToken(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseURL}/me`,
        {
          params: {
            fields: 'id,name',
            access_token: this.accessToken,
          },
          timeout: 10000,
        }
      );

      return !!response.data.id;
    } catch (error) {
      logger.error('Access token validation failed:', error);
      return false;
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/me`,
        {
          params: {
            fields: 'id,name,username,account_type,media_count,followers_count,follows_count',
            access_token: this.accessToken,
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`Failed to get account info: ${errorMessage}`);
      }
      throw error;
    }
  }

  async getMediaInsights(mediaId: string, metrics: string[]): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/${mediaId}/insights`,
        {
          params: {
            metric: metrics.join(','),
            access_token: this.accessToken,
          },
          timeout: 10000,
        }
      );

      // Transform the response to a more usable format
      const insights: any = {};
      response.data.data.forEach((item: any) => {
        insights[item.name] = item.values[0]?.value || 0;
      });

      return insights;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`Failed to get media insights: ${errorMessage}`);
      }
      throw error;
    }
  }
} 