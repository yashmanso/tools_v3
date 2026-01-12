'use client';

import { useState, useRef, useEffect } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { PanelLink } from './PanelLink';
import { convertMarkdownLinksToHTML } from '../lib/markdownLinks';

interface ChatBotProps {
  allResources: ResourceMetadata[];
  isOpen?: boolean;
  onClose?: () => void;
}

interface Message {
  type: 'user' | 'bot';
  content: string;
  suggestions?: ResourceMetadata[];
}

// Intent detection patterns
const intentPatterns = {
  assess: ['assess', 'evaluate', 'measure', 'analyze', 'review', 'check', 'examine'],
  map: ['map', 'visualize', 'understand', 'explore', 'identify', 'discover'],
  report: ['report', 'document', 'communicate', 'share', 'present'],
  align: ['align', 'strategize', 'plan', 'strategy', 'goal', 'objective'],
  startup: ['startup', 'start-up', 'early stage', 'new venture', 'new business'],
  sustainability: ['sustainability', 'sustainable', 'environment', 'social', 'circular', 'eco'],
  business: ['business model', 'business', 'venture', 'company', 'organization'],
  product: ['product', 'design', 'innovation'],
  process: ['process', 'workflow', 'method'],
};

// Extract keywords from user input
function extractKeywords(input: string): string[] {
  const lowerInput = input.toLowerCase();
  const keywords: string[] = [];
  
  // Check for intent keywords
  Object.entries(intentPatterns).forEach(([intent, patterns]) => {
    if (patterns.some(pattern => lowerInput.includes(pattern))) {
      keywords.push(intent);
    }
  });
  
  // Extract tag-like keywords
  const tagKeywords = [
    'entrepreneur', 'researcher', 'student', 'educator', 'startup', 'SME', 'corporation',
    'ideation', 'design', 'development', 'implementation', 'growth',
    'environmental', 'social', 'economic', 'circular economy',
    'product innovation', 'process innovation', 'business model innovation',
  ];
  
  tagKeywords.forEach(tag => {
    if (lowerInput.includes(tag)) {
      keywords.push(tag.replace(/\s+/g, '-'));
    }
  });
  
  return keywords;
}

// Find matching tools based on keywords
function findMatchingTools(
  keywords: string[],
  allResources: ResourceMetadata[]
): ResourceMetadata[] {
  const tools = allResources.filter(r => r.category === 'tools');
  
  if (keywords.length === 0) {
    return tools.slice(0, 5);
  }
  
  // Score tools based on keyword matches
  const scoredTools = tools.map(tool => {
    let score = 0;
    
    keywords.forEach(keyword => {
      // Check tags
      if (tool.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))) {
        score += 2;
      }
      // Check title
      if (tool.title.toLowerCase().includes(keyword.toLowerCase())) {
        score += 3;
      }
      // Check overview
      if (tool.overview?.toLowerCase().includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    return { tool, score };
  });
  
  return scoredTools
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.tool);
}

// Generate bot response
function generateResponse(
  userInput: string,
  allResources: ResourceMetadata[]
): { message: string; suggestions?: ResourceMetadata[] } {
  const lowerInput = userInput.toLowerCase();
  
  // Greeting responses
  if (lowerInput.match(/^(hi|hello|hey|greetings)/)) {
    return {
      message: "Hello! I'm here to help you find the right sustainability tools. What are you trying to accomplish? For example, you could say 'I need to assess my startup's sustainability' or 'I want to map out my business model'.",
    };
  }
  
  // Help responses
  if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
    return {
      message: "I can help you find tools based on what you need. Try describing your goal, like:\n• 'I need to assess sustainability'\n• 'I want to map my business model'\n• 'I'm looking for tools for startups'\n• 'I need help with circular economy'",
    };
  }
  
  // Extract keywords and find tools
  const keywords = extractKeywords(userInput);
  const matchingTools = findMatchingTools(keywords, allResources);
  
  if (matchingTools.length > 0) {
    const toolNames = matchingTools.map(t => t.title).join(', ');
    return {
      message: `Based on what you're looking for, here are some tools that might help:`,
      suggestions: matchingTools,
    };
  }
  
  // Default response with follow-up questions
  const followUps = [
    "What stage are you at? (ideation, design, development, etc.)",
    "What's your main goal? (assess, map, report, align)",
    "What type of organization are you? (startup, SME, corporation, etc.)",
  ];
  
  return {
    message: `I'd like to help you find the right tool. Could you tell me more about:\n${followUps.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
  };
}

export function ChatBot({ allResources, isOpen: externalIsOpen, onClose }: ChatBotProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: "Hi! I'm here to help you find the right sustainability tools. What are you trying to accomplish?",
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = onClose ? () => onClose() : () => setInternalIsOpen(false);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Generate bot response
    setTimeout(() => {
      const response = generateResponse(userMessage.content, allResources);
      const botMessage: Message = {
        type: 'bot',
        content: response.message,
        suggestions: response.suggestions,
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-24 right-6 z-50 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tool finder</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ask me anything about tools</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close chat"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.suggestions.map((tool) => (
                        <PanelLink
                          key={tool.slug}
                          href={`/${tool.category}/${tool.slug}`}
                          className="block p-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {tool.title}
                          </div>
                          {tool.overview && (
                            <div 
                              className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: convertMarkdownLinksToHTML(tool.overview.substring(0, 100) + '...') }}
                            />
                          )}
                        </PanelLink>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
  );
}
