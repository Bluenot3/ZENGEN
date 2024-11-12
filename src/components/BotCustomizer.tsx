import React, { useState } from 'react';
import { Bot } from '../types';
import { 
  Upload, Palette, Bot as BotIcon, Code, Image, Settings, 
  MessageSquare, MessageCircle, ClipboardCopy, Sparkles, 
  Zap, Brain, Gauge, Crown, Rocket
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import { ApiKeyManager } from './ApiKeyManager';
import { KnowledgeBase } from './KnowledgeBase';
import { TrainingConfig } from './TrainingConfig';
import { ModelConfig } from './ModelConfig';
import { AppearanceConfig } from './AppearanceConfig';
import { ChatPreview } from './ChatPreview';

interface BotCustomizerProps {
  bot: Bot;
  onUpdate: (bot: Bot) => void;
  onGenerateImage: (prompt: string) => Promise<string>;
}

export function BotCustomizer({ bot, onUpdate, onGenerateImage }: BotCustomizerProps) {
  const [imagePrompt, setImagePrompt] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [embedType, setEmbedType] = useState<'html' | 'iframe'>('html');
  const [activeTab, setActiveTab] = useState<'appearance' | 'knowledge' | 'training' | 'model' | 'preview'>('appearance');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...bot, avatar: reader.result as string });
        toast.success('Avatar updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    try {
      const imageUrl = await onGenerateImage(imagePrompt);
      onUpdate({ ...bot, avatar: imageUrl });
      setImagePrompt('');
      toast.success('Avatar generated successfully!');
    } catch (error) {
      toast.error('Failed to generate avatar');
    }
  };

  const getEmbedCode = (bot: Bot, type: 'html' | 'iframe') => {
    const baseUrl = 'https://your-bot-url';
    const config = {
      apiKey: bot.apiKey || '',
      model: bot.model,
      temperature: bot.temperature,
      maxTokens: bot.maxTokens,
      theme: bot.customizations.theme,
      primaryColor: bot.customizations.primaryColor,
      borderRadius: bot.customizations.borderRadius
    };

    if (type === 'html') {
      return `<div 
  id="bot-container-${bot.id}"
  data-bot-config='${JSON.stringify(config)}'
  style="
    width: 100%;
    height: 600px;
    border-radius: ${bot.customizations.borderRadius};
    overflow: hidden;
  "
></div>
<script src="${baseUrl}/bot-loader.js"></script>`;
    }

    return `<iframe
  src="${baseUrl}/embed/${bot.id}"
  style="border: none; border-radius: ${bot.customizations.borderRadius};"
  width="100%"
  height="600px"
  data-bot-config='${JSON.stringify(config)}'
></iframe>`;
  };

  const tabs = [
    { id: 'appearance', icon: Palette, label: 'Appearance', color: 'from-pink-500 to-rose-500' },
    { id: 'knowledge', icon: Brain, label: 'Knowledge', color: 'from-purple-500 to-indigo-500' },
    { id: 'training', icon: Gauge, label: 'Training', color: 'from-blue-500 to-cyan-500' },
    { id: 'model', icon: Rocket, label: 'Model', color: 'from-emerald-500 to-teal-500' },
    { id: 'preview', icon: MessageSquare, label: 'Preview', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative">
                    <img
                      src={bot.avatar}
                      alt={bot.name}
                      className="w-32 h-32 rounded-2xl object-cover ring-2 ring-white/20"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-2xl">
                      <div className="flex gap-2">
                        <label className="cursor-pointer p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                          <Upload className="w-6 h-6 text-white" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                        <button
                          onClick={() => document.getElementById('image-prompt')?.focus()}
                          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                        >
                          <Sparkles className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <input
                    type="text"
                    value={bot.name}
                    onChange={(e) => onUpdate({ ...bot, name: e.target.value })}
                    className="text-3xl font-bold bg-transparent border-none focus:outline-none text-white w-full"
                    placeholder="Name your bot..."
                  />
                  <div className="relative">
                    <input
                      id="image-prompt"
                      type="text"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white pr-24
                        focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Describe your bot's avatar..."
                    />
                    <button
                      onClick={handleGenerateImage}
                      disabled={!imagePrompt}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r 
                        from-purple-500 to-pink-500 rounded-lg text-white flex items-center gap-2
                        hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50
                        disabled:cursor-not-allowed"
                    >
                      <Zap className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* API Keys Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <ApiKeyManager apiKey={bot.apiKey} onChange={(key) => onUpdate({ ...bot, apiKey: key })} />
            </div>

            {/* Main Configuration Area */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex p-2 gap-2">
                {tabs.map(({ id, icon: Icon, label, color }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as typeof activeTab)}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 
                      transition-all ${
                      activeTab === id
                        ? `bg-gradient-to-r ${color} text-white`
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-8 min-h-[400px]">
                {activeTab === 'appearance' && <AppearanceConfig bot={bot} onUpdate={onUpdate} />}
                {activeTab === 'knowledge' && <KnowledgeBase bot={bot} onUpdate={onUpdate} />}
                {activeTab === 'training' && <TrainingConfig bot={bot} onUpdate={onUpdate} />}
                {activeTab === 'model' && <ModelConfig bot={bot} onUpdate={onUpdate} />}
                {activeTab === 'preview' && (
                  <div className="lg:hidden">
                    <ChatPreview bot={bot} />
                  </div>
                )}
              </div>
            </div>

            {/* Embed Code Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="flex items-center gap-2 text-white/80 hover:text-white"
                >
                  <Code className="w-5 h-5" />
                  {showCode ? 'Hide Code' : 'Show Code'}
                </button>
                {showCode && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-white/60">Embed Type:</span>
                    <div className="flex rounded-lg overflow-hidden p-1 bg-white/5">
                      {['html', 'iframe'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setEmbedType(type as 'html' | 'iframe')}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            embedType === type
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          {type.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {showCode && (
                <div className="space-y-4">
                  <SyntaxHighlighter
                    language="html"
                    style={atomDark}
                    className="rounded-xl !bg-white/5 !p-6"
                    customStyle={{ background: 'transparent' }}
                  >
                    {getEmbedCode(bot, embedType)}
                  </SyntaxHighlighter>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getEmbedCode(bot, embedType));
                      toast.success('Code copied to clipboard!');
                    }}
                    className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/80 
                      hover:text-white text-sm flex items-center gap-2 justify-center transition-colors"
                  >
                    <ClipboardCopy className="w-4 h-4" />
                    Copy Code
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chat Preview */}
          <div className="hidden lg:block sticky top-8">
            <ChatPreview bot={bot} />
          </div>
        </div>
      </div>
    </div>
  );
}