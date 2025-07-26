// Quick Actions utility functions
import { generateSummary, extractKeyPoints, generateResponse } from './aiProcessor';

export const generateDocumentSummary = async (document, apiKey, selectedModel) => {
  try {
    const summary = await generateSummary(document.content, apiKey, selectedModel);
    
    // Ensure we always get a string
    let summaryText = '';
    if (typeof summary === 'string') {
      summaryText = summary;
    } else if (summary && typeof summary === 'object' && summary.content) {
      summaryText = String(summary.content);
    } else {
      summaryText = 'Summary generation completed but no content was returned.';
    }
    
    const result = {
      id: Date.now().toString(),
      title: `Summary: ${document.name}`,
      content: summaryText,
      type: 'summary',
      documentId: document.id,
      documentName: document.name,
      model: selectedModel,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveQuickActionResult(result);
    return result;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};

export const extractDocumentKeyPoints = async (document, apiKey, selectedModel) => {
  try {
    const keyPoints = await extractKeyPoints(document.content, apiKey, selectedModel);
    
    // Ensure we always get a string
    let keyPointsText = '';
    if (typeof keyPoints === 'string') {
      keyPointsText = keyPoints;
    } else if (keyPoints && typeof keyPoints === 'object' && keyPoints.content) {
      keyPointsText = String(keyPoints.content);
    } else {
      keyPointsText = 'Key points extraction completed but no content was returned.';
    }
    
    const result = {
      id: Date.now().toString(),
      title: `Key Points: ${document.name}`,
      content: keyPointsText,
      type: 'keypoints',
      documentId: document.id,
      documentName: document.name,
      model: selectedModel,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveQuickActionResult(result);
    return result;
  } catch (error) {
    console.error('Error extracting key points:', error);
    throw new Error(`Failed to extract key points: ${error.message}`);
  }
};

export const generateDocumentQuestions = async (document, apiKey, selectedModel) => {
  try {
    const questionsPrompt = "Generate 5-10 thoughtful questions that would help someone better understand this document. Include both factual and analytical questions.";
    const questions = await generateResponse(questionsPrompt, document.content, apiKey, selectedModel);
    
    // Ensure we always get a string
    let questionsText = '';
    if (typeof questions === 'string') {
      questionsText = questions;
    } else if (questions && typeof questions === 'object' && questions.content) {
      questionsText = String(questions.content);
    } else {
      questionsText = 'Questions generation completed but no content was returned.';
    }
    
    const result = {
      id: Date.now().toString(),
      title: `Questions: ${document.name}`,
      content: questionsText,
      type: 'questions',
      documentId: document.id,
      documentName: document.name,
      model: selectedModel,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveQuickActionResult(result);
    return result;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

export const analyzeDocumentSentiment = async (document, apiKey, selectedModel) => {
  try {
    const sentimentPrompt = "Analyze the sentiment and tone of this document. Identify the overall mood, emotional indicators, and any bias or perspective. Provide insights into the author's attitude and the document's emotional impact.";
    const sentiment = await generateResponse(sentimentPrompt, document.content, apiKey, selectedModel);
    
    // Ensure we always get a string
    let sentimentText = '';
    if (typeof sentiment === 'string') {
      sentimentText = sentiment;
    } else if (sentiment && typeof sentiment === 'object' && sentiment.content) {
      sentimentText = String(sentiment.content);
    } else {
      sentimentText = 'Sentiment analysis completed but no content was returned.';
    }
    
    const result = {
      id: Date.now().toString(),
      title: `Sentiment Analysis: ${document.name}`,
      content: sentimentText,
      type: 'sentiment',
      documentId: document.id,
      documentName: document.name,
      model: selectedModel,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveQuickActionResult(result);
    return result;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw new Error(`Failed to analyze sentiment: ${error.message}`);
  }
};

export const generateDocumentOutline = async (document, apiKey, selectedModel) => {
  try {
    const outlinePrompt = "Create a detailed outline of this document. Organize the content into main topics, subtopics, and key points. Use a hierarchical structure with clear headings and bullet points.";
    const outline = await generateResponse(outlinePrompt, document.content, apiKey, selectedModel);
    
    // Ensure we always get a string
    let outlineText = '';
    if (typeof outline === 'string') {
      outlineText = outline;
    } else if (outline && typeof outline === 'object' && outline.content) {
      outlineText = String(outline.content);
    } else {
      outlineText = 'Outline generation completed but no content was returned.';
    }
    
    const result = {
      id: Date.now().toString(),
      title: `Outline: ${document.name}`,
      content: outlineText,
      type: 'outline',
      documentId: document.id,
      documentName: document.name,
      model: selectedModel,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveQuickActionResult(result);
    return result;
  } catch (error) {
    console.error('Error generating outline:', error);
    throw new Error(`Failed to generate outline: ${error.message}`);
  }
};

export const findDocumentGaps = async (document, apiKey, selectedModel) => {
  try {
    const gapsPrompt = "Identify potential gaps, missing information, or areas that need further clarification in this document. Suggest what additional information would be helpful and highlight any assumptions or unsupported claims.";
    const gaps = await generateResponse(gapsPrompt, document.content, apiKey, selectedModel);
    
    // Ensure we always get a string
    let gapsText = '';
    if (typeof gaps === 'string') {
      gapsText = gaps;
    } else if (gaps && typeof gaps === 'object' && gaps.content) {
      gapsText = String(gaps.content);
    } else {
      gapsText = 'Gap analysis completed but no content was returned.';
    }
    
    const result = {
      id: Date.now().toString(),
      title: `Information Gaps: ${document.name}`,
      content: gapsText,
      type: 'gaps',
      documentId: document.id,
      documentName: document.name,
      model: selectedModel,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveQuickActionResult(result);
    return result;
  } catch (error) {
    console.error('Error finding gaps:', error);
    throw new Error(`Failed to find information gaps: ${error.message}`);
  }
};

export const generateActionItems = async (document, apiKey, selectedModel) => {
  try {
    const actionPrompt = "Extract actionable items, recommendations, and next steps from this document. Create a prioritized list of actions that someone should take based on the content. Include both immediate and long-term actions.";
    const actions = await generateResponse(actionPrompt, document.content, apiKey, selectedModel);
    
    // Ensure we always get a string
    let actionsText = '';
    if (typeof actions === 'string') {
      actionsText = actions;
    } else if (actions && typeof actions === 'object' && actions.content) {
      actionsText = String(actions.content);
    } else {
      actionsText = 'Action items generation completed but no content was returned.';
    }
    
    const result = {
      id: Date.now().toString(),
      title: `Action Items: ${document.name}`,
      content: actionsText,
      type: 'actions',
      documentId: document.id,
      documentName: document.name,
      model: selectedModel,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveQuickActionResult(result);
    return result;
  } catch (error) {
    console.error('Error generating action items:', error);
    throw new Error(`Failed to generate action items: ${error.message}`);
  }
};

export const compareDocuments = async (document1, document2, apiKey, selectedModel) => {
  try {
    const comparePrompt = `Compare and contrast these two documents. Identify similarities, differences, conflicting information, and complementary insights.

Document 1: ${document1.name}
${document1.content.substring(0, 4000)}...

Document 2: ${document2.name}
${document2.content.substring(0, 4000)}...`;
    
    const comparison = await generateResponse(comparePrompt, '', apiKey, selectedModel);
    
    // Ensure we always get a string
    let comparisonText = '';
    if (typeof comparison === 'string') {
      comparisonText = comparison;
    } else if (comparison && typeof comparison === 'object' && comparison.content) {
      comparisonText = String(comparison.content);
    } else {
      comparisonText = 'Document comparison completed but no content was returned.';
    }
    
    const result = {
      id: Date.now().toString(),
      title: `Comparison: ${document1.name} vs ${document2.name}`,
      content: comparisonText,
      type: 'comparison',
      documentIds: [document1.id, document2.id],
      documentNames: [document1.name, document2.name],
      model: selectedModel,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveQuickActionResult(result);
    return result;
  } catch (error) {
    console.error('Error comparing documents:', error);
    throw new Error(`Failed to compare documents: ${error.message}`);
  }
};

const saveQuickActionResult = (result) => {
  try {
    const existingResults = JSON.parse(localStorage.getItem('aiResearchResults') || '[]');
    const updatedResults = [result, ...existingResults];
    localStorage.setItem('aiResearchResults', JSON.stringify(updatedResults));
  } catch (error) {
    console.error('Error saving quick action result:', error);
  }
};

export const getQuickActionResults = () => {
  try {
    return JSON.parse(localStorage.getItem('aiResearchResults') || '[]');
  } catch (error) {
    console.error('Error loading quick action results:', error);
    return [];
  }
};

export const deleteQuickActionResult = (id) => {
  try {
    const results = getQuickActionResults();
    const updatedResults = results.filter(result => result.id !== id);
    localStorage.setItem('aiResearchResults', JSON.stringify(updatedResults));
    return updatedResults;
  } catch (error) {
    console.error('Error deleting quick action result:', error);
    throw error;
  }
};

export const exportQuickActionResult = (result, format = 'txt') => {
  try {
    const content = `${result.title}
${'='.repeat(result.title.length)}

Type: ${result.type}
Document: ${result.documentName || result.documentNames?.join(', ') || 'N/A'}
Model: ${result.model || 'N/A'}
Created: ${new Date(result.createdAt).toLocaleString()}

${result.content}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting quick action result:', error);
    throw new Error(`Failed to export result: ${error.message}`);
  }
};

// Batch operations
export const generateAllAnalyses = async (document, apiKey, selectedModel, onProgress) => {
  const analyses = [];
  const operations = [
    { name: 'Summary', fn: generateDocumentSummary },
    { name: 'Key Points', fn: extractDocumentKeyPoints },
    { name: 'Questions', fn: generateDocumentQuestions },
    { name: 'Sentiment', fn: analyzeDocumentSentiment },
    { name: 'Outline', fn: generateDocumentOutline },
    { name: 'Information Gaps', fn: findDocumentGaps },
    { name: 'Action Items', fn: generateActionItems }
  ];
  
  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];
    try {
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: operations.length,
          operation: operation.name
        });
      }
      
      const result = await operation.fn(document, apiKey, selectedModel);
      analyses.push(result);
      
      // Add delay between operations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error in ${operation.name}:`, error);
      // Continue with other operations even if one fails
    }
  }
  
  return analyses;
};