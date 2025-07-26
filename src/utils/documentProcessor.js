import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { scrapeWebContent, validateUrl } from './webScraper';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

export const extractTextFromWord = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    throw new Error(`Failed to extract text from Word document: ${error.message}`);
  }
};

export const extractTextFromURL = async (url) => {
  try {
    // Validate URL format
    if (!validateUrl(url)) {
      throw new Error('Invalid URL format');
    }

    // Scrape web content
    const scrapedData = await scrapeWebContent(url);
    
    // Format the extracted content
    const formattedContent = `Title: ${scrapedData.title}
URL: ${scrapedData.url}
${scrapedData.description ? `Description: ${scrapedData.description}` : ''}
Extracted: ${new Date(scrapedData.extractedAt).toLocaleString()}

Content:
${scrapedData.content}`;

    return formattedContent;
  } catch (error) {
    console.error('Error extracting content from URL:', error);
    throw new Error(`Failed to extract content from URL: ${error.message}`);
  }
};

export const detectFileType = (file) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return 'pdf';
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
    return 'docx';
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return 'txt';
  } else if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
    return 'markdown';
  } else if (fileType.startsWith('text/') || fileName.endsWith('.rtf')) {
    return 'text';
  }
  
  return 'unknown';
};

export const processFile = async (file) => {
  const fileType = detectFileType(file);
  
  switch (fileType) {
    case 'pdf':
      return await extractTextFromPDF(file);
    case 'docx':
      return await extractTextFromWord(file);
    case 'txt':
    case 'markdown':
    case 'text':
      return await file.text();
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
};