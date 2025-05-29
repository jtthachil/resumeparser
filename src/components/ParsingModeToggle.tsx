import { Brain, Settings } from 'lucide-react';
import { PARSING_MODES } from '../config/constants';

interface ParsingModeToggleProps {
  mode: 'llm' | 'rules';
  onModeChange: (mode: 'llm' | 'rules') => void;
  disabled?: boolean;
}

export function ParsingModeToggle({ mode, onModeChange, disabled }: ParsingModeToggleProps) {
  return (
    <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Parsing Mode:</span>
      </div>
      
      <div className="flex bg-white rounded-lg p-1 shadow-sm border">
        <button
          onClick={() => onModeChange(PARSING_MODES.LLM)}
          disabled={disabled}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${mode === PARSING_MODES.LLM
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <Brain className="h-4 w-4" />
          <span>AI/LLM</span>
        </button>
        
        <button
          onClick={() => onModeChange(PARSING_MODES.RULES)}
          disabled={disabled}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${mode === PARSING_MODES.RULES
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <Settings className="h-4 w-4" />
          <span>Rules-Based</span>
        </button>
      </div>
      
      <div className="text-xs text-gray-500 max-w-xs">
        {mode === PARSING_MODES.LLM 
          ? 'Uses AI to intelligently extract resume information'
          : 'Uses predefined patterns and rules to extract information'
        }
      </div>
    </div>
  );
} 