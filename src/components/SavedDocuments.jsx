import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { saveAs } from 'file-saver';

const { FiSave, FiDownload, FiTrash2, FiFile, FiCalendar, FiSearch, FiFilter, FiGrid, FiList, FiStar, FiClock, FiTag, FiBookmark, FiEye, FiCopy } = FiIcons;

const SavedDocuments = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadSavedItems();
  }, []);

  const loadSavedItems = () => {
    const saved = JSON.parse(localStorage.getItem('aiResearchResults') || '[]');
    setSavedItems(saved);
  };

  const saveResult = (title, content, type = 'summary') => {
    // Ensure content is always a string
    let contentString = '';
    if (typeof content === 'string') {
      contentString = content;
    } else if (content && typeof content === 'object' && content.content) {
      contentString = String(content.content);
    } else if (content && typeof content === 'object') {
      // Handle case where entire object is passed
      contentString = JSON.stringify(content, null, 2);
    } else {
      contentString = String(content || 'No content available');
    }

    const newItem = {
      id: Date.now().toString(),
      title: String(title || 'Untitled'),
      content: contentString,
      type: String(type || 'summary'),
      savedDate: new Date().toISOString()
    };

    const updated = [newItem, ...savedItems];
    setSavedItems(updated);
    localStorage.setItem('aiResearchResults', JSON.stringify(updated));
  };

  const deleteItem = (id) => {
    const updated = savedItems.filter(item => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem('aiResearchResults', JSON.stringify(updated));
  };

  const exportItem = (item, format = 'txt') => {
    // Ensure all properties are strings
    const safeTitle = String(item.title || 'Untitled');
    const safeContent = String(item.content || 'No content available');
    const safeType = String(item.type || 'unknown');
    const safeDate = item.savedDate ? new Date(item.savedDate).toLocaleDateString() : 'Unknown';

    const content = `${safeTitle}
${'='.repeat(safeTitle.length)}

Saved: ${safeDate}
Type: ${safeType}

${safeContent}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const filename = `${safeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
    saveAs(blob, filename);
  };

  const exportAll = () => {
    const allContent = savedItems.map(item => {
      const safeTitle = String(item.title || 'Untitled');
      const safeContent = String(item.content || 'No content available');
      const safeType = String(item.type || 'unknown');
      const safeDate = item.savedDate ? new Date(item.savedDate).toLocaleDateString() : 'Unknown';

      return `${safeTitle}
${'='.repeat(safeTitle.length)}

Saved: ${safeDate}
Type: ${safeType}

${safeContent}

`;
    }).join('\n');

    const blob = new Blob([allContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'all_research_results.txt');
  };

  const copyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const filteredItems = savedItems
    .filter(item => {
      const safeTitle = String(item.title || '').toLowerCase();
      const safeContent = String(item.content || '').toLowerCase();
      const safeType = String(item.type || '');
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch = safeTitle.includes(searchLower) || safeContent.includes(searchLower);
      const matchesFilter = filterType === 'all' || safeType === filterType;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.savedDate) - new Date(a.savedDate);
        case 'oldest':
          return new Date(a.savedDate) - new Date(b.savedDate);
        case 'title':
          return String(a.title || '').localeCompare(String(b.title || ''));
        case 'type':
          return String(a.type || '').localeCompare(String(b.type || ''));
        default:
          return 0;
      }
    });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      summary: FiBookmark,
      keypoints: FiList,
      questions: FiFile,
      sentiment: FiStar,
      outline: FiGrid,
      gaps: FiSearch,
      actions: FiTag,
      analysis: FiEye
    };
    return icons[type] || FiFile;
  };

  const getTypeColor = (type) => {
    const colors = {
      summary: 'from-blue-500 to-purple-500',
      keypoints: 'from-green-500 to-blue-500',
      questions: 'from-yellow-500 to-orange-500',
      sentiment: 'from-pink-500 to-red-500',
      outline: 'from-indigo-500 to-purple-500',
      gaps: 'from-orange-500 to-red-500',
      actions: 'from-teal-500 to-cyan-500',
      analysis: 'from-primary-500 to-secondary-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl neon-glow">
              <SafeIcon icon={FiSave} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Saved Results</h2>
              <p className="text-gray-300">{savedItems.length} items saved • {filteredItems.length} showing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-dark-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <SafeIcon icon={FiGrid} className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <SafeIcon icon={FiList} className="w-4 h-4" />
              </button>
            </div>
            {savedItems.length > 0 && (
              <button
                onClick={exportAll}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                Export All
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Controls */}
      {savedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl shadow-xl border border-primary-500/20 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-gray-400"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <SafeIcon icon={FiFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-12 pr-8 py-3 bg-dark-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white appearance-none"
              >
                <option value="all">All Types</option>
                <option value="summary">Summaries</option>
                <option value="keypoints">Key Points</option>
                <option value="questions">Questions</option>
                <option value="sentiment">Sentiment</option>
                <option value="outline">Outline</option>
                <option value="gaps">Information Gaps</option>
                <option value="actions">Action Items</option>
                <option value="analysis">Analysis</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="relative">
              <SafeIcon icon={FiClock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-12 pr-8 py-3 bg-dark-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="type">Type</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-dark-800/30 rounded-xl px-4 py-3">
              <span className="text-gray-300 text-sm">
                {filteredItems.length} of {savedItems.length} results
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Saved Items */}
      <AnimatePresence>
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl shadow-xl border border-primary-500/20 p-12 text-center"
          >
            <SafeIcon icon={FiFile} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {savedItems.length === 0 ? 'No Saved Results' : 'No Results Found'}
            </h3>
            <p className="text-gray-300 mb-6">
              {savedItems.length === 0
                ? 'Your saved summaries, key points, and analysis will appear here'
                : 'Try adjusting your search terms or filter settings'}
            </p>
            {savedItems.length === 0 && (
              <button
                onClick={() => saveResult(
                  'Sample Document Analysis',
                  'This is a sample analysis result that demonstrates how your research findings will be saved and organized. You can search, filter, and export your results for future reference.\n\nKey Features:\n• Smart organization by type\n• Full-text search capabilities\n• Export to various formats\n• Beautiful visual presentation\n\nThis sample shows how comprehensive your saved results can be, helping you build a knowledge base from your document analysis.',
                  'analysis'
                )}
                className="btn-modern"
              >
                Add Sample Result
              </button>
            )}
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`glass card-hover rounded-2xl shadow-xl border border-primary-500/20 overflow-hidden ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Card Header */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 bg-gradient-to-r ${getTypeColor(item.type)} rounded-lg neon-glow`}>
                        <SafeIcon icon={getTypeIcon(item.type)} className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-2 truncate">
                          {String(item.title || 'Untitled')}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                            {formatDate(item.savedDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <SafeIcon icon={FiTag} className="w-4 h-4" />
                            <span className="capitalize">{String(item.type || 'unknown')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => copyToClipboard(String(item.content))}
                        className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                        title="Copy content"
                      >
                        <SafeIcon icon={FiCopy} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => exportItem(item)}
                        className="p-2 text-gray-400 hover:text-secondary-400 hover:bg-secondary-500/10 rounded-lg transition-colors"
                        title="Export"
                      >
                        <SafeIcon icon={FiDownload} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="bg-dark-800/30 rounded-xl p-4 max-h-48 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-gray-300 font-sans leading-relaxed text-sm">
                        {String(item.content || 'No content available').substring(0, viewMode === 'list' ? 200 : 300)}
                        {String(item.content || '').length > (viewMode === 'list' ? 200 : 300) && '...'}
                      </pre>
                    </div>
                  </div>

                  {/* Word Count */}
                  <div className="mt-3 text-xs text-gray-500">
                    {String(item.content || '').split(/\s+/).filter(word => word.length > 0).length} words
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Quick Actions Demo */}
      {savedItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-light rounded-2xl p-6 border border-primary-500/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Save Demo</h3>
          <p className="text-gray-300 mb-4">Try saving different types of results to see how they're organized:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'summary', label: 'Summary', icon: FiBookmark },
              { type: 'keypoints', label: 'Key Points', icon: FiList },
              { type: 'questions', label: 'Questions', icon: FiFile },
              { type: 'sentiment', label: 'Sentiment', icon: FiStar }
            ].map((demo) => (
              <button
                key={demo.type}
                onClick={() => saveResult(
                  `Sample ${demo.label}`,
                  `This is a sample ${demo.type} analysis that demonstrates the ${demo.label.toLowerCase()} feature. It shows how your AI-generated insights will be beautifully organized and easily accessible.`,
                  demo.type
                )}
                className="flex items-center gap-2 p-3 bg-dark-800/30 rounded-xl hover:bg-dark-700/50 transition-all text-gray-300 hover:text-white border border-transparent hover:border-primary-500/30"
              >
                <SafeIcon icon={demo.icon} className="w-4 h-4" />
                <span className="text-sm">{demo.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SavedDocuments;