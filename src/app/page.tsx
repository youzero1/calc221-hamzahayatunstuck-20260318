'use client';

import { useState, useCallback } from 'react';

type ButtonType = 'number' | 'operator' | 'equals' | 'clear' | 'special';

interface CalcButton {
  label: string;
  value: string;
  type: ButtonType;
  span?: number;
}

const buttons: CalcButton[] = [
  { label: 'AC', value: 'AC', type: 'clear' },
  { label: '+/-', value: 'toggle', type: 'special' },
  { label: '%', value: '%', type: 'special' },
  { label: '÷', value: '/', type: 'operator' },
  { label: '7', value: '7', type: 'number' },
  { label: '8', value: '8', type: 'number' },
  { label: '9', value: '9', type: 'number' },
  { label: '×', value: '*', type: 'operator' },
  { label: '4', value: '4', type: 'number' },
  { label: '5', value: '5', type: 'number' },
  { label: '6', value: '6', type: 'number' },
  { label: '-', value: '-', type: 'operator' },
  { label: '1', value: '1', type: 'number' },
  { label: '2', value: '2', type: 'number' },
  { label: '3', value: '3', type: 'number' },
  { label: '+', value: '+', type: 'operator' },
  { label: '0', value: '0', type: 'number', span: 2 },
  { label: '.', value: '.', type: 'number' },
  { label: '=', value: '=', type: 'equals' },
];

export default function Home() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const formatNumber = (num: string) => {
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return num;
    if (Math.abs(parsed) >= 1e15 || (Math.abs(parsed) < 1e-7 && parsed !== 0)) {
      return parsed.toExponential(5);
    }
    const str = parsed.toString();
    if (str.length > 12) {
      return parseFloat(parsed.toPrecision(10)).toString();
    }
    return str;
  };

  const handleNumber = useCallback((value: string) => {
    if (waitingForOperand) {
      setDisplay(value === '.' ? '0.' : value);
      setWaitingForOperand(false);
    } else {
      if (value === '.' && display.includes('.')) return;
      if (display === '0' && value !== '.') {
        setDisplay(value);
      } else {
        if (display.replace('-', '').replace('.', '').length >= 12) return;
        setDisplay(display + value);
      }
    }
  }, [display, waitingForOperand]);

  const handleOperator = useCallback((op: string) => {
    const current = parseFloat(display);
    if (prevValue !== null && operator && !waitingForOperand) {
      const prev = parseFloat(prevValue);
      let result: number;
      switch (operator) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '*': result = prev * current; break;
        case '/': result = current !== 0 ? prev / current : NaN; break;
        default: result = current;
      }
      const resultStr = isNaN(result) ? 'Error' : formatNumber(result.toString());
      setDisplay(resultStr);
      setPrevValue(resultStr);
      setExpression(`${resultStr} ${op === '/' ? '÷' : op === '*' ? '×' : op}`);
    } else {
      setPrevValue(display);
      setExpression(`${display} ${op === '/' ? '÷' : op === '*' ? '×' : op}`);
    }
    setOperator(op);
    setWaitingForOperand(true);
  }, [display, prevValue, operator, waitingForOperand]);

  const handleEquals = useCallback(() => {
    if (prevValue === null || operator === null) return;
    const current = parseFloat(display);
    const prev = parseFloat(prevValue);
    let result: number;
    switch (operator) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '*': result = prev * current; break;
      case '/': result = current !== 0 ? prev / current : NaN; break;
      default: result = current;
    }
    const opSymbol = operator === '/' ? '÷' : operator === '*' ? '×' : operator;
    const historyEntry = `${prevValue} ${opSymbol} ${display} = ${isNaN(result) ? 'Error' : formatNumber(result.toString())}`;
    setHistory(prev => [historyEntry, ...prev].slice(0, 10));
    const resultStr = isNaN(result) ? 'Error' : formatNumber(result.toString());
    setDisplay(resultStr);
    setExpression(historyEntry);
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, prevValue, operator]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const handleToggle = useCallback(() => {
    if (display === '0' || display === 'Error') return;
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
  }, [display]);

  const handlePercent = useCallback(() => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    setDisplay(formatNumber((val / 100).toString()));
  }, [display]);

  const handleButton = useCallback((btn: CalcButton) => {
    if (btn.type === 'number') handleNumber(btn.value);
    else if (btn.type === 'operator') handleOperator(btn.value);
    else if (btn.type === 'equals') handleEquals();
    else if (btn.type === 'clear') handleClear();
    else if (btn.value === 'toggle') handleToggle();
    else if (btn.value === '%') handlePercent();
  }, [handleNumber, handleOperator, handleEquals, handleClear, handleToggle, handlePercent]);

  const getButtonStyle = (btn: CalcButton) => {
    const base = 'flex items-center justify-center rounded-full text-xl font-medium cursor-pointer select-none transition-all duration-150 active:scale-95 shadow-md ';
    if (btn.type === 'operator') return base + 'bg-amber-400 hover:bg-amber-300 text-white text-2xl h-16';
    if (btn.type === 'equals') return base + 'bg-amber-400 hover:bg-amber-300 text-white text-2xl h-16';
    if (btn.type === 'clear' || btn.type === 'special') return base + 'bg-slate-500 hover:bg-slate-400 text-white h-16';
    if (btn.value === '0') return base + 'bg-slate-700 hover:bg-slate-600 text-white h-16 justify-start pl-6';
    return base + 'bg-slate-700 hover:bg-slate-600 text-white h-16';
  };

  const displayFontSize = display.length > 9 ? 'text-3xl' : display.length > 6 ? 'text-4xl' : 'text-5xl';

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full max-w-3xl">
        {/* Calculator */}
        <div className="w-full max-w-xs mx-auto" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', borderRadius: '2rem', padding: '1.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          {/* Display */}
          <div className="mb-4 px-2">
            <div className="text-slate-400 text-sm h-6 text-right truncate">{expression || '\u00A0'}</div>
            <div className={`text-white text-right font-light mt-1 ${displayFontSize} tracking-tight truncate`}>
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={() => handleButton(btn)}
                className={getButtonStyle(btn)}
                style={btn.span ? { gridColumn: `span ${btn.span}` } : {}}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* History Panel */}
        <div className="w-full max-w-xs mx-auto" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', borderRadius: '2rem', padding: '1.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', minHeight: '200px' }}>
          <h2 className="text-slate-300 text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🕐</span> History
          </h2>
          {history.length === 0 ? (
            <p className="text-slate-500 text-sm text-center mt-8">No calculations yet</p>
          ) : (
            <ul className="space-y-2">
              {history.map((entry, i) => (
                <li key={i} className="text-slate-300 text-sm bg-slate-800 bg-opacity-60 rounded-xl px-3 py-2 break-all">
                  {entry}
                </li>
              ))}
            </ul>
          )}
          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              className="mt-4 w-full text-slate-400 text-xs hover:text-red-400 transition-colors duration-150"
            >
              Clear History
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
