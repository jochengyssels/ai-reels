import Bull, { Job, Queue } from 'bull';
import { generateVideo } from './runwayMLService';
import { InstagramService } from './instagramService';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

interface VideoGenerationJob {
  videoId: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  title: string;
  description?: string;
  settings: {
    width: number;
    height: number;
    fps: number;
    quality: string;
    contentType?: string;
    optimizeForViral?: boolean;
    generateVariations?: boolean;
    variationCount?: number;
  };
  instagramSettings?: {
    accessToken: string;
    caption?: string;
    hashtags?: string[];
    autoPost: boolean;
  };
}

interface JobResult {
  success: boolean;
  videoUrl?: string;
  instagramPostId?: string;
  instagramPermalink?: string;
  error?: string;
}

class QueueService {
  private videoQueue: Queue<VideoGenerationJob>;
  private instagramQueue: Queue<any>;

  constructor() {
    // Initialize Redis connection
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    };

    // Video generation queue
    this.videoQueue = new Bull<VideoGenerationJob>('video-generation', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    // Instagram posting queue
    this.instagramQueue = new Bull('instagram-posting', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 25,
      },
    });

    this.setupQueueHandlers();
  }

  private setupQueueHandlers(): void {
    // Video generation job processor
    this.videoQueue.process('generate-video', async (job: Job<VideoGenerationJob>) => {
      return await this.processVideoGeneration(job);
    });

    // Instagram posting job processor
    this.instagramQueue.process('post-to-instagram', async (job: Job<any>) => {
      return await this.processInstagramPosting(job);
    });

    // Queue event handlers
    this.videoQueue.on('completed', (job: Job<VideoGenerationJob>, result: JobResult) => {
      logger.info(`Video generation completed for job ${job.id}: ${result.success}`);
    });

    this.videoQueue.on('failed', (job: Job<VideoGenerationJob>, err: Error) => {
      logger.error(`Video generation failed for job ${job.id}:`, err);
    });

    this.instagramQueue.on('completed', (job: Job<any>, result: JobResult) => {
      logger.info(`Instagram posting completed for job ${job.id}: ${result.success}`);
    });

    this.instagramQueue.on('failed', (job: Job<any>, err: Error) => {
      logger.error(`Instagram posting failed for job ${job.id}:`, err);
    });

    // Global error handler
    this.videoQueue.on('error', (error: Error) => {
      logger.error('Video queue error:', error);
    });

    this.instagramQueue.on('error', (error: Error) => {
      logger.error('Instagram queue error:', error);
    });
  }

  private async processVideoGeneration(job: Job<VideoGenerationJob>): Promise<JobResult> {
    const { videoId, userId, prompt, imageUrl, settings } = job.data;

    try {
      logger.info(`Starting video generation for job ${job.id}, video: ${videoId}`);

      // Update video status to GENERATING
      await prisma.video.update({
        where: { id: videoId },
        data: { 
          status: 'GENERATING',
          updatedAt: new Date()
        }
      });

      // Generate video using RunwayML
      const videoUrl = await generateVideo(prompt, imageUrl, {
        model: 'gen4_turbo',
        ratio: `${settings.width}:${settings.height}`,
        duration: 10,
        ...settings
      });

      // Update video with generated URL
      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'COMPLETED',
          videoUrl: videoUrl,
          generatedAt: new Date(),
          updatedAt: new Date()
        }
      });

      logger.info(`Video generation completed for ${videoId}: ${videoUrl}`);

      // If auto-post is enabled, add to Instagram queue
      if (job.data.instagramSettings?.autoPost && job.data.instagramSettings?.accessToken) {
        await this.addInstagramPostingJob({
          videoId,
          userId,
          videoUrl,
          instagramSettings: job.data.instagramSettings
        });
      }

      return {
        success: true,
        videoUrl: videoUrl
      };

    } catch (error) {
      logger.error(`Video generation failed for ${videoId}:`, error);

      // Update video status to FAILED
      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'FAILED',
          updatedAt: new Date()
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async processInstagramPosting(job: Job<any>): Promise<JobResult> {
    const { videoId, userId, videoUrl, instagramSettings } = job.data;

    try {
      logger.info(`Starting Instagram posting for job ${job.id}, video: ${videoId}`);

      const instagramService = new InstagramService(instagramSettings.accessToken);

      // Post to Instagram
      const postResult = await instagramService.postReel({
        videoUrl: videoUrl,
        caption: instagramSettings.caption || 'AI-generated reel!',
        hashtags: instagramSettings.hashtags || ['#reels', '#viral', '#ai']
      });

      // Update video status
      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'POSTED',
          instagramPostId: postResult.id,
          postedAt: new Date(),
          updatedAt: new Date()
        }
      });

      logger.info(`Instagram posting completed for ${videoId}: ${postResult.id}`);

      return {
        success: true,
        instagramPostId: postResult.id,
        instagramPermalink: postResult.permalink
      };

    } catch (error) {
      logger.error(`Instagram posting failed for ${videoId}:`, error);

      // Update video status back to COMPLETED (not posted)
      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date()
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async addVideoGenerationJob(jobData: VideoGenerationJob): Promise<string> {
    try {
      const job = await this.videoQueue.add('generate-video', jobData, {
        priority: 1,
        delay: 0,
      });

      logger.info(`Video generation job added to queue: ${job.id} for video: ${jobData.videoId}`);

      // Update video status to PENDING
      await prisma.video.update({
        where: { id: jobData.videoId },
        data: { 
          status: 'PENDING',
          updatedAt: new Date()
        }
      });

      return job.id.toString();
    } catch (error) {
      logger.error('Failed to add video generation job to queue:', error);
      throw error;
    }
  }

  async addInstagramPostingJob(jobData: {
    videoId: string;
    userId: string;
    videoUrl: string;
    instagramSettings: {
      accessToken: string;
      caption?: string;
      hashtags?: string[];
    };
  }): Promise<string> {
    try {
      const job = await this.instagramQueue.add('post-to-instagram', jobData, {
        priority: 2,
        delay: 0,
      });

      logger.info(`Instagram posting job added to queue: ${job.id} for video: ${jobData.videoId}`);

      return job.id.toString();
    } catch (error) {
      logger.error('Failed to add Instagram posting job to queue:', error);
      throw error;
    }
  }

  async getJobStatus(jobId: string, queueType: 'video' | 'instagram' = 'video'): Promise<any> {
    try {
      const queue = queueType === 'video' ? this.videoQueue : this.instagramQueue;
      const job = await queue.getJob(jobId);

      if (!job) {
        return { status: 'not_found' };
      }

      const state = await job.getState();
      const progress = job.progress();
      const result = job.returnvalue;
      const failedReason = job.failedReason;

      return {
        id: job.id,
        status: state,
        progress: progress,
        result: result,
        failedReason: failedReason,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
      };
    } catch (error) {
      logger.error('Failed to get job status:', error);
      throw error;
    }
  }

  async cancelJob(jobId: string, queueType: 'video' | 'instagram' = 'video'): Promise<boolean> {
    try {
      const queue = queueType === 'video' ? this.videoQueue : this.instagramQueue;
      const job = await queue.getJob(jobId);

      if (!job) {
        return false;
      }

      await job.remove();
      logger.info(`Job ${jobId} cancelled from ${queueType} queue`);

      return true;
    } catch (error) {
      logger.error('Failed to cancel job:', error);
      throw error;
    }
  }

  async getQueueStats(): Promise<any> {
    try {
      const videoStats = await this.videoQueue.getJobCounts();
      const instagramStats = await this.instagramQueue.getJobCounts();

      return {
        video: {
          waiting: videoStats.waiting,
          active: videoStats.active,
          completed: videoStats.completed,
          failed: videoStats.failed,
          delayed: videoStats.delayed,
        },
        instagram: {
          waiting: instagramStats.waiting,
          active: instagramStats.active,
          completed: instagramStats.completed,
          failed: instagramStats.failed,
          delayed: instagramStats.delayed,
        },
      };
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      throw error;
    }
  }

  async cleanQueues(): Promise<void> {
    try {
      await this.videoQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean completed jobs older than 24 hours
      await this.videoQueue.clean(24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 24 hours
      await this.instagramQueue.clean(24 * 60 * 60 * 1000, 'completed');
      await this.instagramQueue.clean(24 * 60 * 60 * 1000, 'failed');

      logger.info('Queue cleanup completed');
    } catch (error) {
      logger.error('Failed to clean queues:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await this.videoQueue.close();
      await this.instagramQueue.close();
      logger.info('Queue service closed');
    } catch (error) {
      logger.error('Failed to close queue service:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const queueService = new QueueService(); 