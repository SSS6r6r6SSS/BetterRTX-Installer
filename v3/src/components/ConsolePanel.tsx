import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cx } from 'classix';

interface ConsolePanelProps {
  output?: string[];
  onClear?: () => void;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  output = [],
  onClear,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Auto-expand when new output is added
  useEffect(() => {
    if (output.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [output.length]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClear = () => {
    onClear?.();
  };

  return (
    <div className="console-container">
      <div 
        className="console-header flex justify-between items-center px-4 py-3 cursor-pointer select-none bg-app-panel border-app-border"
        onClick={handleToggle}
      >
        <h3 className="m-0 text-sm font-semibold text-app-fg">
          Console Output
        </h3>
        <span className="console-arrow transition-transform duration-200">
          {isExpanded ? (
            <ChevronUp size={16} strokeWidth={2} />
          ) : (
            <ChevronDown size={16} strokeWidth={2} />
          )}
        </span>
      </div>
      
      <div 
        className={`console-panel border border-t-0 overflow-hidden transition-all duration-300 bg-app-bg border-app-border ${
          isExpanded ? 'console-panel--expanded' : 'console-panel--collapsed'
        }`}
      >
        <div 
          ref={outputRef}
          className="console-output p-4 text-xs h-64 overflow-y-auto whitespace-pre-wrap break-all relative text-app-muted"
        >
          {output.length > 0 ? output.join('\n') : 'No output yet...'}
          
          <button
            className={cx("console-clear-btn fixed left-auto bottom-2 right-6 px-3 py-1 text-xs border cursor-pointer hover:bg-opacity-80 transition-colors bg-app-panel border-app-border text-app-fg",
              isExpanded ? 'block' : 'hidden'
            )}
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
