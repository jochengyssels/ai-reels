import { generateVideo } from './runwayMLService';

export const optimizeForViral = async (basePrompt: string, contentType: string) => {
  const viralElements = {
    'lifestyle': ['trending', 'aesthetic', 'inspiring'],
    'entertainment': ['surprising', 'humorous', 'engaging'],
    'educational': ['quick tip', 'life hack', 'tutorial'],
  };

  const elements = viralElements[contentType as keyof typeof viralElements] || [];
  const optimizedPrompt = `${basePrompt}, ${elements.join(', ')}, cinematic lighting, high production value`;

  return optimizedPrompt;
};

export const generateMultipleVariations = async (prompt: string, imageUrl: string, count: number = 3) => {
  const variations = [];
  const baseOptions = {
    model: 'gen4_turbo',
    ratio: '9:16',
    duration: 10,
  };

  for (let i = 0; i < count; i++) {
    const variation = await generateVideo(
      prompt,
      imageUrl,
      {
        ...baseOptions,
        seed: Math.floor(Math.random() * 1000000),
      }
    );
    variations.push(variation);
  }

  return variations;
}; 