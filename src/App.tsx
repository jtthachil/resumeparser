import { useState, useCallback } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ParsingModeToggle } from './components/ParsingModeToggle';
import { ParsedResults } from './components/ParsedResults';
import { PARSING_MODES } from './config/constants';
import type { ParseResult } from './types/resume';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsingMode, setParsingMode] = useState<'llm' | 'rules'>('llm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setParseResult(null);
  }, []);

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setParseResult(null);
  }, []);

  const handleModeChange = useCallback((mode: 'llm' | 'rules') => {
    setParsingMode(mode);
    setParseResult(null);
  }, []);

  const handleParseResume = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setParseResult(null);

    try {
      // Dynamic imports to prevent loading issues
      const [
        { extractTextFromFile },
        { parseResumeWithLLM },
        { parseResumeWithRules }
      ] = await Promise.all([
        import('./utils/fileProcessor'),
        import('./services/llmParser'),
        import('./services/rulesParser')
      ]);

      // Extract text from file
      const resumeText = await extractTextFromFile(selectedFile);
      
      // Parse based on selected mode
      let result: ParseResult;
      if (parsingMode === PARSING_MODES.LLM) {
        result = await parseResumeWithLLM(resumeText);
      } else {
        result = parseResumeWithRules(resumeText);
      }
      
      setParseResult(result);
    } catch (error) {
      console.error('Error processing resume:', error);
      setParseResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        method: parsingMode,
        processingTime: 0
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, parsingMode]);

  const handleDownloadJSON = useCallback(() => {
    if (!parseResult?.data) return;

    const dataStr = JSON.stringify(parseResult.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-parsed-${parsingMode}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [parseResult, parsingMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">Resume Parser</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your resume and choose between AI-powered parsing or rule-based extraction 
            to get structured JSON data from your PDF or DOCX files.
          </p>
        </div>

        {/* Parsing Mode Toggle */}
        <div className="mb-8">
          <ParsingModeToggle
            mode={parsingMode}
            onModeChange={handleModeChange}
            disabled={isProcessing}
          />
        </div>

        {/* File Upload */}
        <div className="mb-8">
          <FileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            selectedFile={selectedFile}
            disabled={isProcessing}
          />
        </div>

        {/* Parse Button */}
        {selectedFile && (
          <div className="text-center mb-8">
            <button
              onClick={handleParseResume}
              disabled={isProcessing}
              className={`
                inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-white font-medium
                ${isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 transition-colors'
                }
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  <span>Parse Resume</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {parseResult && (
          <div className="mb-8">
            <ParsedResults
              result={parseResult}
              onDownload={handleDownloadJSON}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-12">
          <p>
            Built with React, TypeScript, and Azure OpenAI. 
            Supports PDF and DOCX files up to 10MB.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
