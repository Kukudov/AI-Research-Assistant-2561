import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import DocumentUpload from './components/DocumentUpload';
import DocumentViewer from './components/DocumentViewer';
import ChatInterface from './components/ChatInterface';
import SavedDocuments from './components/SavedDocuments';
import Settings from './components/Settings';
import { DocumentProvider } from './contexts/DocumentContext';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <SettingsProvider>
      <DocumentProvider>
        <Router>
          <div className="min-h-screen bg-dark-900 particle-bg">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto"
              >
                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 glass rounded-xl p-2 shadow-lg">
                  {[
                    { id: 'upload', label: 'Upload Document', icon: '📄' },
                    { id: 'viewer', label: 'Document Viewer', icon: '👀' },
                    { id: 'chat', label: 'Ask Questions', icon: '💬' },
                    { id: 'saved', label: 'Saved Results', icon: '💾' },
                    { id: 'settings', label: 'Settings', icon: '⚙️' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        activeTab === tab.id 
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg neon-glow' 
                          : 'text-gray-400 hover:text-white hover:bg-dark-700/50'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <Routes>
                  <Route path="/" element={
                    <div className="animate-fade-in">
                      {activeTab === 'upload' && <DocumentUpload />}
                      {activeTab === 'viewer' && <DocumentViewer />}
                      {activeTab === 'chat' && <ChatInterface />}
                      {activeTab === 'saved' && <SavedDocuments />}
                      {activeTab === 'settings' && <Settings />}
                    </div>
                  } />
                </Routes>
              </motion.div>
            </main>
          </div>
        </Router>
      </DocumentProvider>
    </SettingsProvider>
  );
}

export default App;