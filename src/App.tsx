import React, { useState } from 'react';
import { Bot } from './types';
import { BotCustomizer } from './components/BotCustomizer';
import { Plus, Zap } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const defaultBot: Bot = {
  id: crypto.randomUUID(),
  name: 'New Bot',
  avatar: 'https://images.unsplash.com/photo-1675252271887-339c521bf7f7?q=80&w=200&auto=format&fit=crop',
  apiKeys: {
    openai: '',
    anthropic: '',
    openrouter: '',
    cohere: ''
  },
  apiUsage: {
    tokens: 0,
    cost: 0,
    history: []
  },
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000,
  customizations: {
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    font: 'Inter',
    borderRadius: '12px',
    theme: 'dark',
    chatBubbleStyle: 'modern',
    avatarStyle: 'circle'
  },
  knowledge: {
    documents: [],
    websiteUrls: [],
    customInstructions: ''
  },
  training: {
    personality: '',
    tone: 'professional',
    expertise: ['General Knowledge'],
    contextWindow: 4096,
    responseLength: 'balanced'
  },
  iframe: ''
};

function App() {
  const [bots, setBots] = useState<Bot[]>([defaultBot]);
  const [selectedBotId, setSelectedBotId] = useState<string>(defaultBot.id);

  const handleAddBot = () => {
    const newBot = { ...defaultBot, id: crypto.randomUUID() };
    setBots([...bots, newBot]);
    setSelectedBotId(newBot.id);
  };

  const handleUpdateBot = (updatedBot: Bot) => {
    setBots(bots.map(bot => bot.id === updatedBot.id ? updatedBot : bot));
  };

  const handleGenerateImage = async (prompt: string): Promise<string> => {
    const selectedBot = bots.find(bot => bot.id === selectedBotId);
    if (!selectedBot?.apiKeys?.openai) {
      throw new Error('Please add your OpenAI API key first');
    }
    
    // In a real implementation, this would call the OpenAI API
    // For demo purposes, we'll return a placeholder
    return 'https://images.unsplash.com/photo-1675252271887-339c521bf7f7?q=80&w=200&auto=format&fit=crop';
  };

  const selectedBot = bots.find(bot => bot.id === selectedBotId) || bots[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-indigo-400" />
            <h1 className="text-4xl font-bold text-white">ZEN BUILD</h1>
          </div>
          <p className="text-white/60">Create and customize your AI bots with ease</p>
        </header>

        <div className="flex gap-6 mb-8 overflow-x-auto pb-4">
          {bots.map(bot => (
            <button
              key={bot.id}
              onClick={() => setSelectedBotId(bot.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                selectedBotId === bot.id
                  ? 'bg-white/10 text-white'
                  : 'bg-transparent text-white/60 hover:bg-white/5'
              }`}
            >
              <img
                src={bot.avatar}
                alt={bot.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span>{bot.name}</span>
            </button>
          ))}
          <button
            onClick={handleAddBot}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Bot
          </button>
        </div>

        <BotCustomizer
          bot={selectedBot}
          onUpdate={handleUpdateBot}
          onGenerateImage={handleGenerateImage}
        />
      </div>
    </div>
  );
}

export default App;