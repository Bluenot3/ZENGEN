import { Bot, ImageGenerationConfig } from '../types';

const REPLICATE_MODELS = {
  realistic: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  artistic: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
  anime: 'cjwbw/anything-v4.0:42a996d39a96aedc57b2e0aa8105dea39c9c89d9d266caf6bb4327a1c172674d',
  '3d': 'prompthero/openjourney:9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb'
};

export async function generateImage(
  config: ImageGenerationConfig,
  bot: Bot
): Promise<string> {
  if (!bot.apiKeys.openai && !bot.apiKeys.replicate) {
    throw new Error('No API key available for image generation');
  }

  // Try OpenAI DALL-E first if key is available
  if (bot.apiKeys.openai && config.model === 'dall-e-3') {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bot.apiKeys.openai}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: config.prompt,
          n: 1,
          size: config.size || '1024x1024',
          quality: 'standard',
          response_format: 'url',
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      // Update usage
      bot.apiUsage.cost += 0.04; // DALL-E 3 1024x1024 cost
      bot.apiUsage.history.push({
        timestamp: Date.now(),
        model: 'dall-e-3',
        tokens: 0,
        cost: 0.04,
        type: 'image',
      });

      return data.data[0].url;
    } catch (error) {
      console.error('DALL-E generation failed, falling back to Replicate');
    }
  }

  // Fallback to Replicate
  if (bot.apiKeys.replicate) {
    const modelVersion = REPLICATE_MODELS[config.style];
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${bot.apiKeys.replicate}`,
      },
      body: JSON.stringify({
        version: modelVersion,
        input: {
          prompt: config.prompt,
          negative_prompt: config.negativePrompt,
          num_outputs: 1,
        },
      }),
    });

    const prediction = await response.json();
    if (prediction.error) throw new Error(prediction.error);

    // Poll for completion
    const startTime = Date.now();
    while (Date.now() - startTime < 30000) {
      const result = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Token ${bot.apiKeys.replicate}`,
        },
      });
      
      const status = await result.json();
      if (status.status === 'succeeded') {
        // Update usage (approximate cost for Replicate)
        bot.apiUsage.cost += 0.01;
        bot.apiUsage.history.push({
          timestamp: Date.now(),
          model: `replicate-${config.style}`,
          tokens: 0,
          cost: 0.01,
          type: 'image',
        });
        
        return status.output[0];
      }
      
      if (status.status === 'failed') {
        throw new Error('Image generation failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Image generation timed out');
  }

  throw new Error('No available image generation service');
}