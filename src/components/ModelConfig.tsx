import React from 'react';
import { Bot, AIModel } from '../types';
import { Cpu } from 'lucide-react';

interface ModelConfigProps {
  bot: Bot;
  onUpdate: (bot: Bot) => void;
}

export function ModelConfig({ bot, onUpdate }: ModelConfigProps) {
  const models: { value: AIModel; label: string }[] = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3.5-haiku', label: 'Claude 3.5 Haiku' },
    { value: 'cohere-command', label: 'Cohere Command' },
    { value: 'mistral-medium', label: 'Mistral Medium' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Cpu className="w-5 h-5" /> Model Configuration
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-white/80 block mb-2">Language Model</label>
          <select
            value={bot.model}
            onChange={(e) =>
              onUpdate({
                ...bot,
                model: e.target.value as AIModel,
              })
            }
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          >
            {models.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-white/80 block mb-2">
            <div className="flex items-center justify-between">
              <span>Max Tokens</span>
              <span>{bot.maxTokens}</span>
            </div>
          </label>
          <input
            type="range"
            min="100"
            max="4000"
            step="100"
            value={bot.maxTokens}
            onChange={(e) =>
              onUpdate({
                ...bot,
                maxTokens: parseInt(e.target.value),
              })
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}