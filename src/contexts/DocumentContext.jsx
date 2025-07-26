import React, { createContext, useContext, useState } from 'react';

const DocumentContext = createContext();

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  const [document, setDocument] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const clearDocument = () => {
    setDocument(null);
    setAnalysis(null);
  };

  const value = {
    document,
    setDocument,
    analysis,
    setAnalysis,
    clearDocument
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};