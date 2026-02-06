import { useCallback, useState, useRef, useEffect } from 'react';

interface Props {
  value: number;
  min: number;
  max: number;
  step: number;
  label?: string;
  suffix?: string;
  decimals?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function NumberInput({ value, min, max, step, label, suffix, decimals = 1, onChange, className = '' }: Props) {
  const [inputValue, setInputValue] = useState(value.toFixed(decimals));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputValue(value.toFixed(decimals));
    }
  }, [value, decimals]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setInputValue(value.toFixed(decimals));
      return;
    }
    const clamped = Math.min(Math.max(num, min), max);
    onChange(clamped);
    setInputValue(clamped.toFixed(decimals));
  }, [inputValue, min, max, value, decimals, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newVal = Math.min(value + step, max);
      onChange(newVal);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newVal = Math.max(value - step, min);
      onChange(newVal);
    }
  }, [value, step, min, max, onChange]);

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {label && (
        <label className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-bg-input border border-border rounded-md px-2 py-1.5 text-sm text-text-primary text-center font-mono focus:border-border-focus focus:outline-none transition-colors"
        />
        {suffix && (
          <span className="absolute right-2 text-[10px] text-text-muted pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
