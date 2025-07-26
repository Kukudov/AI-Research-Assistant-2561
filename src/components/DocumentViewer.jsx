import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDocument } from '../contexts/DocumentContext';
import { useSettings } from '../contexts/SettingsContext';
import { generateDocumentSummary, extractDocumentKeyPoints, generateDocumentQuestions, analyzeDocumentSentiment, generateDocumentOutline, findDocumentGaps, generateActionItems, generateAllAnalyses } from '../utils/quickActions';

const { FiFile, FiCalendar, FiInfo, FiDownload, FiEye, FiZap, FiList, FiMessageSquare, FiHeart, FiMap, FiSearch, FiCheckSquare, FiLoader, FiPlay, FiCheck, FiCpu } = FiIcons;

const DocumentViewer = () => {
  const { document } = useDocument();
  const { settings, availableModels } = useSettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState('');
  const [results, setResults] = useState({});
  const [batchProgress, setBatchProgress] = useState(null);

  // Use the selected model from settings
  const selectedModel = settings.selectedModel;

  if (!document) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-12 text-center"
      >
        <SafeIcon icon={FiFile} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Document Loaded</h2>
        <p className="text-gray-300 mb-6">Upload a document to view its content and details</p>
        <button className="btn-modern">
          Go to Upload
        </button>
      </motion.div>
    );
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatModelName = (modelId) => {
    const model = availableModels.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  const handleQuickAction = async (actionType, actionFn) => {
    setIsProcessing(true);
    setProcessingAction(actionType);
    try {
      const result = await actionFn(document, settings.openRouterApiKey, selectedModel);
      setResults(prev => ({ ...prev, [actionType]: result }));
    } catch (error) {
      console.error(`Error in ${actionType}:`, error);
      alert(`Failed to ${actionType.toLowerCase()}: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingAction('');
    }
  };

  const handleBatchAnalysis = async () => {
    setIsProcessing(true);
    setBatchProgress({ current: 0, total: 7, operation: 'Starting...' });
    try {
      const analyses = await generateAllAnalyses(
        document,
        settings.openRouterApiKey,
        selectedModel,
        (progress) => setBatchProgress(progress)
      );
      // Update results with all analyses
      const newResults = {};
      analyses.forEach(analysis => {
        newResults[analysis.type] = analysis;
      });
      setResults(prev => ({ ...prev, ...newResults }));
      alert(`Generated ${analyses.length} analyses successfully!`);
    } catch (error) {
      console.error('Error in batch analysis:', error);
      alert(`Batch analysis failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setBatchProgress(null);
    }
  };

  const quickActions = [
    {
      id: 'summary',
      title: 'Generate Summary',
      description: 'Create a comprehensive summary',
      icon: FiInfo,
      color: 'blue',
      action: () => handleQuickAction('summary', generateDocumentSummary)
    },
    {
      id: 'keypoints',
      title: 'Extract Key Points',
      description: 'Identify main topics and insights',
      icon: FiList,
      color: 'green',
      action: () => handleQuickAction('keypoints', extractDocumentKeyPoints)
    },
    {
      id: 'questions',
      title: 'Generate Questions',
      description: 'Create study questions',
      icon: FiMessageSquare,
      color: 'purple',
      action: () => handleQuickAction('questions', generateDocumentQuestions)
    },
    {
      id: 'sentiment',
      title: 'Analyze Sentiment',
      description: 'Understand tone and emotion',
      icon: FiHeart,
      color: 'pink',
      action: () => handleQuickAction('sentiment', analyzeDocumentSentiment)
    },
    {
      id: 'outline',
      title: 'Create Outline',
      description: 'Structure the content',
      icon: FiMap,
      color: 'indigo',
      action: () => handleQuickAction('outline', generateDocumentOutline)
    },
    {
      id: 'gaps',
      title: 'Find Information Gaps',
      description: 'Identify missing information',
      icon: FiSearch,
      color: 'orange',
      action: () => handleQuickAction('gaps', findDocumentGaps)
    },
    {
      id: 'actions',
      title: 'Generate Action Items',
      description: 'Extract actionable tasks',
      icon: FiCheckSquare,
      color: 'teal',
      action: () => handleQuickAction('actions', generateActionItems)
    }
  ];

  return (
    <div className="space-y-8">
      {/* Document Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl neon-glow">
              <SafeIcon icon={FiFile} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Document Details</h2>
              <p className="text-gray-300">View and analyze your uploaded document</p>
            </div>
          </div>
          <SafeIcon icon={FiEye} className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SafeIcon icon={FiFile} className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">File Name</p>
                <p className="font-medium text-white">{document.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Upload Date</p>
                <p className="font-medium text-white">{formatDate(document.uploadDate)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SafeIcon icon={FiInfo} className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">File Type</p>
                <p className="font-medium text-white">{document.type}</p>
              </div>
            </div>
            {document.size && (
              <div className="flex items-center gap-3">
                <SafeIcon icon={FiDownload} className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">File Size</p>
                  <p className="font-medium text-white">{formatFileSize(document.size)}</p>
                </div>
              </div>
            )}
            {document.wordCount && (
              <div className="flex items-center gap-3">
                <SafeIcon icon={FiFile} className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Word Count</p>
                  <p className="font-medium text-white">{document.wordCount.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Quick Actions</h3>
          <div className="flex items-center gap-3">
            {/* Current Model Display */}
            {settings.openRouterApiKey && (
              <div className="flex items-center gap-2 px-3 py-1 bg-dark-800/50 border border-gray-600 rounded-lg">
                <SafeIcon icon={FiCpu} className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  Using: {formatModelName(selectedModel)}
                </span>
                {availableModels.find(m => m.id === selectedModel)?.isFree && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                    FREE
                  </span>
                )}
              </div>
            )}
            {settings.openRouterApiKey && (
              <button
                onClick={handleBatchAnalysis}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
              >
                <SafeIcon icon={isProcessing ? FiLoader : FiPlay} className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                {isProcessing ? 'Processing...' : 'Run All Analyses'}
              </button>
            )}
          </div>
        </div>

        {/* Batch Progress */}
        {batchProgress && (
          <div className="mb-6 p-4 bg-secondary-500/20 border border-secondary-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-secondary-200">
                {batchProgress.operation}
              </span>
              <span className="text-sm text-secondary-300">
                {batchProgress.current} / {batchProgress.total}
              </span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* API Key Warning */}
        {!settings.openRouterApiKey && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiInfo} className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-yellow-300">
                Configure your OpenRouter API key in Settings to enable AI-powered quick actions.
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              disabled={isProcessing || !settings.openRouterApiKey}
              className={`flex items-start gap-3 p-4 glass-light rounded-xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed relative card-hover`}
            >
              {results[action.id] && (
                <div className="absolute top-2 right-2">
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-primary-400" />
                </div>
              )}
              <div className={`p-2 bg-gradient-to-r from-${action.color}-500 to-${action.color}-600 rounded-lg neon-glow`}>
                <SafeIcon icon={action.icon} className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-white mb-1">{action.title}</h4>
                <p className="text-sm text-gray-400">{action.description}</p>
                {processingAction === action.id && (
                  <div className="flex items-center gap-2 mt-2">
                    <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin text-primary-500" />
                    <span className="text-xs text-primary-400">Processing...</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Document Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Document Content</h3>
          <div className="text-sm text-gray-400">
            {document.content.length.toLocaleString()} characters
          </div>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-6 max-h-96 overflow-y-auto border border-gray-600">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-gray-300 font-sans leading-relaxed">
              {document.content}
            </pre>
          </div>
        </div>
      </motion.div>

      {/* Results Display */}
      {Object.keys(results).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl shadow-xl border border-primary-500/20 p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Analysis Results</h3>
          <div className="space-y-6">
            {Object.entries(results).map(([type, result]) => (
              <div key={type} className="border-l-4 border-primary-500 pl-4">
                <h4 className="font-semibold text-white mb-2">{String(result.title || 'Analysis Result')}</h4>
                <div className="bg-dark-800/50 rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-600">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">
                    {String(result.content || 'No content available')}
                  </pre>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Generated: {result.createdAt ? new Date(result.createdAt).toLocaleString() : 'Unknown'}
                  {result.model && ` • Model: ${formatModelName(result.model)}`}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentViewer;