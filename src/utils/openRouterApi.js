// OpenRouter API integration functions with free model marking

export const fetchOpenRouterModels = async (apiKey) => {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Research Assistant'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Free model identifiers (models that are typically free or have free tiers)
    const freeModelPatterns = [
      'free',
      'huggingface',
      'microsoft/phi-3',
      'microsoft/wizardlm-2-8x22b',
      'qwen/qwen-2-7b-instruct',
      'meta-llama/llama-3-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      'google/gemma-7b-it:free',
      'openchat/openchat-7b:free',
      'gryphe/mythomist-7b:free',
      'nousresearch/nous-capybara-7b:free',
      'open-orca/mistral-7b-openorca:free',
      'toppy/m-7b:free',
      'undi95/toppy-m-7b:free',
      'koboldai/psyfighter-13b-2'
    ];
    
    // Filter and sort models by popularity/usefulness
    const filteredModels = data.data
      .filter(model => model.context_length > 1000) // Keep models with reasonable context
      .sort((a, b) => {
        // Prioritize popular models
        const popularModels = [
          'anthropic/claude-3-haiku',
          'anthropic/claude-3-sonnet',
          'anthropic/claude-3-opus',
          'openai/gpt-4o-mini',
          'openai/gpt-4o',
          'openai/gpt-4-turbo',
          'openai/gpt-3.5-turbo',
          'meta-llama/llama-3-8b-instruct:free',
          'meta-llama/llama-3-70b-instruct',
          'mistralai/mistral-7b-instruct:free',
          'mistralai/mistral-7b-instruct',
          'mistralai/mixtral-8x7b-instruct',
          'google/gemma-7b-it:free',
          'microsoft/phi-3-medium-128k-instruct',
          'qwen/qwen-2-7b-instruct:free'
        ];
        
        const aIndex = popularModels.indexOf(a.id);
        const bIndex = popularModels.indexOf(b.id);
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // Sort free models before paid ones
        const aIsFree = isFreeModel(a.id, a.pricing, freeModelPatterns);
        const bIsFree = isFreeModel(b.id, b.pricing, freeModelPatterns);
        
        if (aIsFree && !bIsFree) return -1;
        if (!aIsFree && bIsFree) return 1;
        
        return a.id.localeCompare(b.id);
      });

    return filteredModels.map(model => {
      const isFree = isFreeModel(model.id, model.pricing, freeModelPatterns);
      
      return {
        id: model.id,
        name: model.name || model.id,
        description: model.description,
        contextLength: model.context_length,
        pricing: model.pricing,
        isFree: isFree,
        promptCost: model.pricing?.prompt || 0,
        completionCost: model.pricing?.completion || 0,
        category: categorizeModel(model.id),
        provider: getModelProvider(model.id)
      };
    });
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    throw error;
  }
};

const isFreeModel = (modelId, pricing, freePatterns) => {
  // Check if model ID contains free patterns
  const idLower = modelId.toLowerCase();
  const hasFreePattern = freePatterns.some(pattern => 
    idLower.includes(pattern.toLowerCase())
  );
  
  // Check if pricing indicates free model
  const hasFreePrice = pricing && (
    (pricing.prompt === 0 && pricing.completion === 0) ||
    (pricing.prompt === '0' && pricing.completion === '0') ||
    !pricing.prompt || !pricing.completion
  );
  
  return hasFreePattern || hasFreePrice;
};

const categorizeModel = (modelId) => {
  const idLower = modelId.toLowerCase();
  
  if (idLower.includes('claude')) return 'Anthropic';
  if (idLower.includes('gpt') || idLower.includes('openai')) return 'OpenAI';
  if (idLower.includes('llama')) return 'Meta';
  if (idLower.includes('mistral')) return 'Mistral';
  if (idLower.includes('gemma') || idLower.includes('google')) return 'Google';
  if (idLower.includes('phi') || idLower.includes('microsoft')) return 'Microsoft';
  if (idLower.includes('qwen')) return 'Alibaba';
  if (idLower.includes('huggingface')) return 'HuggingFace';
  
  return 'Other';
};

const getModelProvider = (modelId) => {
  const parts = modelId.split('/');
  return parts[0] || 'Unknown';
};

export const callOpenRouterAPI = async (apiKey, model, messages, options = {}) => {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const requestBody = {
    model: model,
    messages: messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1000,
    stream: false,
    // Add metadata for better tracking
    metadata: {
      generation_id: `ai-research-${Date.now()}`,
      user_id: 'ai-research-user'
    }
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Research Assistant',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenRouter API');
    }

    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
      id: data.id
    };
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
};

// Get model pricing information
export const getModelPricing = (model) => {
  if (!model.pricing) return 'Unknown';
  
  if (model.isFree) return 'Free';
  
  const promptCost = parseFloat(model.pricing.prompt || 0);
  const completionCost = parseFloat(model.pricing.completion || 0);
  
  if (promptCost === 0 && completionCost === 0) return 'Free';
  
  return `$${promptCost.toFixed(6)}/1K prompt, $${completionCost.toFixed(6)}/1K completion`;
};

// Get recommended models for different use cases
export const getRecommendedModels = (models, useCase = 'general') => {
  const recommendations = {
    general: ['anthropic/claude-3-haiku', 'openai/gpt-4o-mini', 'meta-llama/llama-3-8b-instruct:free'],
    analysis: ['anthropic/claude-3-sonnet', 'openai/gpt-4o', 'mistralai/mixtral-8x7b-instruct'],
    creative: ['anthropic/claude-3-opus', 'openai/gpt-4-turbo', 'mistralai/mistral-7b-instruct'],
    coding: ['anthropic/claude-3-sonnet', 'openai/gpt-4o', 'microsoft/phi-3-medium-128k-instruct'],
    free: ['meta-llama/llama-3-8b-instruct:free', 'mistralai/mistral-7b-instruct:free', 'google/gemma-7b-it:free']
  };
  
  const recommendedIds = recommendations[useCase] || recommendations.general;
  return models.filter(model => recommendedIds.includes(model.id));
};