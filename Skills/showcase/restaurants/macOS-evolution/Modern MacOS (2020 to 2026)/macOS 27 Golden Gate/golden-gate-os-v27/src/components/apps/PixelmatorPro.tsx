import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { saveToVFS, ImportFileButton, useFileDrop } from '../../utils/vfs-ops';

type Tool = 'brush' | 'eraser' | 'rect' | 'ellipse' | 'fill' | 'eyedropper';
type Filter = 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast';

interface PixelLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  type: 'drawing' | 'shape';
}

let layerCounter = 0;
const nextLayer = () => `layer-${++layerCounter}`;

export const PixelmatorPro: React.FC = () => {
  const { createNode } = useFileSystem();
  const [selectedTool, setSelectedTool] = useState<Tool>('brush');
  const [selectedColor, setSelectedColor] = useState('#4dabf7');
  const [brushSize, setBrushSize] = useState(8);
  const [opacity, setOpacity] = useState(1);
  const [activeFilter, setActiveFilter] = useState<Filter>('none');
  const [filterIntensity, setFilterIntensity] = useState(50);
  const [layers, setLayers] = useState<PixelLayer[]>([
    { id: nextLayer(), name: 'Background', visible: true, opacity: 1, type: 'drawing' },
    { id: nextLayer(), name: 'Layer 1', visible: true, opacity: 1, type: 'drawing' },
  ]);
  const [selectedLayer, setSelectedLayer] = useState<string>(layers[0].id);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize] = useState({ w: 600, h: 400 });

  const TOOLS: { id: Tool; label: string; icon: string }[] = [
    { id: 'brush', label: 'Brush', icon: '🖌️' },
    { id: 'eraser', label: 'Eraser', icon: '🧹' },
    { id: 'rect', label: 'Rectangle', icon: '▭' },
    { id: 'ellipse', label: 'Ellipse', icon: '○' },
    { id: 'fill', label: 'Fill', icon: '🪣' },
    { id: 'eyedropper', label: 'Pick', icon: '💉' },
  ];

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'grayscale', label: 'Grayscale' },
    { id: 'sepia', label: 'Sepia' },
    { id: 'blur', label: 'Blur' },
    { id: 'brightness', label: 'Brightness' },
    { id: 'contrast', label: 'Contrast' },
  ];

  const drawAt = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = selectedTool === 'eraser' ? '#2a2a2a' : selectedColor;
    ctx.fill();
  }, [selectedTool, selectedColor, brushSize, opacity]);

  const handleCanvasDown = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (selectedTool === 'fill') {
      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    drawAt(x, y);
  }, [selectedTool, selectedColor, canvasSize, drawAt]);

  const handleCanvasMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || (selectedTool !== 'brush' && selectedTool !== 'eraser')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = selectedTool === 'eraser' ? '#2a2a2a' : selectedColor;
    ctx.globalAlpha = opacity;
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, selectedTool, selectedColor, brushSize, opacity]);

  const handleCanvasUp = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);
  }, [canvasSize]);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'pixelmator-export.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const addLayer = useCallback(() => {
    const newLayer: PixelLayer = {
      id: nextLayer(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      type: 'drawing',
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
  }, [layers.length]);

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  }, []);

  const deleteLayer = useCallback((id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayer === id) setSelectedLayer(layers[0]?.id || '');
  }, [layers, selectedLayer]);

  useEffect(() => {
    handleClear();
  }, [handleClear]);

  const dropHandlers = useFileDrop(createNode, 'pictures', '.png,.jpeg,.jpg,.svg,.webp', (file, dataUrl) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvasSize.w, canvasSize.h);
    };
    img.src = dataUrl;
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] text-white select-none">
      <div className="h-11 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-1 bg-[#3a3a3a] rounded-lg p-0.5">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs transition-all ${selectedTool === tool.id ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white hover:bg-[#4a4a4a]'}`}
            >{tool.icon} {tool.label}</button>
          ))}
        </div>
        <div className="w-px h-5 bg-[#3c3c3c]" />
        <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border border-[#444]" />
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Size:</span>
          <input type="range" min={2} max={40} value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-20 accent-blue-500" />
          <span className="text-gray-400 w-6">{brushSize}px</span>
        </div>
        <ImportFileButton createNode={createNode} parentId="pictures" accept=".png,.jpeg,.jpg,.svg,.webp" />
        <div className="w-px h-5 bg-[#3c3c3c]" />
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const dataUrl = canvas.toDataURL('image/png');
            saveToVFS(createNode, dataUrl, `pixelmator-${Date.now()}.png`, 'pictures');
          }}
          className="px-3 py-1.5 rounded text-xs bg-emerald-600 hover:bg-emerald-500 transition"
        >
          💾 Save to VFS
        </button>
        <div className="flex-1" />
        <button onClick={handleClear} className="px-3 py-1.5 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] transition">Clear</button>
        <button onClick={handleExport} className="px-3 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 transition">Export PNG</button>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex items-center justify-center bg-[#111] p-4">
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            className="rounded-lg shadow-2xl cursor-crosshair"
            style={{ backgroundColor: '#2a2a2a', filter: activeFilter !== 'none' ? `${activeFilter}(${filterIntensity}%)` : undefined }}
            onPointerDown={handleCanvasDown}
            onPointerMove={handleCanvasMove}
            onPointerUp={handleCanvasUp}
            onPointerLeave={handleCanvasUp}
            {...dropHandlers}
          />
        </div>

        <div className="w-56 bg-[#252525] border-l border-[#333] flex flex-col shrink-0">
          <div className="h-8 bg-[#2d2d2d] border-b border-[#333] flex items-center px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Layers
          </div>
          <div className="flex-1 overflow-y-auto">
            {layers.map(l => (
              <div
                key={l.id}
                onClick={() => setSelectedLayer(l.id)}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-[#2a2a2a] transition ${selectedLayer === l.id ? 'bg-blue-600/30 border-l-2 border-l-blue-500' : 'hover:bg-[#2a2a2a]'}`}
              >
                <button onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(l.id); }} className="text-xs w-4">{l.visible ? '👁' : '—'}</button>
                <span className="text-xs font-medium truncate flex-1">{l.name}</span>
                <span className="text-[10px] text-gray-500">{Math.round(l.opacity * 100)}%</span>
                {layers.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); deleteLayer(l.id); }} className="text-[10px] text-red-400 hover:text-red-300">×</button>
                )}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#333]">
            <button onClick={addLayer} className="w-full py-1.5 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] transition">+ Add Layer</button>
          </div>
          <div className="h-8 bg-[#2d2d2d] border-t border-[#333] flex items-center px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Filters
          </div>
          <div className="p-3 space-y-2">
            <div className="flex flex-wrap gap-1">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2 py-1 rounded text-[10px] transition ${activeFilter === f.id ? 'bg-blue-500 text-white' : 'bg-[#3c3c3c] hover:bg-[#4a4a4a] text-gray-300'}`}
                >{f.label}</button>
              ))}
            </div>
            {activeFilter !== 'none' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Intensity:</span>
                <input type="range" min={10} max={100} value={filterIntensity} onChange={(e) => setFilterIntensity(parseInt(e.target.value))} className="flex-1 accent-blue-500" />
              </div>
            )}
          </div>
          <div className="h-8 bg-[#2d2d2d] border-t border-[#333] flex items-center px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Adjustments
          </div>
          <div className="p-3 space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Opacity</label>
              <input type="range" min={0} max={1} step={0.01} value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="h-8 bg-[#2d2d2d] border-t border-[#3c3c3c] flex items-center px-4 text-xs text-gray-400 shrink-0">
        <span>{canvasSize.w} × {canvasSize.h}</span>
        <span className="ml-auto">{layers.length} layers • {selectedTool}</span>
      </div>
    </div>
  );
};
