import React, { useState, useCallback, useRef, useEffect } from 'react';

const COLS = 26;
const ROWS = 50;
const COL_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
type CellKey = string;
interface CellData { value: string; formula?: string; }
type SheetCells = Record<CellKey, CellData>;

const STORAGE_KEY = 'golden_gate_numbers_unlocked';

function cellKey(col: number, row: number): CellKey { return `${COL_LABELS[col]}${row + 1}`; }
function parseCellKey(key: CellKey): { col: number; row: number } | null {
  const m = key.match(/^([A-Z])(\d+)$/);
  if (!m) return null;
  return { col: COL_LABELS.indexOf(m[1]), row: parseInt(m[2]) - 1 };
}

function evalFormula(formula: string, cells: SheetCells): string {
  const upper = formula.toUpperCase();
  if (upper.startsWith('SUM(')) {
    const range = upper.match(/SUM\(([A-Z]\d+):([A-Z]\d+)\)/i);
    if (range) {
      const start = parseCellKey(range[1]); const end = parseCellKey(range[2]);
      if (start && end) {
        let total = 0;
        for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
          for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
            const v = parseFloat(cells[cellKey(c, r)]?.value || '0');
            if (!isNaN(v)) total += v;
          }
        }
        return String(total);
      }
    }
  }
  if (upper.startsWith('AVG(')) {
    const range = upper.match(/AVG\(([A-Z]\d+):([A-Z]\d+)\)/i);
    if (range) {
      const start = parseCellKey(range[1]); const end = parseCellKey(range[2]);
      if (start && end) {
        let total = 0, count = 0;
        for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
          for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
            const v = parseFloat(cells[cellKey(c, r)]?.value || '0');
            if (!isNaN(v)) { total += v; count++; }
          }
        }
        return count > 0 ? String(total / count) : '0';
      }
    }
  }
  if (upper.startsWith('COUNT(')) {
    const range = upper.match(/COUNT\(([A-Z]\d+):([A-Z]\d+)\)/i);
    if (range) {
      const start = parseCellKey(range[1]); const end = parseCellKey(range[2]);
      if (start && end) {
        let count = 0;
        for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
          for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
            if (cells[cellKey(c, r)]?.value !== '' && cells[cellKey(c, r)]?.value !== undefined) count++;
          }
        }
        return String(count);
      }
    }
  }
  if (upper.startsWith('MAX(')) {
    const range = upper.match(/MAX\(([A-Z]\d+):([A-Z]\d+)\)/i);
    if (range) {
      const start = parseCellKey(range[1]); const end = parseCellKey(range[2]);
      if (start && end) {
        let max = -Infinity;
        for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
          for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
            const v = parseFloat(cells[cellKey(c, r)]?.value || '0');
            if (!isNaN(v) && v > max) max = v;
          }
        }
        return max === -Infinity ? '0' : String(max);
      }
    }
  }
  if (upper.startsWith('MIN(')) {
    const range = upper.match(/MIN\(([A-Z]\d+):([A-Z]\d+)\)/i);
    if (range) {
      const start = parseCellKey(range[1]); const end = parseCellKey(range[2]);
      if (start && end) {
        let min = Infinity;
        for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
          for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
            const v = parseFloat(cells[cellKey(c, r)]?.value || '0');
            if (!isNaN(v) && v < min) min = v;
          }
        }
        return min === Infinity ? '0' : String(min);
      }
    }
  }
  return 'ERROR';
}

