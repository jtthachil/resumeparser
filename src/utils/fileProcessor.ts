import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker with fallback options
function setupPDFWorker() {
  try {
    // Primary: Use CDN for reliable worker loading on Vercel
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.2.133/build/pdf.worker.min.mjs';
    console.log('PDF.js worker configured with CDN');
  } catch (error) {
    console.warn('CDN PDF.js worker setup failed, trying local worker:', error);
    try {
      // Fallback: try local worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      console.log('PDF.js worker configured with local file');
    } catch (localError) {
      console.error('All PDF.js worker setups failed:', localError);
    }
  }
}

// Initialize worker
setupPDFWorker();

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF extraction for file:', file.name, 'Size:', file.size);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('File loaded as ArrayBuffer, size:', arrayBuffer.byteLength);
    
    // Attempt to load the PDF document
    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0, // Reduce console spam
        useSystemFonts: true, // Help with font rendering
        isEvalSupported: false // Disable eval for security
      }).promise;
      console.log('PDF document loaded successfully, pages:', pdf.numPages);
    } catch (workerError) {
      console.error('PDF.js worker error:', workerError);
      
      // Try to reinitialize worker and retry
      console.log('Attempting to reinitialize PDF worker...');
      setupPDFWorker();
      
      // Retry with different configuration
      pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0,
        useSystemFonts: true,
        isEvalSupported: false,
        useWorkerFetch: false // Disable worker fetch as fallback
      }).promise;
      console.log('PDF document loaded on retry, pages:', pdf.numPages);
    }
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
        console.log(`Page ${i} extracted, text length:`, pageText.length);
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${i}:`, pageError);
        // Continue with other pages
      }
    }
    
    const extractedText = fullText.trim();
    console.log('PDF extraction completed. Total text length:', extractedText.length);
    console.log('First 200 chars:', extractedText.substring(0, 200));
    
    if (extractedText.length === 0) {
      throw new Error('PDF appears to be empty or contains only images. Please ensure the PDF contains selectable text.');
    }
    
    return extractedText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('worker')) {
        throw new Error(`PDF processing failed due to worker configuration. Please try refreshing the page or use a different browser.`);
      } else if (error.message.includes('fetch')) {
        throw new Error(`Failed to load PDF processing resources. Please check your internet connection and try again.`);
      } else {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
      }
    } else {
      throw new Error('Failed to extract text from PDF: Unknown error occurred');
    }
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