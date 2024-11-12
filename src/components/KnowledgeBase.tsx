import React, { useState } from 'react';
import { Bot, KnowledgeDocument } from '../types';
import { Book, Globe, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface KnowledgeBaseProps {
  bot: Bot;
  onUpdate: (bot: Bot) => void;
}

export function KnowledgeBase({ bot, onUpdate }: KnowledgeBaseProps) {
  const [newUrl, setNewUrl] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc: KnowledgeDocument = {
          id: crypto.randomUUID(),
          name: file.name,
          content: reader.result as string,
          type: 'text',
        };
        onUpdate({
          ...bot,
          knowledge: {
            ...bot.knowledge,
            documents: [...bot.knowledge.documents, newDoc],
          },
        });
        toast.success('Document added successfully');
      };
      reader.readAsText(file);
    }
  };

  const handleAddUrl = () => {
    if (!newUrl) return;
    onUpdate({
      ...bot,
      knowledge: {
        ...bot.knowledge,
        websiteUrls: [...bot.knowledge.websiteUrls, newUrl],
      },
    });
    setNewUrl('');
    toast.success('URL added successfully');
  };

  const handleRemoveDoc = (id: string) => {
    onUpdate({
      ...bot,
      knowledge: {
        ...bot.knowledge,
        documents: bot.knowledge.documents.filter((doc) => doc.id !== id),
      },
    });
    toast.success('Document removed');
  };

  const handleRemoveUrl = (url: string) => {
    onUpdate({
      ...bot,
      knowledge: {
        ...bot.knowledge,
        websiteUrls: bot.knowledge.websiteUrls.filter((u) => u !== url),
      },
    });
    toast.success('URL removed');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Book className="w-5 h-5" /> Knowledge Base
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-white/80 block mb-2">Custom Instructions</label>
          <textarea
            value={bot.knowledge.customInstructions}
            onChange={(e) =>
              onUpdate({
                ...bot,
                knowledge: { ...bot.knowledge, customInstructions: e.target.value },
              })
            }
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white h-24"
            placeholder="Enter custom instructions for your bot..."
          />
        </div>

        <div>
          <label className="text-sm text-white/80 block mb-2">Upload Documents</label>
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10">
            <Upload className="w-4 h-4" />
            <span>Choose File</span>
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <div className="space-y-2">
          {bot.knowledge.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/5"
            >
              <span className="text-white">{doc.name}</span>
              <button
                onClick={() => handleRemoveDoc(doc.id)}
                className="text-white/60 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm text-white/80 block mb-2">Website URLs</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              placeholder="Enter website URL"
            />
            <button
              onClick={handleAddUrl}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
            >
              Add URL
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {bot.knowledge.websiteUrls.map((url) => (
            <div
              key={url}
              className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/5"
            >
              <div className="flex items-center gap-2 text-white">
                <Globe className="w-4 h-4" />
                <span className="truncate">{url}</span>
              </div>
              <button
                onClick={() => handleRemoveUrl(url)}
                className="text-white/60 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}