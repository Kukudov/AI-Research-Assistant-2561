import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useSettings } from '../contexts/SettingsContext';

const { FiSettings, FiKey, FiEye, FiEyeOff, FiCheck, FiX, FiInfo, FiExternalLink } = FiIcons;

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(settings.openRouterApiKey || '');
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSaveApiKey = () => {
    updateSettings({ openRouterApiKey: tempApiKey });
    setSaveStatus({ type: 'success', message: 'API key saved successfully!' });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleClearApiKey = () => {
    setTempApiKey('');
    updateSettings({ openRouterApiKey: '' });
    setSaveStatus({ type: 'success', message: 'API key cleared successfully!' });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const testApiKey = async () => {
    if (!tempApiKey) {
      setSaveStatus({ type: 'error', message: 'Please enter an API key first' });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${tempApiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Research Assistant'
        }
      });

      if (response.ok) {
        setSaveStatus({ type: 'success', message: 'API key is valid!' });
      } else {
        setSaveStatus({ type: 'error', message: 'Invalid API key' });
      }
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to validate API key' });
    }

    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Settings Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl neon-glow">
            <SafeIcon icon={FiSettings} className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <p className="text-gray-300">Configure your AI Research Assistant</p>
          </div>
        </div>
      </motion.div>

      {/* OpenRouter API Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-8"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl neon-glow">
            <SafeIcon icon={FiKey} className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">OpenRouter API Key</h3>
            <p className="text-gray-300 mb-4">
              Enter your OpenRouter API key to enable real AI responses. This key is stored locally and never sent to our servers.
            </p>

            <div className="bg-secondary-500/20 border border-secondary-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <SafeIcon icon={FiInfo} className="w-5 h-5 text-secondary-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-secondary-300 mb-1">How to get your API key:</h4>
                  <ol className="text-sm text-secondary-200 space-y-1 list-decimal list-inside">
                    <li>Visit <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-secondary-100">openrouter.ai</a></li>
                    <li>Sign up for an account</li>
                    <li>Go to the API Keys section</li>
                    <li>Create a new API key</li>
                    <li>Copy and paste it below</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-3 pr-12 bg-dark-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-gray-400"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <SafeIcon icon={showApiKey ? FiEyeOff : FiEye} className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSaveApiKey}
                  disabled={!tempApiKey}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                  Save API Key
                </button>
                <button
                  onClick={testApiKey}
                  disabled={!tempApiKey}
                  className="bg-gradient-to-r from-secondary-500 to-primary-500 text-white px-6 py-3 rounded-xl hover:from-secondary-600 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
                >
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                  Test API Key
                </button>
                <button
                  onClick={handleClearApiKey}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                  Clear
                </button>
              </div>

              {/* Save Status */}
              {saveStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg flex items-center gap-3 ${
                    saveStatus.type === 'success'
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  <SafeIcon icon={saveStatus.type === 'success' ? FiCheck : FiX} className="w-5 h-5" />
                  {saveStatus.message}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Privacy & Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-light rounded-2xl p-6 border border-primary-500/10"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Privacy & Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <SafeIcon icon={FiCheck} className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Local Storage</h4>
              <p className="text-sm text-gray-400">API keys are stored locally in your browser</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <SafeIcon icon={FiCheck} className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">No Server Storage</h4>
              <p className="text-sm text-gray-400">Your data never leaves your device</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <SafeIcon icon={FiCheck} className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Encrypted Connection</h4>
              <p className="text-sm text-gray-400">All API calls use HTTPS encryption</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <SafeIcon icon={FiCheck} className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Open Source</h4>
              <p className="text-sm text-gray-400">Code is transparent and auditable</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Current Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-8"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Current Configuration</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
            <span className="text-gray-300">API Key Status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              settings.openRouterApiKey 
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white' 
                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
            }`}>
              {settings.openRouterApiKey ? 'Configured' : 'Not Set'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
            <span className="text-gray-300">AI Mode</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              settings.openRouterApiKey 
                ? 'bg-gradient-to-r from-secondary-500 to-primary-500 text-white' 
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {settings.openRouterApiKey ? 'OpenRouter AI' : 'Demo Mode'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;