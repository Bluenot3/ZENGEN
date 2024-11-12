import React from 'react';
import { Bot } from '../types';
import { Palette, MessageSquare, Settings } from 'lucide-react';

interface AppearanceConfigProps {
  bot: Bot;
  onUpdate: (bot: Bot) => void;
}

export function AppearanceConfig({ bot, onUpdate }: AppearanceConfigProps) {
  const themes = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ];

  const fonts = [
    { id: 'inter', label: 'Inter' },
    { id: 'roboto', label: 'Roboto' },
    { id: 'poppins', label: 'Poppins' },
  ];

  const chatBubbleStyles = [
    { id: 'modern', label: 'Modern' },
    { id: 'classic', label: 'Classic' },
    { id: 'minimal', label: 'Minimal' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label className="text-sm text-white/80 block mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => onUpdate({
                    ...bot,
                    customizations: {
                      ...bot.customizations,
                      theme: theme.id as 'light' | 'dark' | 'system'
                    }
                  })}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    bot.customizations.theme === theme.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-white/80 block mb-2">Primary Color</label>
            <input
              type="color"
              value={bot.customizations.primaryColor}
              onChange={(e) => onUpdate({
                ...bot,
                customizations: { ...bot.customizations, primaryColor: e.target.value }
              })}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm text-white/80 block mb-2">Font Family</label>
            <select
              value={bot.customizations.font}
              onChange={(e) => onUpdate({
                ...bot,
                customizations: { ...bot.customizations, font: e.target.value }
              })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              {fonts.map(font => (
                <option key={font.id} value={font.id}>{font.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-white/80 block mb-2">Chat Bubble Style</label>
            <div className="grid grid-cols-3 gap-2">
              {chatBubbleStyles.map(style => (
                <button
                  key={style.id}
                  onClick={() => onUpdate({
                    ...bot,
                    customizations: {
                      ...bot.customizations,
                      chatBubbleStyle: style.id as 'modern' | 'classic' | 'minimal'
                    }
                  })}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    bot.customizations.chatBubbleStyle === style.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-white/80 block mb-2">Border Radius</label>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={parseInt(bot.customizations.borderRadius)}
              onChange={(e) => onUpdate({
                ...bot,
                customizations: {
                  ...bot.customizations,
                  borderRadius: `${e.target.value}px`
                }
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>Square</span>
              <span>Rounded</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80 block">Additional Features</label>
            <label className="flex items-center gap-2 text-white/80">
              <input
                type="checkbox"
                checked={bot.customizations.showTimestamps}
                onChange={(e) => onUpdate({
                  ...bot,
                  customizations: {
                    ...bot.customizations,
                    showTimestamps: e.target.checked
                  }
                })}
                className="rounded border-white/10"
              />
              Show Timestamps
            </label>
            <label className="flex items-center gap-2 text-white/80">
              <input
                type="checkbox"
                checked={bot.customizations.enableMarkdown}
                onChange={(e) => onUpdate({
                  ...bot,
                  customizations: {
                    ...bot.customizations,
                    enableMarkdown: e.target.checked
                  }
                })}
                className="rounded border-white/10"
              />
              Enable Markdown
            </label>
            <label className="flex items-center gap-2 text-white/80">
              <input
                type="checkbox"
                checked={bot.customizations.enableCodeHighlighting}
                onChange={(e) => onUpdate({
                  ...bot,
                  customizations: {
                    ...bot.customizations,
                    enableCodeHighlighting: e.target.checked
                  }
                })}
                className="rounded border-white/10"
              />
              Enable Code Highlighting
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}