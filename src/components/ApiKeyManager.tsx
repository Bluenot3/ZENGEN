import React, { useState } from 'react';
import { Key, Eye, EyeOff, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiKeyManagerProps {
  apiKey?: string;
  onChange: (apiKey: string) => void;
}

export function ApiKeyManager({ apiKey, onChange }: ApiKeyManagerProps) {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    cohere: '',
    openrouter: ''
  });

  const handleSave = (provider: keyof typeof apiKeys, key: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: key }));
    onChange(key);
    toast.success(`${provider.toUpperCase()} API key saved successfully`);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Settings className="w-5 h-5" /> API Configuration
      </h3>

      {Object.entries(apiKeys).map(([provider, key]) => (
        <div key={provider} className="space-y-2">
          <label className="text-sm text-white/80 block">
            {provider.toUpperCase()} API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => handleSave(provider as keyof typeof apiKeys, e.target.value)}
              placeholder={`Enter your ${provider.toUpperCase()} API key`}
              className="w-full px-4 py-2 pr-10 rounded-lg bg-white/5 border border-white/10 text-white"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}