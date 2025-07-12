import { InstagramService } from './instagramService';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

interface MediaInsights {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

interface ViralityScore {
  engagementRate: number;
  viralScore: number;
  category: 'high' | 'medium' | 'low';
}

export const trackVideoPerformance = async (videoId: string, instagramId: string): Promise<MediaInsights | null> => {
  try {
    // Get user settings to get Instagram access token
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        user: {
          include: {
            settings: true
          }
        }
      }
    });

    if (!video || !video.user.settings?.instagramAccessToken) {
      logger.warn(`No Instagram access token found for video ${videoId}`);
      return null;
    }

    const instagram = new InstagramService(video.user.settings.instagramAccessToken);
    
    const insights = await instagram.getMediaInsights(instagramId, [
      'impressions',
      'reach',
      'likes',
      'comments',
      'shares',
      'saves',
    ]);

    await updateVideoAnalytics(videoId, insights);
    logger.info(`Analytics tracked for video ${videoId}:`, insights);
    
    return insights;
  } catch (error) {
    logger.error('Analytics tracking failed:', error);
    return null;
  }
};

export const generateViralityScore = (insights: MediaInsights): ViralityScore => {
  const {
    impressions,
    reach,
    likes,
    comments,
    shares,
    saves,
  } = insights;

  // Calculate engagement rate
  const engagementRate = impressions > 0 ? (likes + comments + shares + saves) / impressions : 0;
  
  // Calculate viral potential score
  const viralScore = impressions > 0 ? (shares * 3 + saves * 2 + comments * 1.5 + likes) / impressions * 100 : 0;
  
  return {
    engagementRate,
    viralScore,
    category: viralScore > 10 ? 'high' : viralScore > 5 ? 'medium' : 'low',
  };
};

const updateVideoAnalytics = async (videoId: string, insights: MediaInsights): Promise<void> => {
  try {
    const viralityScore = generateViralityScore(insights);

    // Update video with analytics data
    await prisma.video.update({
      where: { id: videoId },
      data: {
        impressions: insights.impressions,
        reach: insights.reach,
        likes: insights.likes,
        comments: insights.comments,
        shares: insights.shares,
        saves: insights.saves,
        engagementRate: viralityScore.engagementRate,
        viralScore: viralityScore.viralScore,
        viralityCategory: viralityScore.category,
        analyticsUpdatedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create analytics record
    await prisma.analytics.create({
      data: {
        videoId,
        impressions: insights.impressions,
        reach: insights.reach,
        likes: insights.likes,
        comments: insights.comments,
        shares: insights.shares,
        saves: insights.saves,
        engagementRate: viralityScore.engagementRate,
        viralScore: viralityScore.viralScore,
        viralityCategory: viralityScore.category,
        recordedAt: new Date()
      }
    });

    logger.info(`Analytics updated for video ${videoId}`);
  } catch (error) {
    logger.error('Failed to update video analytics:', error);
    throw error;
  }
};

export const getVideoAnalytics = async (videoId: string): Promise<any> => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        impressions: true,
        reach: true,
        likes: true,
        comments: true,
        shares: true,
        saves: true,
        engagementRate: true,
        viralScore: true,
        viralityCategory: true,
        analyticsUpdatedAt: true,
        postedAt: true
      }
    });

    if (!video) {
      return null;
    }

    return video;
  } catch (error) {
    logger.error('Failed to get video analytics:', error);
    throw error;
  }
};

export const getUserAnalytics = async (userId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<any> => {
  try {
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const videos = await prisma.video.findMany({
      where: {
        userId,
        postedAt: {
          gte: startDate
        },
        status: 'POSTED'
      },
      select: {
        id: true,
        title: true,
        impressions: true,
        reach: true,
        likes: true,
        comments: true,
        shares: true,
        saves: true,
        engagementRate: true,
        viralScore: true,
        viralityCategory: true,
        postedAt: true
      },
      orderBy: {
        postedAt: 'desc'
      }
    });

    // Calculate aggregate metrics
    const totalVideos = videos.length;
    const totalImpressions = videos.reduce((sum, v) => sum + (v.impressions || 0), 0);
    const totalReach = videos.reduce((sum, v) => sum + (v.reach || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
    const totalComments = videos.reduce((sum, v) => sum + (v.comments || 0), 0);
    const totalShares = videos.reduce((sum, v) => sum + (v.shares || 0), 0);
    const totalSaves = videos.reduce((sum, v) => sum + (v.saves || 0), 0);
    
    const avgEngagementRate = totalVideos > 0 ? 
      videos.reduce((sum, v) => sum + (v.engagementRate || 0), 0) / totalVideos : 0;
    
    const avgViralScore = totalVideos > 0 ? 
      videos.reduce((sum, v) => sum + (v.viralScore || 0), 0) / totalVideos : 0;

    // Calculate virality distribution
    const viralityDistribution = {
      high: videos.filter(v => v.viralityCategory === 'high').length,
      medium: videos.filter(v => v.viralityCategory === 'medium').length,
      low: videos.filter(v => v.viralityCategory === 'low').length,
    };

    return {
      summary: {
        totalVideos,
        totalImpressions,
        totalReach,
        totalLikes,
        totalComments,
        totalShares,
        totalSaves,
        avgEngagementRate,
        avgViralScore,
        viralityDistribution
      },
      videos,
      timeRange
    };
  } catch (error) {
    logger.error('Failed to get user analytics:', error);
    throw error;
  }
};

export const getTopPerformingVideos = async (userId: string, limit: number = 10): Promise<any[]> => {
  try {
    const videos = await prisma.video.findMany({
      where: {
        userId,
        status: 'POSTED',
        viralScore: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        impressions: true,
        reach: true,
        likes: true,
        comments: true,
        shares: true,
        saves: true,
        engagementRate: true,
        viralScore: true,
        viralityCategory: true,
        postedAt: true
      },
      orderBy: {
        viralScore: 'desc'
      },
      take: limit
    });

    return videos;
  } catch (error) {
    logger.error('Failed to get top performing videos:', error);
    throw error;
  }
};

export const scheduleAnalyticsUpdate = async (videoId: string, instagramId: string, delayHours: number = 24): Promise<void> => {
  try {
    // This would integrate with the queue service to schedule analytics updates
    // For now, we'll just log the intent
    logger.info(`Scheduling analytics update for video ${videoId} in ${delayHours} hours`);
    
    // In a full implementation, you would add this to the queue service
    // await queueService.addAnalyticsJob({
    //   videoId,
    //   instagramId,
    //   delay: delayHours * 60 * 60 * 1000
    // });
  } catch (error) {
    logger.error('Failed to schedule analytics update:', error);
    throw error;
  }
}; 