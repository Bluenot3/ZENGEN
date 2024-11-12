import React from 'react';
import { Bot } from '../types';
import { Brain, Sliders } from 'lucide-react';

interface TrainingConfigProps {
  bot: Bot;
  onUpdate: (bot: Bot) => void;
}

export function TrainingConfig({ bot, onUpdate }: TrainingConfigProps) {
  const handleExpertiseChange = (expertise: string) => {
    const updated = bot.training.expertise.includes(expertise)
      ? bot.training.expertise.filter((e) => e !== expertise)
      : [...bot.training.expertise, expertise];
    onUpdate({
      ...bot,
      training: { ...bot.training, expertise: updated },
    });
  };

  const expertiseOptions = [
    'General Knowledge',
    'Technical Support',
    'Customer Service',
    'Sales',
    'Marketing',
    'Programming',
    'Data Analysis',
    'Creative Writing',
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Brain className="w-5 h-5" /> Training Configuration
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-white/80 block mb-2">Personality</label>
          <textarea
            value={bot.training.personality}
            onChange={(e) =>
              onUpdate({
                ...bot,
                training: { ...bot.training, personality: e.target.value },
              })
            }
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white h-24"
            placeholder="Describe your bot's personality..."
          />
        </div>

        <div>
          <label className="text-sm text-white/80 block mb-2">Communication Tone</label>
          <select
            value={bot.training.tone}
            onChange={(e) =>
              onUpdate({
                ...bot,
                training: {
                  ...bot.training,
                  tone: e.target.value as Bot['training']['tone'],
                },
              })
            }
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="technical">Technical</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-white/80 block mb-2">Areas of Expertise</label>
          <div className="grid grid-cols-2 gap-2">
            {expertiseOptions.map((expertise) => (
              <label
                key={expertise}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  checked={bot.training.expertise.includes(expertise)}
                  onChange={() => handleExpertiseChange(expertise)}
                  className="rounded border-white/10"
                />
                <span>{expertise}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/80 block mb-2">
              <div className="flex items-center justify-between">
                <span>Temperature (Creativity)</span>
                <span>{bot.temperature.toFixed(1)}</span>
              </div>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={bot.temperature}
              onChange={(e) =>
                onUpdate({
                  ...bot,
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-white/80 block mb-2">Response Length</label>
            <select
              value={bot.training.responseLength}
              onChange={(e) =>
                onUpdate({
                  ...bot,
                  training: {
                    ...bot.training,
                    responseLength: e.target.value as Bot['training']['responseLength'],
                  },
                })
              }
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="concise">Concise</option>
              <option value="balanced">Balanced</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}