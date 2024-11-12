import { Bot, Message, ConversationMemory } from '../types';

export function summarizeConversation(messages: Message[]): string {
  // Extract key points and create a summary
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
  const assistantMessages = messages.filter(m => m.role === 'assistant').map(m => m.content);
  
  return `User discussed: ${userMessages.join(', ')}. Bot responded with: ${assistantMessages.join(', ')}`;
}

export function extractTopics(messages: Message[]): string[] {
  // Simple keyword extraction (in production, use NLP libraries)
  const text = messages.map(m => m.content).join(' ');
  const words = text.toLowerCase().split(/\W+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  
  const topics = words
    .filter(word => word.length > 3 && !stopWords.has(word))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
  return Object.entries(topics)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic);
}

export function analyzeSentiment(messages: Message[]): 'positive' | 'neutral' | 'negative' {
  const text = messages.map(m => m.content).join(' ').toLowerCase();
  
  const positiveWords = ['great', 'good', 'excellent', 'amazing', 'wonderful', 'happy', 'thanks'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'unhappy', 'wrong', 'error'];
  
  const positiveScore = positiveWords.reduce((score, word) => 
    score + (text.split(word).length - 1), 0);
  const negativeScore = negativeWords.reduce((score, word) => 
    score + (text.split(word).length - 1), 0);
    
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

export function updateConversationMemory(bot: Bot, messages: Message[]): void {
  if (!bot.knowledge.learningEnabled) return;
  
  const memory: ConversationMemory = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    conversation: messages,
    summary: summarizeConversation(messages),
    topics: extractTopics(messages),
    sentiment: analyzeSentiment(messages),
  };
  
  // Add new memory
  bot.knowledge.conversationMemory.push(memory);
  
  // Limit memory size
  const totalTokens = bot.knowledge.conversationMemory.reduce(
    (sum, mem) => sum + mem.conversation.reduce((t, m) => t + (m.tokens || 0), 0),
    0
  );
  
  while (
    totalTokens > bot.knowledge.maxMemoryTokens && 
    bot.knowledge.conversationMemory.length > 1
  ) {
    bot.knowledge.conversationMemory.shift();
  }
}

export function getRelevantMemories(bot: Bot, currentMessage: string): ConversationMemory[] {
  if (!bot.knowledge.learningEnabled) return [];
  
  // Simple keyword matching (in production, use embeddings and semantic search)
  const keywords = currentMessage.toLowerCase().split(/\W+/);
  
  return bot.knowledge.conversationMemory
    .map(memory => ({
      memory,
      relevance: keywords.reduce((score, keyword) => 
        score + (memory.summary.toLowerCase().includes(keyword) ? 1 : 0), 0
      )
    }))
    .filter(({ relevance }) => relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3)
    .map(({ memory }) => memory);
}