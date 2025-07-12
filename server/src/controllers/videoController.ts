import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { RunwayMLService } from '../services/runwayMLService';

interface AuthRequest extends Request {
  user?: any;
}

const runwayService = new RunwayMLService();

export const generateVideo = async (req: AuthRequest, res: Response) => {
  try {
    const {
      prompt,
      title,
      description,
      width = 1080,
      height = 1920,
      fps = 30,
      quality = 'high',
      tags = [],
      category,
    } = req.body;

    // Create video record
    const video = await prisma.video.create({
      data: {
        title,
        description,
        prompt,
        width,
        height,
        fps,
        quality,
        tags,
        category,
        userId: req.user.id,
        status: 'PENDING',
      },
    });

    // Add to generation queue
    await prisma.generationQueue.create({
      data: {
        prompt,
        settings: {
          width,
          height,
          fps,
          quality,
          videoId: video.id,
        },
        priority: 0,
        status: 'PENDING',
      },
    });

    logger.info(`Video generation queued: ${video.id} for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: { video },
    });
  } catch (error) {
    logger.error('Video generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during video generation',
    });
  }
};

export const getVideos = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId: req.user.id };
    if (status) where.status = status;
    if (category) where.category = category;

    const videos = await prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
      include: {
        analytics: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    const total = await prisma.video.count({ where });

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching videos',
    });
  }
};

export const getVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        analytics: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    res.json({
      success: true,
      data: { video },
    });
  } catch (error) {
    logger.error('Get video error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching video',
    });
  }
};

export const updateVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, tags, category } = req.body;

    const video = await prisma.video.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        title,
        description,
        tags,
        category,
      },
    });

    logger.info(`Video updated: ${id} by user: ${req.user.email}`);

    res.json({
      success: true,
      data: { video: updatedVideo },
    });
  } catch (error) {
    logger.error('Update video error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating video',
    });
  }
};

export const deleteVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    await prisma.video.delete({
      where: { id },
    });

    logger.info(`Video deleted: ${id} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    logger.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting video',
    });
  }
};

export const getQueueStatus = async (req: AuthRequest, res: Response) => {
  try {
    const queueItems = await prisma.generationQueue.findMany({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: 10,
    });

    const stats = await prisma.generationQueue.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    res.json({
      success: true,
      data: {
        queue: queueItems,
        stats: stats.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as any),
      },
    });
  } catch (error) {
    logger.error('Get queue status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching queue status',
    });
  }
}; 