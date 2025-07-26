import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBrain, FiZap, FiShield } = FiIcons;

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass border-b border-primary-500/20 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl neon-glow">
                <SafeIcon icon={FiBrain} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white text-shadow">
                  AI Research Assistant
                </h1>
                <p className="text-sm text-gray-300">
                  Intelligent document analysis and research
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <SafeIcon icon={FiZap} className="w-4 h-4 text-yellow-400" />
              <span>Powered by AI</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <SafeIcon icon={FiShield} className="w-4 h-4 text-primary-400" />
              <span>Privacy First</span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;