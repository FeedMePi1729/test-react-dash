import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { parseCommand, getCommandSuggestions } from '../utils/commandParser';

interface CommandConsoleProps {
  onCommand: (command: string) => void;
  position?: 'top' | 'bottom';
}

export const CommandConsole = ({ onCommand, position = 'bottom' }: CommandConsoleProps) => {
  const [input, setInput] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Blinking cursor animation
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update suggestions as user types
    if (input.trim()) {
      setSuggestions(getCommandSuggestions(input));
    } else {
      setSuggestions([]);
    }
  }, [input]);

  useEffect(() => {
    // Update cursor position based on input length
    if (inputRef.current) {
      const selectionStart = inputRef.current.selectionStart || input.length;
      setCursorPosition(selectionStart);
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // Update cursor position
    setTimeout(() => {
      if (inputRef.current) {
        const selectionStart = inputRef.current.selectionStart || e.target.value.length;
        setCursorPosition(selectionStart);
      }
    }, 0);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(e);
    // Update cursor position after key press
    setTimeout(() => {
      if (inputRef.current) {
        const selectionStart = inputRef.current.selectionStart || input.length;
        setCursorPosition(selectionStart);
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = input.trim();
      if (trimmed) {
        onCommand(trimmed);
        setHistory(prev => [...prev, trimmed]);
        setHistoryIndex(-1);
        setInput('');
        setSuggestions([]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 
          ? history.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setInput(suggestions[0] + ' ');
      inputRef.current?.focus();
    }
  };

  const positionClass = position === 'top' ? 'top-0' : 'bottom-0';

  return (
    <div 
      className={`fixed ${positionClass} left-0 right-0 z-50 bloomberg-bg-black bloomberg-border-amber`}
      style={{
        borderBottom: position === 'top' ? '1px solid #FF9800' : 'none',
        borderTop: position === 'bottom' ? '1px solid #FF9800' : 'none',
      }}
    >
      {suggestions.length > 0 && position === 'top' && (
        <div 
          className="px-2 pt-1"
          style={{ borderBottom: '1px solid #FF9800' }}
        >
          <div className="text-bloomberg-amber text-xs font-mono">
            {suggestions.slice(0, 5).map((suggestion, idx) => (
              <div key={idx} className="py-0.5">
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center px-2 py-1">
        <span className="text-bloomberg-amber font-mono text-sm mr-2">&gt;</span>
        <div className="flex-1 relative flex items-center">
          <span
            ref={measureRef}
            className="absolute font-mono text-sm whitespace-pre"
            style={{ 
              visibility: 'hidden',
              pointerEvents: 'none',
              top: 0,
              left: 0,
            }}
          >
            {input.substring(0, cursorPosition)}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onSelect={() => {
              setTimeout(() => {
                if (inputRef.current) {
                  const selectionStart = inputRef.current.selectionStart || input.length;
                  setCursorPosition(selectionStart);
                }
              }, 0);
            }}
            className="flex-1 bg-transparent text-white font-mono text-sm outline-none border-none focus:outline-none"
            placeholder=""
            autoFocus
            style={{ caretColor: 'transparent' }}
          />
          {showCursor && (
            <span 
              className="terminal-cursor absolute"
              style={{ 
                left: measureRef.current ? `${measureRef.current.offsetWidth}px` : '0px',
                pointerEvents: 'none',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            ></span>
          )}
        </div>
      </div>
      {suggestions.length > 0 && position === 'bottom' && (
        <div className="px-2 pb-1">
          <div className="text-bloomberg-amber text-xs font-mono">
            {suggestions.slice(0, 5).map((suggestion, idx) => (
              <div key={idx} className="py-0.5">
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

