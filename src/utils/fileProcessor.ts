import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker - use local worker served by Vite
try {
  // For PDF.js v5+, we need to handle the worker differently
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  
  // Alternative: Use CDN for the latest version if local fails
  // pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.2.133/build/pdf.worker.min.mjs';
} catch (error) {
  console.warn('PDF.js worker setup failed, will use fallback');
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0 // Reduce console spam
    }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    const extractedText = fullText.trim();
    console.log('PDF extraction successful, text length:', extractedText.length);
    console.log('First 200 chars:', extractedText.substring(0, 200));
    
    if (extractedText.length === 0) {
      throw new Error('PDF appears to be empty or contains only images');
    }
    
    return extractedText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const extractedText = result.value.trim();
    
    console.log('DOCX extraction successful, text length:', extractedText.length);
    console.log('First 200 chars:', extractedText.substring(0, 200));
    
    if (extractedText.length === 0) {
      throw new Error('DOCX appears to be empty');
    }
    
    return extractedText;
  } catch (error) {
    console.error('DOCX extraction failed:', error);
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  
  switch (fileType) {
    case 'application/pdf':
      return await extractTextFromPDF(file);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return await extractTextFromDOCX(file);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
} 