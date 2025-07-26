import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDocument } from '../contexts/DocumentContext';
import { extractTextFromPDF, extractTextFromWord, extractTextFromURL } from '../utils/documentProcessor';

const { FiUpload, FiFile, FiLink, FiCheck, FiX, FiLoader } = FiIcons;

const DocumentUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const { setDocument } = useDocument();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const processFile = async (file) => {
    setUploading(true);
    setUploadStatus(null);
    try {
      let text = '';
      const fileType = file.type;
      if (fileType === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractTextFromWord(file);
      } else if (fileType === 'text/plain') {
        text = await file.text();
      } else {
        throw new Error('Unsupported file type');
      }

      const document = {
        id: Date.now().toString(),
        name: file.name,
        type: fileType,
        content: text,
        uploadDate: new Date().toISOString(),
        size: file.size
      };

      setDocument(document);
      setUploadStatus({ type: 'success', message: 'Document uploaded successfully!' });
    } catch (error) {
      setUploadStatus({ type: 'error', message: `Error processing file: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setUploading(true);
    setUploadStatus(null);
    try {
      const text = await extractTextFromURL(urlInput);
      const document = {
        id: Date.now().toString(),
        name: urlInput,
        type: 'url',
        content: text,
        uploadDate: new Date().toISOString(),
        url: urlInput
      };

      setDocument(document);
      setUploadStatus({ type: 'success', message: 'Website content extracted successfully!' });
      setUrlInput('');
    } catch (error) {
      setUploadStatus({ type: 'error', message: `Error extracting content: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Upload Document</h2>
          <p className="text-gray-300">Drag and drop your PDF, Word document, or text file</p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 ${
            dragActive
              ? 'border-primary-400 bg-primary-500/10 neon-glow'
              : 'border-gray-600 hover:border-primary-500/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />

          <div className="text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <SafeIcon icon={FiLoader} className="w-12 h-12 text-primary-500 animate-spin" />
                <p className="text-gray-300">Processing document...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <SafeIcon icon={FiUpload} className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-white">Drop your file here</p>
                  <p className="text-sm text-gray-400">or click to browse</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <SafeIcon icon={FiFile} className="w-4 h-4" />
                    PDF
                  </span>
                  <span className="flex items-center gap-1">
                    <SafeIcon icon={FiFile} className="w-4 h-4" />
                    DOCX
                  </span>
                  <span className="flex items-center gap-1">
                    <SafeIcon icon={FiFile} className="w-4 h-4" />
                    TXT
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
              uploadStatus.type === 'success'
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            <SafeIcon icon={uploadStatus.type === 'success' ? FiCheck : FiX} className="w-5 h-5" />
            {uploadStatus.message}
          </motion.div>
        )}
      </motion.div>

      {/* URL Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass rounded-2xl shadow-xl border border-primary-500/20 p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Extract from URL</h2>
          <p className="text-gray-300">Enter a website URL to extract and analyze its content</p>
        </div>

        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div className="relative">
            <SafeIcon icon={FiLink} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-gray-400"
              disabled={uploading}
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !urlInput.trim()}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
                Extracting Content...
              </div>
            ) : (
              'Extract Content'
            )}
          </button>
        </form>
      </motion.div>

      {/* Supported Formats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-light rounded-2xl p-6 border border-primary-500/10"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Supported Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { format: 'PDF Files', description: 'Research papers, reports, books', icon: FiFile },
            { format: 'Word Documents', description: 'DOCX files and documents', icon: FiFile },
            { format: 'Web Pages', description: 'Articles, blogs, news sites', icon: FiLink }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-dark-800/30 rounded-xl">
              <SafeIcon icon={item.icon} className="w-5 h-5 text-primary-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-white">{item.format}</h4>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentUpload;