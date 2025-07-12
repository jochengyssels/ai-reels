import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id },
    });

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await prisma.settings.create({
        data: {
          userId: req.user.id,
        },
      });

      return res.json({
        success: true,
        data: { settings: defaultSettings },
      });
    }

    res.json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching settings',
    });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      defaultWidth,
      defaultHeight,
      defaultFps,
      defaultQuality,
      defaultLanguage,
      autoPost,
      postSchedule,
      defaultCaption,
      defaultHashtags,
      emailNotifications,
      pushNotifications,
    } = req.body;

    const updatedSettings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: {
        defaultWidth,
        defaultHeight,
        defaultFps,
        defaultQuality,
        defaultLanguage,
        autoPost,
        postSchedule,
        defaultCaption,
        defaultHashtags,
        emailNotifications,
        pushNotifications,
      },
      create: {
        userId: req.user.id,
        defaultWidth,
        defaultHeight,
        defaultFps,
        defaultQuality,
        defaultLanguage,
        autoPost,
        postSchedule,
        defaultCaption,
        defaultHashtags,
        emailNotifications,
        pushNotifications,
      },
    });

    logger.info(`Settings updated for user: ${req.user.email}`);

    res.json({
      success: true,
      data: { settings: updatedSettings },
    });
  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating settings',
    });
  }
}; 