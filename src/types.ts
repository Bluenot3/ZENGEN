export interface Bot {
  id: string;
  name: string;
  avatar: string;
  apiKey?: string;
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-sonnet' | 'claude-3-haiku' | 'cohere-command' | 'custom';
  customModel?: string;
  temperature: number;
  maxTokens: number;
  customizations: {
    primaryColor: string;
    secondaryColor: string;
    font: string;
    borderRadius: string;
    theme: 'light' | 'dark' | 'system';
    chatBubbleStyle: 'modern' | 'classic' | 'minimal';
    avatarStyle: 'circle' | 'square' | 'rounded';
    showTimestamps: boolean;
    enableMarkdown: boolean;
    enableCodeHighlighting: boolean;
  };
  knowledge: {
    documents: KnowledgeDocument[];
    websiteUrls: string[];
    customInstructions: string;
  };
  training: {
    personality: string;
    tone: 'professional' | 'casual' | 'friendly' | 'technical';
    expertise: string[];
    contextWindow: number;
    responseLength: 'concise' | 'balanced' | 'detailed';
  };
  iframe: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'pdf' | 'webpage';
}

export interface BotCustomizerProps {
  bot: Bot;
  onUpdate: (bot: Bot) => void;
  onGenerateImage: (prompt: string) => Promise<string>;
}