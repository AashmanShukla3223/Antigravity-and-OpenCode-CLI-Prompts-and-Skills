import React, { useState, useCallback } from 'react';

type Operator = '+' | '-' | '×' | '÷' | '=' | null;

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const formatNumber = (n: number): string => {
    const str = n.toFixed(10);
    if (str.includes('.')) {
      const trimmed = str.replace(/0+$/, '').replace(/\.$/, '');
      return trimmed;
    }
    return str;
  };

  const inputDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
      } else {
        setDisplay((prev) => (prev === '0' ? digit : prev + digit));
      }
    },
    [waitingForOperand],
  );

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
    }
  }, [display, waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const toggleSign = useCallback(() => {
    setDisplay((prev) => {
      if (prev === '0') return prev;
      return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
    });
  }, []);

  const percent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(formatNumber(value / 100));
  }, [display]);

  const performOperation = useCallback(
    (nextOperator: Operator) => {
      const currentValue = parseFloat(display);

      if (prevValue !== null && operator && !waitingForOperand) {
        let result: number;
        switch (operator) {
          case '+':
            result = prevValue + currentValue;
            break;
          case '-':
            result = prevValue - currentValue;
            break;
          case '×':
            result = prevValue * currentValue;
            break;
          case '÷':
            result = prevValue / currentValue;
            break;
          default:
            result = currentValue;
        }
        setDisplay(formatNumber(result));
        setPrevValue(result);
      } else {
        setPrevValue(currentValue);
      }

      if (nextOperator === '=') {
        setOperator(null);
        setPrevValue(null);
        setWaitingForOperand(true);
      } else {
        setOperator(nextOperator);
        setWaitingForOperand(true);
      }
    },
    [display, prevValue, operator, waitingForOperand],
  );

  const btnClass = (type: 'number' | 'operator' | 'function') => {
    switch (type) {
      case 'number':
        return 'bg-[#333] hover:bg-[#444] active:bg-[#555] text-white';
      case 'operator':
        return 'bg-[#ff9f0a] hover:bg-[#ffb03a] active:bg-[#e08a00] text-white';
      case 'function':
        return 'bg-[#a5a5a5] hover:bg-[#b5b5b5] active:bg-[#c5c5c5] text-black';
    }
  };

  const isActiveOp = (op: Operator) => operator === op;

  return (
    <div className="h-full w-full bg-black flex flex-col select-none">
      <div className="flex-1 flex items-end justify-end px-6 pb-2">
        <div className="text-[64px] font-thin text-white tracking-tighter leading-none truncate max-w-full">
          {display}
        </div>
      </div>

      <div className="px-3 pb-3 grid grid-cols-4 gap-3">
        <button onClick={clearAll} className={`${btnClass('function')} h-[72px] rounded-full text-2xl font-medium`}>
          {prevValue !== null || display !== '0' ? 'C' : 'AC'}
        </button>
        <button onClick={toggleSign} className={`${btnClass('function')} h-[72px] rounded-full text-2xl font-medium`}>
          ±
        </button>
        <button onClick={percent} className={`${btnClass('function')} h-[72px] rounded-full text-2xl font-medium`}>
          %
        </button>
        <button
          onClick={() => performOperation('÷')}
          className={`${btnClass('operator')} h-[72px] rounded-full text-3xl font-medium ${isActiveOp('÷') ? 'bg-white text-[#ff9f0a]' : ''}`}
        >
          ÷
        </button>

        <button
          onClick={() => inputDigit('7')}
          className={`${btnClass('number')} h-[72px] rounded-full text-3xl font-medium`}
        >
          7
        </button>
        <button
          onClick={() => inputDigit('8')}
          className={`${btnClass('number')} h-[72px] rounded-full text-3xl font-medium`}
        >
          8
        </button>
        <button
          onClick={() => inputDigit('9')}
          className={`${btnClass('number')} h-[72px] rounded-full text-3xl font-medium`}
        >
          9
        </button>
        <button
          onClick={() => performOperation('×')}
          className={`${btnClass('operator')} h-[72px] rounded-full text-3xl font-medium ${isActiveOp('×') ? 'bg-white text-[#ff9f0a]' : ''}`}
        >
          ×
        </button>

        <button
          onClick={() => inputDigit('4')}
          className={`${btnClass('number')} h-[72px] rounded-full text-3xl font-medium`}
        >
          4
        </button>
        <button
          onClick={() => inputDigit('5')}
          className={`${btnClass('number')} h-[72px] rounded-full text-3xl font-medium`}
        >
          5
        </button>
        <button
          onClick={() => inputDigit('6')}
          className={`${btnClass('number')} h-[72px] rounded-full text-3xl font-medium`}
        >
          6
        </button>
        <button
          onClick={() => performOperation('-')}
          className={`${btnClass('operator')} h-[72px] rounded-full text-3xl font-medium ${isActiveOp('-') ? 'bg-white text-[#ff9f0a]' : ''}`}
        >
          −
        </button>

        <button
          onClick={() => inputDigit('1')}
          className={`${btnClass('number')} h-[72px] rounded-full text-3xl font-medium`}
        >
          1
        </button>
        <button
          onClick={() => inputDigit('2')}
          className={`${btnClass('number')} h-[72px] rounded-full text-3xl font-medium`}
        >
          2
        </button>
        <button
          onClick={() => inputDigit('3')}
          className={`${btnClass('number')} h-[72px] rounded-full text-3xl font-medium`}
        >
          3
        </button>
        <button
          onClick={() => performOperation('+')}
          className={`${btnClass('operator')} h-[72px] rounded-full text-3xl font-medium ${isActiveOp('+') ? 'bg-white text-[#ff9f0a]' : ''}`}
        >
          +
        </button>

        <button
          onClick={() => inputDigit('0')}
          className={`${btnClass('number')} col-span-2 h-[72px] rounded-full text-3xl font-medium text-left pl-7`}
        >
          0
        </button>
        <button onClick={inputDecimal} className={`${btnClass('number')} h-[72px] rounded-full text-3xl font-medium`}>
          .
        </button>
        <button
          onClick={() => performOperation('=')}
          className={`${btnClass('operator')} h-[72px] rounded-full text-3xl font-medium ${isActiveOp('=') ? 'bg-white text-[#ff9f0a]' : ''}`}
        >
          =
        </button>
      </div>
    </div>
  );
};
