import { Router } from 'express';
import { body } from 'express-validator';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Validation rules
const updateSettingsValidation = [
  body('defaultWidth').optional().isInt({ min: 480, max: 1920 }).withMessage('Default width must be between 480 and 1920'),
  body('defaultHeight').optional().isInt({ min: 480, max: 1920 }).withMessage('Default height must be between 480 and 1920'),
  body('defaultFps').optional().isInt({ min: 24, max: 60 }).withMessage('Default FPS must be between 24 and 60'),
  body('defaultQuality').optional().isIn(['low', 'medium', 'high']).withMessage('Default quality must be low, medium, or high'),
  body('defaultLanguage').optional().isString().withMessage('Default language must be a string'),
  body('autoPost').optional().isBoolean().withMessage('Auto post must be a boolean'),
  body('postSchedule').optional().isString().withMessage('Post schedule must be a string'),
  body('defaultCaption').optional().isString().withMessage('Default caption must be a string'),
  body('defaultHashtags').optional().isArray().withMessage('Default hashtags must be an array'),
  body('emailNotifications').optional().isBoolean().withMessage('Email notifications must be a boolean'),
  body('pushNotifications').optional().isBoolean().withMessage('Push notifications must be a boolean'),
];

// Routes
router.get('/', authenticate, getSettings);
router.put('/', authenticate, updateSettingsValidation, validateRequest, updateSettings);

export default router; 