export const Numbers: React.FC = () => {
  const [cells, setCells] = useState<SheetCells>(() => {
    try {
      const saved = localStorage.getItem('golden_gate_numbers_cells');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [selectedCell, setSelectedCell] = useState<CellKey | null>(null);
  const [editingCell, setEditingCell] = useState<CellKey | null>(null);
  const [formulaBar, setFormulaBar] = useState('');
  const [paid, setPaid] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const editRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('golden_gate_numbers_cells', JSON.stringify(cells));
  }, [cells]);

  useEffect(() => {
    if (editingCell && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingCell]);

  const handleCellClick = useCallback((key: CellKey) => {
    if (selectedCell === key) {
      setEditingCell(key);
      setFormulaBar(cells[key]?.value || '');
    } else {
      setSelectedCell(key);
      setEditingCell(null);
      setFormulaBar(cells[key]?.value || '');
    }
  }, [selectedCell, cells]);

  const handleFormulaSubmit = useCallback((formula: string) => {
    if (!selectedCell) return;
    if (formula.startsWith('=')) {
      const result = evalFormula(formula.substring(1), cells);
      setCells(prev => ({ ...prev, [selectedCell!]: { value: result, formula } }));
    } else {
      setCells(prev => ({ ...prev, [selectedCell!]: { value: formula } }));
    }
    setFormulaBar(formula);
    setEditingCell(null);
  }, [selectedCell, cells]);

  const selectedData = selectedCell ? cells[selectedCell] : null;

  if (!paid) {
    return (
      <div className="h-full w-full bg-zinc-900 text-white flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-green-500/20 flex items-center justify-center">
          <img src="/icons/numbers.png" alt="Numbers" className="w-14 h-14 object-contain" />
        </div>
        <h2 className="text-2xl font-bold">Numbers</h2>
        <p className="text-white/50 text-sm">Create powerful spreadsheets.</p>
        <div className="flex gap-3">
          <button onClick={() => { localStorage.setItem(STORAGE_KEY, 'true'); setPaid(true); }} className="px-6 py-2.5 bg-green-500 hover:bg-green-600 rounded-xl font-medium text-sm transition">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 bg-zinc-800/50">
        <span className="text-xs font-mono text-white/40 w-16">{selectedCell || ''}</span>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <input
          value={selectedCell && editingCell !== selectedCell ? (selectedData?.value || '') : formulaBar}
          onChange={(e) => !editingCell && setFormulaBar(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { handleFormulaSubmit(formulaBar); } }}
          placeholder="Enter value or formula (=SUM(A1:A10))"
          className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1 text-sm outline-none"
        />
        <button onClick={() => handleFormulaSubmit(formulaBar)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-md text-xs font-medium transition">OK</button>
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide" ref={gridRef}>
        <div className="inline-block min-w-full">
          <div className="grid" style={{ gridTemplateColumns: `60px repeat(${COLS}, 100px)` }}>
            <div className="h-8 bg-zinc-800 border-r border-b border-white/10 sticky top-0 z-10" />
            {COL_LABELS.slice(0, COLS).map((label, ci) => (
              <div key={ci} className="h-8 bg-zinc-800 border-r border-b border-white/10 flex items-center justify-center text-xs font-bold text-white/60 sticky top-0 z-10">
                {label}
              </div>
            ))}
            {Array.from({ length: ROWS }).map((_, ri) => (
              <React.Fragment key={ri}>
                <div className="h-8 bg-zinc-800 border-r border-b border-white/10 flex items-center justify-center text-xs font-bold text-white/40 sticky left-0 z-10">
                  {ri + 1}
                </div>
                {Array.from({ length: COLS }).map((_, ci) => {
                  const key = cellKey(ci, ri);
                  const cell = cells[key];
                  const isSelected = selectedCell === key;
                  const isEditing = editingCell === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleCellClick(key)}
                      onDoubleClick={() => { setEditingCell(key); setFormulaBar(cell?.value || ''); }}
                      className={`h-8 border-r border-b border-white/5 flex items-center px-2 text-sm cursor-cell transition-colors ${isSelected ? 'bg-blue-500/20 border-blue-500' : 'hover:bg-white/5'}`}
                    >
                      {isEditing ? (
                        <input
                          ref={editRef}
                          value={formulaBar}
                          onChange={(e) => setFormulaBar(e.target.value)}
                          onBlur={() => { handleFormulaSubmit(formulaBar); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleFormulaSubmit(formulaBar); if (e.key === 'Escape') setEditingCell(null); }}
                          className="bg-transparent outline-none w-full text-sm"
                        />
                      ) : (
                        <span className="truncate w-full">{cell?.value || ''}</span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
