import { callOpenRouterAPI } from './openRouterApi';

// Simulated AI response generation for demo mode
const generateSimulatedResponse = (question, context) => {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('summary') || lowerQuestion.includes('summarize')) {
    return `Based on the document, here's a summary:

The document contains valuable information that can be broken down into several key areas. The main themes include important concepts and findings that are relevant to the subject matter.

Key highlights:
• Primary findings and conclusions
• Supporting evidence and data
• Recommendations and next steps
• Important context and background information

This summary provides an overview of the document's main content and significance.`;
  }
  
  if (lowerQuestion.includes('key points') || lowerQuestion.includes('main points')) {
    return `Here are the key points from the document:

1. **Primary Concept**: The document establishes fundamental principles and core ideas
2. **Supporting Evidence**: Data and examples that reinforce the main arguments
3. **Methodology**: Approach and techniques used in the analysis
4. **Findings**: Specific results and discoveries presented
5. **Implications**: What these findings mean for the field or application
6. **Recommendations**: Suggested actions or next steps based on the analysis

These points capture the essential elements and takeaways from the document.`;
  }
  
  if (lowerQuestion.includes('recommendation') || lowerQuestion.includes('action')) {
    return `Based on the document analysis, here are the recommended actions:

**Immediate Actions:**
• Review and implement the suggested frameworks
• Gather additional data where gaps exist
• Engage stakeholders in the decision-making process

**Medium-term Steps:**
• Develop implementation plans based on findings
• Monitor progress and adjust strategies as needed
• Document lessons learned for future reference

**Long-term Considerations:**
• Evaluate the effectiveness of implemented changes
• Consider scaling successful approaches
• Plan for continuous improvement and adaptation

These recommendations are based on the insights and conclusions presented in the document.`;
  }
  
  return `Thank you for your question about the document. Based on the content provided, I can offer the following insights:

The document contains relevant information that addresses various aspects of your inquiry. The content suggests several important considerations and provides context that helps answer your question.

Key relevant points:
• The document provides background information on the topic
• There are specific examples and case studies mentioned
• The analysis includes both theoretical and practical perspectives
• Various factors and considerations are discussed

For more specific information, you might want to ask about particular sections or aspects of the document that interest you most. Would you like me to focus on any specific part of the document or provide more details about a particular aspect?`;
};

export const generateResponse = async (question, documentContent, apiKey, model = 'anthropic/claude-3-haiku') => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  try {
    // If API key is provided, use OpenRouter API
    if (apiKey) {
      const messages = [
        {
          role: 'system',
          content: `You are a helpful AI assistant that analyzes documents and answers questions about them. You will be provided with a document's content and a question about it. Please:

1. Analyze the document content carefully
2. Provide accurate, helpful answers based on the document
3. If the question cannot be answered from the document, say so clearly
4. Use markdown formatting for better readability
5. Be concise but comprehensive in your responses

Document content: ${documentContent.substring(0, 8000)}...` // Limit context to avoid token limits
        },
        {
          role: 'user',
          content: question
        }
      ];
      
      const response = await callOpenRouterAPI(apiKey, model, messages, {
        temperature: 0.7,
        maxTokens: 1000
      });
      
      // Always return a string, not an object
      if (response && typeof response === 'object' && response.content) {
        return String(response.content);
      } else if (typeof response === 'string') {
        return response;
      } else {
        throw new Error('Invalid response format from API');
      }
    } else {
      // Fallback to simulated response
      return generateSimulatedResponse(question, documentContent);
    }
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};

export const generateSummary = async (content, apiKey, model = 'anthropic/claude-3-haiku') => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (apiKey) {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant that creates concise, comprehensive summaries of documents. Focus on the main themes, key insights, and important takeaways.'
        },
        {
          role: 'user',
          content: `Please provide a comprehensive summary of the following document:\n\n${content.substring(0, 8000)}...`
        }
      ];
      
      const response = await callOpenRouterAPI(apiKey, model, messages, {
        temperature: 0.5,
        maxTokens: 800
      });
      
      // Always return a string, not an object
      if (response && typeof response === 'object' && response.content) {
        return String(response.content);
      } else if (typeof response === 'string') {
        return response;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }
  
  return `Document Summary:

This document presents comprehensive information organized into several key sections. The content covers important topics with detailed analysis and supporting evidence.

Main Themes:
• Core concepts and fundamental principles
• Detailed analysis and findings
• Supporting data and evidence
• Practical applications and implications

Key Insights:
• The document provides valuable insights into the subject matter
• Multiple perspectives and approaches are considered
• Evidence-based conclusions are presented
• Recommendations for future action are included

Significance:
The document contributes to understanding of the topic through thorough analysis and presents actionable insights that can be applied in relevant contexts.

This summary captures the essential elements while maintaining focus on the most important aspects of the document.`;
};

export const extractKeyPoints = async (content, apiKey, model = 'anthropic/claude-3-haiku') => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  if (apiKey) {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant that extracts key points from documents. Focus on the most important concepts, findings, and takeaways. Format your response as a numbered list.'
        },
        {
          role: 'user',
          content: `Please extract the key points from the following document:\n\n${content.substring(0, 8000)}...`
        }
      ];
      
      const response = await callOpenRouterAPI(apiKey, model, messages, {
        temperature: 0.3,
        maxTokens: 800
      });
      
      // Always return a string, not an object
      if (response && typeof response === 'object' && response.content) {
        return String(response.content);
      } else if (typeof response === 'string') {
        return response;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error extracting key points:', error);
      throw error;
    }
  }
  
  return `Key Points Extracted:

1. **Foundation Concepts**
   - Establishes core principles and definitions
   - Provides necessary background context
   - Sets framework for analysis

2. **Methodology & Approach**
   - Describes systematic approach used
   - Outlines research or analysis methods
   - Explains data collection and processing

3. **Primary Findings**
   - Presents main results and discoveries
   - Highlights significant patterns or trends
   - Identifies key relationships and correlations

4. **Supporting Evidence**
   - Provides data and examples
   - Includes case studies and illustrations
   - References relevant sources and studies

5. **Analysis & Interpretation**
   - Discusses implications of findings
   - Considers multiple perspectives
   - Evaluates significance and impact

6. **Conclusions & Recommendations**
   - Summarizes main takeaways
   - Suggests practical applications
   - Proposes next steps or future research

These key points represent the most important elements and insights from the document.`;
};