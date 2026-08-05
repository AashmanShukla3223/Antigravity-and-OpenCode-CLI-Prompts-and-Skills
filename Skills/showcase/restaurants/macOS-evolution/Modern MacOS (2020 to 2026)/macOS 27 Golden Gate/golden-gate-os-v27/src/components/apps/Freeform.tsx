import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { downloadBlob, saveToVFS, ImportFileButton, useFileDrop } from '../../utils/vfs-ops';

type Tool = 'pen' | 'rectangle' | 'ellipse' | 'sticky' | 'text';
type CanvasElement = {
  id: string;
  type: 'path' | 'rect' | 'ellipse' | 'sticky' | 'text' | 'image';
  x: number;
  y: number;
  color: string;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  content?: string;
  fontSize?: number;
};

const COLORS = ['#ffffff', '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac'];

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: 'pen', label: 'Pen', icon: '✏️' },
  { id: 'rectangle', label: 'Rectangle', icon: '▭' },
  { id: 'ellipse', label: 'Ellipse', icon: '○' },
  { id: 'sticky', label: 'Sticky Note', icon: '📝' },
  { id: 'text', label: 'Text', icon: 'T' },
];

let elementIdCounter = 0;
const nextId = () => `elem-${++elementIdCounter}`;

export const Freeform: React.FC = () => {
  const { createNode } = useFileSystem();
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('pen');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [isDrawing, setIsDrawing] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState<CanvasElement | null>(null);
  const [undoStack, setUndoStack] = useState<CanvasElement[][]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize] = useState({ w: 4000, h: 4000 });

  const saveUndo = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-50), elements]);
  }, [elements]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setElements(prev);
  }, [undoStack, elements]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left - pan.x;
      const y = e.clientY - rect.top - pan.y;

      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        return;
      }

      if (selectedTool === 'sticky') {
        saveUndo();
        const newElem: CanvasElement = {
          id: nextId(),
          type: 'sticky',
          x,
          y,
          color: selectedColor,
          width: 200,
          height: 150,
          content: 'Double-click to edit',
        };
        setElements((prev) => [...prev, newElem]);
        return;
      }

      if (selectedTool === 'text') {
        saveUndo();
        const newElem: CanvasElement = {
          id: nextId(),
          type: 'text',
          x,
          y,
          color: selectedColor,
          content: 'Text',
          fontSize: 24,
        };
        setElements((prev) => [...prev, newElem]);
        return;
      }

      setIsDrawing(true);
      setDrawStart({ x, y });

      if (selectedTool === 'pen') {
        const path: CanvasElement = {
          id: nextId(),
          type: 'path',
          x: 0,
          y: 0,
          color: selectedColor,
          points: [{ x, y }],
        };
        setCurrentPath(path);
      }
    },
    [pan, selectedTool, selectedColor, elements, saveUndo],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        return;
      }
      if (!isDrawing || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - pan.x;
      const y = e.clientY - rect.top - pan.y;

      if (selectedTool === 'pen' && currentPath) {
        setCurrentPath((prev) =>
          prev
            ? {
                ...prev,
                points: [...(prev.points || []), { x, y }],
              }
            : prev,
        );
      }
    },
    [isPanning, isDrawing, pan, panStart, selectedTool, currentPath],
  );

  const handlePointerUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (!isDrawing) return;
    setIsDrawing(false);

    if (selectedTool === 'pen' && currentPath && currentPath.points && currentPath.points.length > 1) {
      saveUndo();
      setElements((prev) => [...prev, currentPath]);
    } else if (selectedTool === 'rectangle' || selectedTool === 'ellipse') {
      saveUndo();
      const dx = drawStart.x - (drawStart.x + pan.x);
      const dy = drawStart.y - (drawStart.y + pan.y);
      const elem: CanvasElement = {
        id: nextId(),
        type: selectedTool === 'rectangle' ? 'rect' : 'ellipse',
        x: Math.min(drawStart.x, drawStart.x + dx),
        y: Math.min(drawStart.y, drawStart.y + dy),
        width: Math.abs(dx),
        height: Math.abs(dy),
        color: selectedColor,
      };
      setElements((prev) => [...prev, elem]);
    }
    setCurrentPath(null);
  }, [isPanning, isDrawing, selectedTool, currentPath, drawStart, pan, selectedColor, elements, saveUndo]);

  const handleStickyEdit = useCallback((id: string, content: string) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, content } : el)));
  }, []);

  const handleDeleteElement = useCallback(
    (id: string) => {
      saveUndo();
      setElements((prev) => prev.filter((el) => el.id !== id));
    },
    [elements, saveUndo],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const focused = document.activeElement;
        if (focused && focused.classList.contains('sticky-textarea')) return;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo]);

  const dropHandlers = useFileDrop(createNode, 'documents', '.png,.jpeg,.jpg,.svg,.webp', (_file, dataUrl) => {
    const img = new Image();
    img.onload = () => {
      setElements((prev) => [
        ...prev,
        {
          id: nextId(),
          type: 'image',
          x: 200 + Math.random() * 400,
          y: 200 + Math.random() * 400,
          color: '#ffffff',
          width: Math.min(img.width, 400),
          height: Math.min(img.height, 400),
          content: dataUrl,
        },
      ]);
    };
    img.src = dataUrl;
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] text-white select-none">
      <div className="h-12 bg-[#2a2a2a] border-b border-[#3a3a3a] flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-1 bg-[#3a3a3a] rounded-lg p-0.5">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${selectedTool === tool.id ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-[#4a4a4a]'}`}
            >
              <span className="mr-1">{tool.icon}</span>
              {tool.label}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-[#3a3a3a]" />
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <ImportFileButton createNode={createNode} parentId="documents" accept=".png,.jpeg,.jpg,.svg,.webp" />
        <button
          onClick={() => saveToVFS(createNode, JSON.stringify(elements), `freeform-${Date.now()}.json`, 'documents')}
          className="px-3 py-1.5 rounded-md text-xs bg-emerald-600 hover:bg-emerald-500 transition"
        >
          💾 Save
        </button>
        <button
          onClick={() =>
            downloadBlob(JSON.stringify(elements, null, 2), `freeform-${Date.now()}.json`, 'application/json')
          }
          className="px-3 py-1.5 rounded-md text-xs bg-[#3a3a3a] hover:bg-[#4a4a4a] transition"
        >
          ⬇ Download
        </button>
        <div className="w-px h-5 bg-[#3a3a3a]" />
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="px-3 py-1.5 rounded-md text-sm bg-[#3a3a3a] hover:bg-[#4a4a4a] disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Undo
        </button>
        <span className="text-xs text-gray-500">
          {elements.length} item{elements.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-crosshair"
        style={{ background: '#1a1a1a' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        {...dropHandlers}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            width: canvasSize.w,
            height: canvasSize.h,
          }}
        >
          <svg
            width={canvasSize.w}
            height={canvasSize.h}
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />

          {elements.map((el) => (
            <div
              key={el.id}
              className="absolute group"
              style={{ left: el.x ?? 0, top: el.y ?? 0, width: el.width ?? 'auto', height: el.height ?? 'auto' }}
              onDoubleClick={() => {
                if (el.type === 'sticky' || el.type === 'text') {
                  const newContent = prompt('Edit content:', el.content || '');
                  if (newContent !== null) handleStickyEdit(el.id, newContent);
                }
              }}
            >
              {el.type === 'rect' && (
                <svg width={el.width ?? 100} height={el.height ?? 100} className="absolute inset-0 pointer-events-none">
                  <rect
                    x={0}
                    y={0}
                    width={el.width ?? 100}
                    height={el.height ?? 100}
                    fill="none"
                    stroke={el.color}
                    strokeWidth={2}
                    rx={4}
                  />
                </svg>
              )}
              {el.type === 'ellipse' && (
                <svg width={el.width ?? 100} height={el.height ?? 100} className="absolute inset-0 pointer-events-none">
                  <ellipse
                    cx={(el.width ?? 100) / 2}
                    cy={(el.height ?? 100) / 2}
                    rx={(el.width ?? 100) / 2}
                    ry={(el.height ?? 100) / 2}
                    fill="none"
                    stroke={el.color}
                    strokeWidth={2}
                  />
                </svg>
              )}
              {el.type === 'sticky' && (
                <div
                  className="rounded-lg p-3 shadow-lg min-w-[180px] min-h-[120px] relative"
                  style={{ backgroundColor: el.color + '33', borderColor: el.color, borderWidth: 1 }}
                >
                  <textarea
                    className="sticky-textarea w-full h-full bg-transparent text-white text-sm resize-none outline-none font-sans"
                    defaultValue={el.content}
                    onBlur={(e) => handleStickyEdit(el.id, e.target.value)}
                    rows={3}
                    style={{ color: el.color }}
                  />
                </div>
              )}
              {el.type === 'text' && (
                <div
                  className="text-white font-sans cursor-text outline-none px-2 py-1 rounded hover:bg-white/5"
                  style={{ color: el.color, fontSize: el.fontSize }}
                  contentEditable
                  suppressContentEditableWarning
                >
                  {el.content}
                </div>
              )}
              {el.type === 'path' && (
                <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
                  <path
                    d={el.points?.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x - el.x} ${p.y - el.y}`).join(' ')}
                    fill="none"
                    stroke={el.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {el.type === 'image' && el.content && (
                <img
                  src={el.content}
                  alt=""
                  className="pointer-events-none"
                  style={{ width: el.width, height: el.height, objectFit: 'contain' }}
                  draggable={false}
                />
              )}
              {!['path'].includes(el.type) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteElement(el.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-auto shadow-lg"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {currentPath && currentPath.points && currentPath.points.length > 1 && (
            <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
              <path
                d={currentPath.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                fill="none"
                stroke={selectedColor}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      <div className="h-8 bg-[#2a2a2a] border-t border-[#3a3a3a] flex items-center px-4 text-xs text-gray-400 shrink-0">
        <span>Hold Shift + drag to pan • Scroll to zoom • Double-click items to edit</span>
        <span className="ml-auto">{elements.length} elements on canvas</span>
      </div>
    </div>
  );
};
