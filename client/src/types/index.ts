export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  prompt: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'POSTED' | 'ARCHIVED';
  duration?: number;
  thumbnail?: string;
  videoUrl?: string;
  runwayJobId?: string;
  instagramPostId?: string;
  width: number;
  height: number;
  fps: number;
  quality: string;
  tags: string[];
  category?: string;
  language: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  generatedAt?: string;
  postedAt?: string;
  userId: string;
}

export interface Settings {
  id: string;
  instagramConnected: boolean;
  instagramAccountId?: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultFps: number;
  defaultQuality: string;
  defaultLanguage: string;
  autoPost: boolean;
  postSchedule?: string;
  defaultCaption?: string;
  defaultHashtags: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Analytics {
  id: string;
  date: string;
  metric: string;
  value: number;
  platform: string;
  userId: string;
  videoId?: string;
}

export interface GenerationOptions {
  model?: string;
  ratio?: string;
  duration?: number;
  seed?: number;
  contentType?: string;
  optimizeForViral?: boolean;
  generateVariations?: boolean;
  variationCount?: number;
} 