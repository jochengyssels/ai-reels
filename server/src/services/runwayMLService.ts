import RunwayML from '@runwayml/sdk';

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET,
});

export const generateVideo = async (prompt: string, imageUrl: string, options: any = {}) => {
  try {
    const videoTask = await client.imageToVideo.create({
      model: options.model || 'gen4_turbo',
      promptImage: imageUrl,
      promptText: prompt,
      ratio: options.ratio || '9:16', // Perfect for Instagram Reels
      duration: options.duration || 10,
      seed: options.seed,
      // watermark: false, // Not supported by SDK
    });

    return await pollForCompletion(videoTask.id);
  } catch (error: any) {
    console.error('RunwayML generation failed:', error);
    throw new Error(`Video generation failed: ${error.message}`);
  }
};

const pollForCompletion = async (taskId: string): Promise<string> => {
  while (true) {
    const task = await client.tasks.retrieve(taskId);

    if (task.status === 'SUCCEEDED') {
      if (task.output && task.output.length > 0) {
        return task.output[0];
      } else {
        throw new Error('Task succeeded but no output was returned.');
      }
    } else if (task.status === 'FAILED') {
      // Use 'error' property if available, otherwise fallback
      const failReason = (task as any).error || 'Unknown error';
      throw new Error(`Task failed: ${failReason}`);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}; 