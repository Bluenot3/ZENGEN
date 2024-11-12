import React, { useState, useRef, useEffect } from 'react';
import { Bot, AIModel, ApiResponse } from '../types';
import { Send, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatPreviewProps {
  bot: Bot;
}

const MODEL_ENDPOINTS = {
  'gpt-3.5-turbo': {
    url: 'https://api.openai.com/v1/chat/completions',
    provider: 'openai',
    costPer1k: 0.002,
  },
  'gpt-4': {
    url: 'https://api.openai.com/v1/chat/completions',
    provider: 'openai',
    costPer1k: 0.03,
  },
  'claude-3.5-sonnet': {
    url: 'https://api.anthropic.com/v1/messages',
    provider: 'anthropic',
    costPer1k: 0.015,
  },
  'claude-3.5-haiku': {
    url: 'https://api.anthropic.com/v1/messages',
    provider: 'anthropic',
    costPer1k: 0.0025,
  },
  'cohere-command': {
    url: 'https://api.cohere.ai/v1/chat',
    provider: 'cohere',
    costPer1k: 0.0015,
  },
  'mistral-medium': {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    provider: 'openrouter',
    costPer1k: 0.002,
  },
} as const;

export function ChatPreview({ bot }: ChatPreviewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<AIModel>(bot.model);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const calculateCost = (tokens: number, model: AIModel) => {
    const modelConfig = MODEL_ENDPOINTS[model];
    return (tokens / 1000) * modelConfig.costPer1k;
  };

  const updateUsage = (tokens: number, model: AIModel, type: 'input' | 'output') => {
    const cost = calculateCost(tokens, model);
    const newUsage = {
      tokens: bot.apiUsage.tokens + tokens,
      cost: bot.apiUsage.cost + cost,
      history: [
        ...bot.apiUsage.history,
        {
          timestamp: Date.now(),
          model,
          tokens,
          cost,
          type,
        },
      ],
    };
    bot.apiUsage = newUsage;
  };

  const formatMessageForProvider = (
    messages: Message[],
    provider: keyof typeof MODEL_ENDPOINTS['gpt-3.5-turbo']
  ) => {
    switch (provider) {
      case 'anthropic':
        return {
          messages: messages.map(({ role, content }) => ({
            role: role === 'assistant' ? 'assistant' : 'user',
            content,
          })),
          model: currentModel,
          max_tokens: bot.maxTokens,
          temperature: bot.temperature,
        };
      case 'cohere':
        return {
          message: messages[messages.length - 1].content,
          chat_history: messages.slice(0, -1).map(({ role, content }) => ({
            role: role === 'assistant' ? 'CHATBOT' : 'USER',
            message: content,
          })),
          model: currentModel,
          max_tokens: bot.maxTokens,
          temperature: bot.temperature,
        };
      default:
        return {
          messages,
          model: currentModel,
          max_tokens: bot.maxTokens,
          temperature: bot.temperature,
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const modelConfig = MODEL_ENDPOINTS[currentModel];
    const apiKey = bot.apiKeys[modelConfig.provider];

    if (!apiKey) {
      toast.error(`Please add your ${modelConfig.provider} API key first`);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      switch (modelConfig.provider) {
        case 'openai':
          headers.Authorization = `Bearer ${apiKey}`;
          break;
        case 'anthropic':
          headers['x-api-key'] = apiKey;
          headers['anthropic-version'] = '2023-06-01';
          break;
        case 'openrouter':
          headers.Authorization = `Bearer ${apiKey}`;
          break;
        case 'cohere':
          headers.Authorization = `Bearer ${apiKey}`;
          break;
      }

      const allMessages = [
        {
          role: 'system',
          content: `You are ${bot.name}, an AI assistant with the following characteristics:
            Personality: ${bot.training.personality}
            Tone: ${bot.training.tone}
            Expertise: ${bot.training.expertise.join(', ')}
            ${bot.knowledge.customInstructions}`,
        },
        ...messages,
        { role: 'user', content: userMessage },
      ];

      const body = formatMessageForProvider(allMessages, modelConfig.provider);

      const response = await fetch(modelConfig.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data: ApiResponse = await response.json();
      
      if ('error' in data) {
        throw new Error(data.error.message);
      }

      if (data.usage) {
        updateUsage(data.usage.prompt_tokens, currentModel, 'input');
        updateUsage(data.usage.completion_tokens, currentModel, 'output');
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.choices[0].message.content },
      ]);
    } catch (error) {
      toast.error('Failed to get response from the AI model');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white/5 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={bot.avatar}
            alt={bot.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="font-medium text-white">{bot.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={currentModel}
            onChange={(e) => setCurrentModel(e.target.value as AIModel)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="claude-3.5-haiku">Claude 3.5 Haiku</option>
            <option value="cohere-command">Cohere Command</option>
            <option value="mistral-medium">Mistral Medium</option>
          </select>
          <button
            onClick={() => setMessages([])}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/60">
            <Sparkles className="w-8 h-8 mb-2" />
            <p>Start a conversation with your bot!</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-white/10 text-white">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              bot.apiKeys[MODEL_ENDPOINTS[currentModel].provider]
                ? "Type your message..."
                : `Please add your ${MODEL_ENDPOINTS[currentModel].provider} API key first`
            }
            disabled={
              !bot.apiKeys[MODEL_ENDPOINTS[currentModel].provider] || isLoading
            }
            className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={
              !bot.apiKeys[MODEL_ENDPOINTS[currentModel].provider] || isLoading
            }
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}