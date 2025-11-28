

import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { createChatInstance, sendMessageToAI, DEFAULT_SYSTEM_INSTRUCTION } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { ChatIcon } from './icons/ChatIcon';
import { UserIcon } from './icons/UserIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import { CogIcon } from './icons/CogIcon';
import { GraduationCapIcon } from './icons/GraduationCapIcon';
import InterviewPrep from './InterviewPrep';

const initialMessages: ChatMessage[] = [
  { id: 'ai-msg-initial', sender: 'ai', text: "Hello! I'm CareerBot, your AI career coach. How can I help you today? You can ask me for resume tips, interview advice, or general career questions." }
];

const AIChatbot: React.FC = () => {
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        return parsed.length > 0 ? parsed : initialMessages;
      }
    } catch (error) {
      console.error("Failed to load chat history from local storage:", error);
      localStorage.removeItem('chatHistory');
    }
    return initialMessages;
  });
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInterviewPrepOpen, setIsInterviewPrepOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_INSTRUCTION);
  const [promptInputValue, setPromptInputValue] = useState(systemPrompt);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with prompt from local storage or default
    const savedPrompt = localStorage.getItem('customSystemPrompt') || DEFAULT_SYSTEM_INSTRUCTION;
    setSystemPrompt(savedPrompt);
    setPromptInputValue(savedPrompt);
    setChatInstance(createChatInstance(savedPrompt));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history to local storage:", error);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !chatInstance || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    const aiResponseText = await sendMessageToAI(chatInstance, userInput);

    setMessages([...newMessages, { id: crypto.randomUUID(), sender: 'ai', text: aiResponseText }]);
    setIsLoading(false);
  };
  
  const handleReinitializeChat = (prompt: string) => {
      setChatInstance(createChatInstance(prompt));
      setMessages(initialMessages);
      setIsSettingsOpen(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('customSystemPrompt', promptInputValue);
    setSystemPrompt(promptInputValue);
    handleReinitializeChat(promptInputValue);
  };
  
  const handleResetSettings = () => {
    localStorage.removeItem('customSystemPrompt');
    const defaultPrompt = DEFAULT_SYSTEM_INSTRUCTION;
    setSystemPrompt(defaultPrompt);
    setPromptInputValue(defaultPrompt);
    handleReinitializeChat(defaultPrompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };
  
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the entire chat history? This action cannot be undone.')) {
      setMessages(initialMessages);
    }
  };
  
  const handleFeedback = (messageIndex: number, feedback: 'up' | 'down') => {
    setMessages(currentMessages => {
      const targetMessage = currentMessages[messageIndex];

      // Only AI messages with IDs can be rated, and only once.
      if (!targetMessage || targetMessage.sender !== 'ai' || !targetMessage.id || targetMessage.feedback) {
        return currentMessages;
      }

      // Log the feedback to a separate localStorage entry
      try {
        const feedbackLog = JSON.parse(localStorage.getItem('aiFeedbackLog') || '{}');
        feedbackLog[targetMessage.id] = feedback;
        localStorage.setItem('aiFeedbackLog', JSON.stringify(feedbackLog));
      } catch (error) {
        console.error("Failed to save feedback to local storage:", error);
      }

      // Update the message in the state to reflect the feedback in the UI
      return currentMessages.map((msg, index) => {
        if (index === messageIndex) {
          return { ...msg, feedback };
        }
        return msg;
      });
    });
  };

  return (
    <>
      <div className="bg-secondary shadow-lg rounded-lg max-w-4xl mx-auto flex flex-col h-[75vh] animate-fade-in-up border border-secondary-focus">
        <div className="p-4 border-b border-secondary-focus flex items-center bg-secondary rounded-t-lg">
          <ChatIcon className="h-8 w-8 text-primary" />
          <div className="ml-3">
              <h2 className="text-xl font-bold text-secondary-content">AI Career Coach</h2>
              <p className="text-sm text-base-content">Your personal guide to career success</p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <button
              onClick={() => setIsInterviewPrepOpen(true)}
              className="p-2 text-base-content hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-primary rounded-full transition-colors"
              aria-label="Open interview preparation module"
              title="Interview Prep"
            >
              <GraduationCapIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-base-content hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-primary rounded-full transition-colors"
              aria-label="Customize AI prompt"
              title="Customize AI"
            >
              <CogIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleClearChat}
              className="text-sm font-medium text-base-content hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-primary rounded-md px-3 py-1 transition-colors"
              aria-label="Clear chat history"
            >
              Clear Chat
            </button>
          </div>
        </div>
        <div className="flex-grow p-6 overflow-y-auto bg-base-100">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <ChatIcon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl max-w-lg break-words ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-secondary text-secondary-content rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === 'ai' && index > 0 && (
                  <div className="flex gap-1 self-center">
                    <button
                      onClick={() => handleFeedback(index, 'up')}
                      disabled={!!msg.feedback}
                      className={`p-1 rounded-full transition-colors ${
                        msg.feedback === 'up'
                          ? 'bg-primary/20 text-primary'
                          : 'text-gray-500 hover:text-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                      aria-label="Good response"
                      title="Good response"
                    >
                      <ThumbsUpIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(index, 'down')}
                      disabled={!!msg.feedback}
                      className={`p-1 rounded-full transition-colors ${
                        msg.feedback === 'down'
                          ? 'bg-red-500/20 text-red-400'
                          : 'text-gray-500 hover:text-red-400 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                      aria-label="Bad response"
                      title="Bad response"
                    >
                      <ThumbsDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {msg.sender === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-secondary-focus flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-6 h-6 text-secondary-content" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <ChatIcon className="w-6 h-6 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-secondary text-secondary-content rounded-bl-none">
                  <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 bg-base-content rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-base-content rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-base-content rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="p-4 border-t border-secondary-focus bg-secondary rounded-b-lg">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your career..."
              className="flex-grow p-3 border border-secondary-focus bg-base-100 rounded-full text-secondary-content focus:ring-primary focus:border-primary"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="bg-primary text-white rounded-full p-3 hover:bg-primary-focus disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {isInterviewPrepOpen && <InterviewPrep onClose={() => setIsInterviewPrepOpen(false)} />}

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-secondary rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 border border-secondary-focus">
            <h3 className="text-xl font-bold text-secondary-content">Customize AI Coach</h3>
            <p className="mt-1 text-sm text-base-content">
              Change the system prompt to alter the chatbot's personality and instructions. The chat will restart after saving.
            </p>
            <textarea
              value={promptInputValue}
              onChange={(e) => setPromptInputValue(e.target.value)}
              className="w-full h-40 p-3 mt-4 border border-secondary-focus bg-base-100 text-secondary-content rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={handleResetSettings}
                className="text-sm font-medium text-base-content hover:text-primary transition-colors"
              >
                Reset to Default
              </button>
              <div className="space-x-3">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-secondary-focus text-secondary-content rounded-md hover:bg-opacity-80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus transition-colors"
                >
                  Save & Restart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;