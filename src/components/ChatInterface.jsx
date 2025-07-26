import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDocument } from '../contexts/DocumentContext';
import { useSettings } from '../contexts/SettingsContext';
import { generateResponse } from '../utils/aiProcessor';
import { fetchOpenRouterModels, getModelPricing } from '../utils/openRouterApi';

const { FiMessageCircle, FiSend, FiUser, FiCpu, FiCopy, FiCheck, FiAlertCircle, FiChevronDown, FiRefreshCw, FiStar, FiDollarSign, FiFilter, FiSearch, FiTag } = FiIcons;

const ChatInterface = () => {
  const { document } = useDocument();
  const { settings, updateSelectedModel, availableModels, updateAvailableModels } = useSettings();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelFilter, setModelFilter] = useState('free');
  const [modelSearch, setModelSearch] = useState('');
  const messagesEndRef = useRef(null);

  const selectedModel = settings.selectedModel;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (settings.openRouterApiKey) {
      loadModels();
    }
  }, [settings.openRouterApiKey]);

  const loadModels = async () => {
    setLoadingModels(true);
    try {
      const models = await fetchOpenRouterModels(settings.openRouterApiKey);
      updateAvailableModels(models);
      const currentModel = models.find(m => m.id === selectedModel);
      if (!currentModel || !currentModel.isFree) {
        const firstFreeModel = models.find(m => m.isFree);
        if (firstFreeModel) {
          updateSelectedModel(firstFreeModel.id);
        }
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !document) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateResponse(
        input,
        document.content,
        settings.openRouterApiKey,
        selectedModel
      );

      let aiMessage;
      if (typeof response === 'string') {
        aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response,
          timestamp: new Date().toISOString(),
          model: selectedModel
        };
      } else if (response && typeof response === 'object' && response.content) {
        aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: String(response.content),
          timestamp: new Date().toISOString(),
          model: response.model || selectedModel,
          usage: response.usage
        };
      } else {
        throw new Error('Invalid response format');
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I apologize, but I encountered an error: ${error.message}. Please check your API key and try again.`,
        timestamp: new Date().toISOString(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const suggestedQuestions = [
    "What are the main points of this document?",
    "Can you summarize this in 3 key takeaways?",
    "What are the most important findings?",
    "Are there any actionable recommendations?"
  ];

  const formatModelName = (modelId) => {
    const model = availableModels.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  const getFilteredModels = () => {
    let filtered = availableModels;

    if (modelSearch) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
        model.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
        model.provider.toLowerCase().includes(modelSearch.toLowerCase())
      );
    }

    switch (modelFilter) {
      case 'free':
        filtered = filtered.filter(model => model.isFree);
        break;
      case 'paid':
        filtered = filtered.filter(model => !model.isFree);
        break;
      case 'anthropic':
        filtered = filtered.filter(model => model.category === 'Anthropic');
        break;
      case 'openai':
        filtered = filtered.filter(model => model.category === 'OpenAI');
        break;
      case 'meta':
        filtered = filtered.filter(model => model.category === 'Meta');
        break;
      case 'google':
        filtered = filtered.filter(model => model.category === 'Google');
        break;
      default:
        break;
    }

    return filtered;
  };

  const groupModelsByCategory = (models) => {
    const grouped = {};
    models.forEach(model => {
      if (!grouped[model.category]) {
        grouped[model.category] = [];
      }
      grouped[model.category].push(model);
    });
    return grouped;
  };

  if (!document) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-12 text-center"
      >
        <SafeIcon icon={FiAlertCircle} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Document Available</h2>
        <p className="text-gray-300 mb-6">Please upload a document first to start asking questions</p>
        <button className="btn-modern">
          Upload Document
        </button>
      </motion.div>
    );
  }

  const filteredModels = getFilteredModels();
  const groupedModels = groupModelsByCategory(filteredModels);

  return (
    <div className="space-y-6">
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl neon-glow">
              <SafeIcon icon={FiMessageCircle} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ask Questions</h2>
              <p className="text-gray-300">Chat with your document: {document.name}</p>
            </div>
          </div>

          {/* Model Selection */}
          {settings.openRouterApiKey && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 border border-gray-600 rounded-xl hover:bg-dark-700 transition-colors"
                >
                  <SafeIcon icon={FiCpu} className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">
                    {formatModelName(selectedModel)}
                  </span>
                  {availableModels.find(m => m.id === selectedModel)?.isFree && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                      FREE
                    </span>
                  )}
                  <SafeIcon icon={FiChevronDown} className="w-4 h-4 text-gray-400" />
                </button>

                {showModelDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-96 glass rounded-xl shadow-lg z-10 max-h-80 overflow-hidden border border-primary-500/20">
                    <div className="p-4 border-b border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-300">Select Model</span>
                        <button
                          onClick={loadModels}
                          disabled={loadingModels}
                          className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-50"
                        >
                          <SafeIcon icon={FiRefreshCw} className={`w-4 h-4 ${loadingModels ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      <div className="relative mb-3">
                        <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search models..."
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-white placeholder-gray-400"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'all', label: 'All' },
                          { value: 'free', label: 'Free' },
                          { value: 'paid', label: 'Paid' },
                          { value: 'anthropic', label: 'Anthropic' },
                          { value: 'openai', label: 'OpenAI' },
                          { value: 'meta', label: 'Meta' },
                          { value: 'google', label: 'Google' }
                        ].map(filter => (
                          <button
                            key={filter.value}
                            onClick={() => setModelFilter(filter.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              modelFilter === filter.value
                                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {loadingModels ? (
                        <div className="p-4 text-center text-gray-500">Loading models...</div>
                      ) : Object.keys(groupedModels).length > 0 ? (
                        Object.entries(groupedModels).map(([category, models]) => (
                          <div key={category}>
                            <div className="px-4 py-2 bg-dark-800 border-b border-gray-600">
                              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                {category}
                              </span>
                            </div>
                            {models.map((model) => (
                              <button
                                key={model.id}
                                onClick={() => {
                                  updateSelectedModel(model.id);
                                  setShowModelDropdown(false);
                                }}
                                className={`w-full text-left p-3 hover:bg-dark-700 transition-colors border-b border-gray-700 ${
                                  selectedModel === model.id ? 'bg-primary-500/20 text-primary-300' : 'text-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{model.name}</span>
                                      {model.isFree && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                                          FREE
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {model.id} • {model.contextLength.toLocaleString()} tokens
                                    </div>
                                    {!model.isFree && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {getModelPricing(model)}
                                      </div>
                                    )}
                                  </div>
                                  {selectedModel === model.id && (
                                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-primary-400" />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          {modelSearch ? 'No models found matching your search' : 'No models available'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!settings.openRouterApiKey && (
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-yellow-300">
                Running in demo mode. Configure your OpenRouter API key in Settings for real AI responses.
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Chat Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-6"
      >
        <div className="h-96 overflow-y-auto space-y-4 mb-4" id="messages-container">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <SafeIcon icon={FiMessageCircle} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Start a conversation by asking a question about your document</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white' 
                        : message.error 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-dark-700 text-gray-300'
                    }`}>
                      <SafeIcon icon={message.type === 'user' ? FiUser : FiCpu} className="w-4 h-4" />
                    </div>
                    <div className={`relative group ${
                      message.type === 'user' 
                        ? 'message-bubble user' 
                        : message.error 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30 rounded-2xl px-4 py-3' 
                          : 'message-bubble ai'
                    } max-w-md`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-white">
                        {String(message.content)}
                      </div>
                      {message.type === 'ai' && message.model && (
                        <div className="mt-2 text-xs text-gray-400">
                          Model: {formatModelName(message.model)}
                          {message.usage && (
                            <span className="ml-2">
                              • {message.usage.prompt_tokens} prompt + {message.usage.completion_tokens} completion tokens
                            </span>
                          )}
                        </div>
                      )}
                      {message.type === 'ai' && !message.error && (
                        <button
                          onClick={() => copyToClipboard(String(message.content), message.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-600"
                          title="Copy response"
                        >
                          <SafeIcon icon={copiedId === message.id ? FiCheck : FiCopy} className={`w-3 h-3 ${copiedId === message.id ? 'text-primary-400' : 'text-gray-400'}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiCpu} className="w-4 h-4 text-gray-300" />
              </div>
              <div className="message-bubble ai">
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your document..."
            className="flex-1 px-4 py-3 bg-dark-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <SafeIcon icon={FiSend} className="w-5 h-5" />
          </button>
        </form>
      </motion.div>

      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-light rounded-2xl p-6 border border-primary-500/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Suggested Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-left p-4 bg-dark-800/30 rounded-xl hover:bg-dark-700/50 transition-all text-gray-300 hover:text-white border border-transparent hover:border-primary-500/30"
              >
                {question}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatInterface;