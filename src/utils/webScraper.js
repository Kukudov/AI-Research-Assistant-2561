// Enhanced web scraping utility functions with better error handling
import { parse } from 'node-html-parser';

export const scrapeWebContent = async (url) => {
  try {
    // Validate URL first
    if (!validateUrl(url)) {
      throw new Error('Invalid URL format');
    }

    // Try multiple CORS proxy services with better error handling
    const proxyServices = [
      {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        type: 'allorigins'
      },
      {
        url: `https://corsproxy.io/?${encodeURIComponent(url)}`,
        type: 'corsproxy'
      },
      {
        url: `https://thingproxy.freeboard.io/fetch/${url}`,
        type: 'thingproxy'
      }
    ];
    
    let response;
    let data;
    let lastError;
    
    for (const proxy of proxyServices) {
      try {
        console.log(`Trying proxy: ${proxy.type}`);
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        response = await fetch(proxy.url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (compatible; AI-Research-Assistant/1.0)'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          if (proxy.type === 'allorigins') {
            const jsonData = await response.json();
            data = jsonData.contents;
          } else {
            data = await response.text();
          }
          
          if (data && data.length > 100) { // Make sure we got substantial content
            console.log(`Successfully fetched content using ${proxy.type}`);
            break;
          }
        }
      } catch (error) {
        lastError = error;
        console.warn(`Proxy ${proxy.type} failed:`, error.message);
        continue;
      }
    }
    
    if (!data) {
      // Fallback to a simple fetch attempt (might work for some URLs)
      try {
        console.log('Trying direct fetch as last resort...');
        response = await fetch(url, {
          mode: 'cors',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AI-Research-Assistant/1.0)'
          }
        });
        
        if (response.ok) {
          data = await response.text();
        }
      } catch (directError) {
        console.warn('Direct fetch also failed:', directError.message);
      }
    }
    
    if (!data) {
      throw new Error(`All proxy services failed. Last error: ${lastError?.message || 'Unknown error'}. This might be due to CORS restrictions or the website blocking automated requests.`);
    }
    
    // Parse HTML and extract comprehensive content
    const root = parse(data);
    
    // Extract metadata first
    const metadata = extractMetadata(root);
    
    // Remove unwanted elements but keep more content
    const unwantedSelectors = [
      'script', 'style', 'noscript', 'iframe', 'embed', 'object',
      '.ad', '.ads', '.advertisement', '.popup', '.modal',
      '.cookie-banner', '.newsletter-signup', '.social-share',
      '.comments', '.comment-section', '.sidebar-ads',
      'nav[role="navigation"]', 'footer', 'header[role="banner"]',
      '.navigation', '.menu', '.nav-menu', '.breadcrumb'
    ];
    
    unwantedSelectors.forEach(selector => {
      try {
        root.querySelectorAll(selector).forEach(el => el.remove());
      } catch (e) {
        // Ignore selector errors
      }
    });
    
    // Extract content from multiple areas with priority
    const contentAreas = extractContentAreas(root);
    
    // Combine all content
    const allContent = combineContent(contentAreas);
    
    // Clean and format the text
    const cleanedContent = cleanText(allContent);
    
    if (!cleanedContent || cleanedContent.length < 50) {
      throw new Error('Extracted content is too short or empty. The website might be blocking automated access or using heavy JavaScript rendering.');
    }
    
    return {
      ...metadata,
      content: cleanedContent,
      url,
      extractedAt: new Date().toISOString(),
      wordCount: cleanedContent.split(/\s+/).filter(word => word.length > 0).length,
      contentAreas: Object.keys(contentAreas).filter(key => contentAreas[key])
    };
    
  } catch (error) {
    console.error('Error scraping web content:', error);
    throw new Error(`Failed to scrape content from ${url}: ${error.message}`);
  }
};

const extractMetadata = (root) => {
  const safeGetText = (element) => {
    try {
      return element?.text?.trim() || element?.getAttribute?.('content')?.trim() || '';
    } catch (e) {
      return '';
    }
  };

  const safeGetAttribute = (selector, attribute) => {
    try {
      return root.querySelector(selector)?.getAttribute(attribute)?.trim() || '';
    } catch (e) {
      return '';
    }
  };

  const title = safeGetText(root.querySelector('title')) || 
                safeGetAttribute('meta[property="og:title"]', 'content') || 
                'Untitled';
                
  const description = safeGetAttribute('meta[name="description"]', 'content') || 
                      safeGetAttribute('meta[property="og:description"]', 'content') || '';
                      
  const author = safeGetAttribute('meta[name="author"]', 'content') || 
                 safeGetAttribute('meta[property="article:author"]', 'content') || '';
                 
  const keywords = safeGetAttribute('meta[name="keywords"]', 'content') || '';
  
  const publishDate = safeGetAttribute('meta[property="article:published_time"]', 'content') || 
                      safeGetAttribute('meta[name="date"]', 'content') || '';
                      
  const siteName = safeGetAttribute('meta[property="og:site_name"]', 'content') || '';
  const articleType = safeGetAttribute('meta[property="og:type"]', 'content') || '';
  
  return {
    title,
    description,
    author,
    keywords,
    publishDate,
    siteName,
    articleType
  };
};

const extractContentAreas = (root) => {
  const contentAreas = {};
  
  // Priority content selectors
  const contentSelectors = [
    { name: 'main', selector: 'main' },
    { name: 'article', selector: 'article' },
    { name: 'content', selector: '.content, #content, .main-content, .page-content' },
    { name: 'post', selector: '.post, .post-content, .entry-content, .article-content' },
    { name: 'text', selector: '.text, .text-content, .article-text' },
    { name: 'body', selector: '.post-body, .article-body, .content-body' },
    { name: 'container', selector: '.container, .wrapper, .main-wrapper' },
    { name: 'paragraphs', selector: 'p' },
    { name: 'headings', selector: 'h1, h2, h3, h4, h5, h6' },
    { name: 'lists', selector: 'ul, ol, li' },
    { name: 'quotes', selector: 'blockquote, q' },
    { name: 'code', selector: 'pre, code' },
    { name: 'tables', selector: 'table' }
  ];
  
  contentSelectors.forEach(({ name, selector }) => {
    try {
      const elements = root.querySelectorAll(selector);
      if (elements && elements.length > 0) {
        const texts = elements
          .map(el => {
            try {
              return el.text?.trim() || '';
            } catch (e) {
              return '';
            }
          })
          .filter(text => text.length > 0);
        
        if (texts.length > 0) {
          contentAreas[name] = texts.join('\n\n');
        }
      }
    } catch (e) {
      console.warn(`Error extracting ${name}:`, e.message);
    }
  });
  
  return contentAreas;
};

const combineContent = (contentAreas) => {
  // Prioritize content areas
  const priorityOrder = ['main', 'article', 'content', 'post', 'text', 'body'];
  
  let mainContent = '';
  
  // Try to get main content from priority areas
  for (const area of priorityOrder) {
    if (contentAreas[area] && contentAreas[area].length > 200) {
      mainContent = contentAreas[area];
      break;
    }
  }
  
  // If no substantial main content found, combine all areas
  if (!mainContent) {
    mainContent = Object.values(contentAreas).filter(content => content && content.length > 0).join('\n\n');
  }
  
  // Add structured content
  let structuredContent = '';
  
  if (contentAreas.headings && contentAreas.headings.length > 0) {
    structuredContent += `\n\n=== HEADINGS ===\n${contentAreas.headings}`;
  }
  
  if (contentAreas.lists && contentAreas.lists.length > 0) {
    structuredContent += `\n\n=== LISTS ===\n${contentAreas.lists}`;
  }
  
  if (contentAreas.quotes && contentAreas.quotes.length > 0) {
    structuredContent += `\n\n=== QUOTES ===\n${contentAreas.quotes}`;
  }
  
  if (contentAreas.code && contentAreas.code.length > 0) {
    structuredContent += `\n\n=== CODE ===\n${contentAreas.code}`;
  }
  
  if (contentAreas.tables && contentAreas.tables.length > 0) {
    structuredContent += `\n\n=== TABLES ===\n${contentAreas.tables}`;
  }
  
  return mainContent + structuredContent;
};

const cleanText = (text) => {
  if (!text) return '';
  
  return text
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove multiple line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Remove leading/trailing whitespace
    .trim()
    // Remove empty lines
    .replace(/^\s*$/gm, '')
    // Fix spacing around punctuation
    .replace(/\s+([.,!?;:])/g, '$1')
    // Remove excessive spacing
    .replace(/\s{3,}/g, ' ')
    // Clean up section separators
    .replace(/={3,}/g, '===');
};

export const extractTextFromHTML = (html) => {
  try {
    const root = parse(html);
    
    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'noscript', 'iframe', 'embed', 'object',
      '.ad', '.ads', '.advertisement', '.popup', '.modal',
      '.cookie-banner', '.newsletter-signup', '.social-share'
    ];
    
    unwantedSelectors.forEach(selector => {
      try {
        root.querySelectorAll(selector).forEach(el => el.remove());
      } catch (e) {
        // Ignore selector errors
      }
    });
    
    // Get text content
    const textContent = root.text || '';
    
    // Clean up whitespace
    return cleanText(textContent);
  } catch (error) {
    console.error('Error extracting text from HTML:', error);
    throw new Error('Failed to extract text from HTML');
  }
};

export const validateUrl = (url) => {
  try {
    const urlObject = new URL(url);
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

export const getPageMetadata = async (url) => {
  try {
    const content = await scrapeWebContent(url);
    return {
      title: content.title,
      description: content.description,
      author: content.author,
      keywords: content.keywords,
      publishDate: content.publishDate,
      siteName: content.siteName,
      articleType: content.articleType,
      url: content.url,
      wordCount: content.wordCount,
      contentAreas: content.contentAreas
    };
  } catch (error) {
    console.error('Error getting page metadata:', error);
    throw new Error(`Failed to get metadata from ${url}: ${error.message}`);
  }
};

// Advanced content extraction for specific site types
export const extractContentBySiteType = async (url) => {
  const domain = new URL(url).hostname.toLowerCase();
  
  // Site-specific extraction rules
  const siteRules = {
    'medium.com': {
      selectors: ['article', '.postArticle-content', '.section-content'],
      removeSelectors: ['.highlighter', '.graf--mixtapeEmbed']
    },
    'dev.to': {
      selectors: ['#article-body', '.crayons-article__main'],
      removeSelectors: ['.crayons-article__aside']
    },
    'stackoverflow.com': {
      selectors: ['.question', '.answer', '.post-text'],
      removeSelectors: ['.js-post-menu', '.post-signature']
    },
    'github.com': {
      selectors: ['#readme', '.markdown-body', '.Box-body'],
      removeSelectors: ['.js-navigation-container']
    },
    'wikipedia.org': {
      selectors: ['#mw-content-text', '.mw-parser-output'],
      removeSelectors: ['.navbox', '.infobox', '.references']
    }
  };
  
  const rules = siteRules[domain];
  if (rules) {
    // Use site-specific rules for better extraction
    return await scrapeWebContentWithRules(url, rules);
  }
  
  // Fallback to general scraping
  return await scrapeWebContent(url);
};

const scrapeWebContentWithRules = async (url, rules) => {
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    const root = parse(data.contents);
    
    // Remove unwanted elements first
    if (rules.removeSelectors) {
      rules.removeSelectors.forEach(selector => {
        try {
          root.querySelectorAll(selector).forEach(el => el.remove());
        } catch (e) {
          // Ignore selector errors
        }
      });
    }
    
    // Extract content using specific selectors
    let content = '';
    rules.selectors.forEach(selector => {
      try {
        const elements = root.querySelectorAll(selector);
        elements.forEach(el => {
          content += (el.text || '') + '\n\n';
        });
      } catch (e) {
        console.warn(`Error with selector ${selector}:`, e.message);
      }
    });
    
    const metadata = extractMetadata(root);
    
    return {
      ...metadata,
      content: cleanText(content),
      url,
      extractedAt: new Date().toISOString(),
      wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
      extractionMethod: 'site-specific'
    };
    
  } catch (error) {
    console.error('Error with site-specific scraping:', error);
    // Fallback to general scraping
    return await scrapeWebContent(url);
  }
};