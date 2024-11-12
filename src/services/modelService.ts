import { Bot, Message, ApiResponse } from '../types';
import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { CohereClient } from 'cohere-ai';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export async function generateResponse(bot: Bot, messages: Message[]): Promise<ApiResponse> {
  switch (bot.model) {
    case 'gpt-3.5-turbo':
    case 'gpt-4':
      return await generateOpenAIResponse(bot, messages);
    case 'claude-3.5-sonnet':
    case 'claude-3.5-haiku':
      return await generateAnthropicResponse(bot, messages);
    case 'cohere-command':
      return await generateCohereResponse(bot, messages);
    case 'mistral-medium':
    case 'llama-2-70b':
      return await generateBedrockResponse(bot, messages);
    default:
      throw new Error('Unsupported model');
  }
}

async function generateOpenAIResponse(bot: Bot, messages: Message[]): Promise<ApiResponse> {
  if (!bot.apiKeys.openai) throw new Error('OpenAI API key not configured');

  const openai = new OpenAI({ apiKey: bot.apiKeys.openai });
  
  const response = await openai.chat.completions.create({
    model: bot.model,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    })),
    temperature: bot.temperature,
    max_tokens: bot.maxTokens
  });

  return {
    choices: [{
      message: {
        content: response.choices[0].message.content || ''
      }
    }],
    usage: {
      prompt_tokens: response.usage?.prompt_tokens || 0,
      completion_tokens: response.usage?.completion_tokens || 0
    }
  };
}

async function generateAnthropicResponse(bot: Bot, messages: Message[]): Promise<ApiResponse> {
  if (!bot.apiKeys.anthropic) throw new Error('Anthropic API key not configured');

  const anthropic = new Anthropic({ apiKey: bot.apiKeys.anthropic });
  
  const response = await anthropic.messages.create({
    model: bot.model,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    })),
    max_tokens: bot.maxTokens,
    temperature: bot.temperature
  });

  return {
    choices: [{
      message: {
        content: response.content[0].text
      }
    }],
    usage: {
      prompt_tokens: 0, // Anthropic doesn't provide token counts
      completion_tokens: 0
    }
  };
}

async function generateCohereResponse(bot: Bot, messages: Message[]): Promise<ApiResponse> {
  if (!bot.apiKeys.cohere) throw new Error('Cohere API key not configured');

  const cohere = new CohereClient({ token: bot.apiKeys.cohere });
  
  const response = await cohere.generate({
    model: 'command',
    prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
    max_tokens: bot.maxTokens,
    temperature: bot.temperature
  });

  return {
    choices: [{
      message: {
        content: response.generations[0].text
      }
    }],
    usage: {
      prompt_tokens: 0, // Cohere doesn't provide token counts
      completion_tokens: 0
    }
  };
}

async function generateBedrockResponse(bot: Bot, messages: Message[]): Promise<ApiResponse> {
  if (!bot.apiKeys.openrouter) throw new Error('OpenRouter API key not configured');

  const bedrock = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: bot.apiKeys.openrouter,
      secretAccessKey: bot.apiKeys.openrouter
    }
  });

  const modelId = bot.model === 'mistral-medium' 
    ? 'mistral.mistral-medium'
    : 'meta.llama2-70b-chat-v1';

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
      max_tokens: bot.maxTokens,
      temperature: bot.temperature
    })
  });

  const response = await bedrock.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return {
    choices: [{
      message: {
        content: responseBody.generation
      }
    }],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0
    }
  };
}