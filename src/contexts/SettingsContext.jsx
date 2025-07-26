import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    openRouterApiKey: '',
    selectedModel: 'meta-llama/llama-3-8b-instruct:free', // Default to free model
    temperature: 0.7,
    maxTokens: 1000
  });

  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('aiResearchSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings
        }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      
      // Save to localStorage
      try {
        localStorage.setItem('aiResearchSettings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
      
      return updatedSettings;
    });
  };

  const updateSelectedModel = (modelId) => {
    updateSettings({ selectedModel: modelId });
  };

  const updateAvailableModels = (models) => {
    setAvailableModels(models);
  };

  const clearSettings = () => {
    setSettings({
      openRouterApiKey: '',
      selectedModel: 'meta-llama/llama-3-8b-instruct:free',
      temperature: 0.7,
      maxTokens: 1000
    });
    setAvailableModels([]);
    localStorage.removeItem('aiResearchSettings');
  };

  const value = {
    settings,
    updateSettings,
    updateSelectedModel,
    availableModels,
    updateAvailableModels,
    clearSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};