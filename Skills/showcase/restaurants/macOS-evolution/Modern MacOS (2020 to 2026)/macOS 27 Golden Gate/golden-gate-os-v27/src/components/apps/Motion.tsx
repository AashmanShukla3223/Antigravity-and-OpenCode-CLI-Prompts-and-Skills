import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { downloadBlob, saveToVFS, ImportFileButton } from '../../utils/vfs-ops';

type MotionElement = {
  id: string;
  name: string;
  type: 'text' | 'shape' | 'particle';
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  color: string;
  content: string;
  visible: boolean;
};

type Keyframe = {
  frame: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
};

const SHAPES = ['circle', 'square', 'triangle', 'star'];

let elemIdCounter = 0;
const nextElemId = () => `motion-${++elemIdCounter}`;
let kfIdCounter = 0;
const nextKfId = () => `kf-${++kfIdCounter}`;

const interpolate = (a: number, b: number, t: number) => a + (b - a) * t;

const getKeyframeValue = (frames: Keyframe[], currentFrame: number, prop: keyof Keyframe): number => {
  if (frames.length === 0) return 0;
  if (frames.length === 1) return frames[0][prop] as number;
  const sorted = [...frames].sort((a, b) => a.frame - b.frame);
  if (currentFrame <= sorted[0].frame) return sorted[0][prop] as number;
  if (currentFrame >= sorted[sorted.length - 1].frame) return sorted[sorted.length - 1][prop] as number;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (currentFrame >= sorted[i].frame && currentFrame <= sorted[i + 1].frame) {
      const t = (currentFrame - sorted[i].frame) / (sorted[i + 1].frame - sorted[i].frame);
      return interpolate(sorted[i][prop] as number, sorted[i + 1][prop] as number, t);
    }
  }
  return sorted[sorted.length - 1][prop] as number;
};

export const Motion: React.FC = () => {
  const { createNode } = useFileSystem();
  const [elements, setElements] = useState<MotionElement[]>([
    { id: nextElemId(), name: 'Title', type: 'text', x: 400, y: 200, scale: 1, rotation: 0, opacity: 1, color: '#ffffff', content: 'Motion', visible: true },
    { id: nextElemId(), name: 'Circle 1', type: 'shape', x: 200, y: 300, scale: 1, rotation: 0, opacity: 0.8, color: '#4dabf7', content: 'circle', visible: true },
    { id: nextElemId(), name: 'Particles', type: 'particle', x: 400, y: 400, scale: 1, rotation: 0, opacity: 1, color: '#ffd43b', content: '', visible: true },
  ]);
  const [keyframes, setKeyframes] = useState<Record<string, Keyframe[]>>({
    [elements[0].id]: [{ frame: 0, x: 400, y: 200, scale: 0, rotation: 0, opacity: 1 }, { frame: 60, x: 400, y: 200, scale: 1.5, rotation: 360, opacity: 1 }],
    [elements[1].id]: [{ frame: 0, x: 600, y: 300, scale: 1, rotation: 0, opacity: 1 }, { frame: 90, x: 200, y: 300, scale: 1.5, rotation: 180, opacity: 0.6 }],
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalFrames] = useState(120);
  const [fps] = useState(30);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const animRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedElement = elements.find(e => e.id === selectedId) || null;
  const elementKeyframes = selectedId ? keyframes[selectedId] || [] : [];

  const addElement = useCallback((type: MotionElement['type']) => {
    const names = { text: 'Text', shape: 'Shape', particle: 'Particle' };
    const colors = { text: '#ffffff', shape: '#9775fa', particle: '#ffd43b' };
    const newElem: MotionElement = {
      id: nextElemId(),
      name: `${names[type]} ${elements.length + 1}`,
      type, x: 400, y: 300, scale: 1, rotation: 0, opacity: 1,
      color: colors[type], content: type === 'text' ? 'Text' : type === 'shape' ? 'circle' : '',
      visible: true,
    };
    setElements(prev => [...prev, newElem]);
    setSelectedId(newElem.id);
  }, [elements.length]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setElements(prev => prev.filter(e => e.id !== selectedId));
    setKeyframes(prev => { const n = { ...prev }; delete n[selectedId]; return n; });
    setSelectedId(null);
  }, [selectedId]);

  const updateElement = useCallback((id: string, update: Partial<MotionElement>) => {
    setElements(prev => prev.map(e => e.id === id ? { ...e, ...update } : e));
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setElements(prev => prev.map(e => e.id === id ? { ...e, visible: !e.visible } : e));
  }, []);

  const addKeyframe = useCallback(() => {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId);
    if (!el) return;
    const newKf: Keyframe = { frame: currentFrame, x: el.x, y: el.y, scale: el.scale, rotation: el.rotation, opacity: el.opacity };
    setKeyframes(prev => {
      const existing = prev[selectedId] || [];
      const filtered = existing.filter(kf => kf.frame !== currentFrame);
      return { ...prev, [selectedId]: [...filtered, newKf] };
    });
  }, [selectedId, elements, currentFrame]);

  const deleteKeyframe = useCallback((frame: number) => {
    if (!selectedId) return;
    setKeyframes(prev => ({
      ...prev,
      [selectedId]: (prev[selectedId] || []).filter(kf => kf.frame !== frame),
    }));
  }, [selectedId]);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if (!canvasRef.current || selectedId === null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const el = elements.find(e => e.id === selectedId);
    if (!el) return;
    const dx = x - el.x;
    const dy = y - el.y;
    if (Math.abs(dx) < 100 && Math.abs(dy) < 100) {
      setDraggingElement(selectedId);
      setDragOffset({ x: dx, y: dy });
    }
  }, [selectedId, elements]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingElement || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    updateElement(draggingElement, {
      x: e.clientX - rect.left - dragOffset.x,
      y: e.clientY - rect.top - dragOffset.y,
    });
  }, [draggingElement, dragOffset, updateElement]);

  const handleCanvasPointerUp = useCallback(() => {
    setDraggingElement(null);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      let lastTime = performance.now();
      const frameInterval = 1000 / fps;
      const animate = (time: number) => {
        const delta = time - lastTime;
        if (delta >= frameInterval) {
          lastTime = time;
          setCurrentFrame(prev => {
            const next = prev + 1;
            if (next >= totalFrames) { setIsPlaying(false); return 0; }
            return next;
          });
        }
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
      return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }
  }, [isPlaying, fps, totalFrames]);

  const getAnimatedProps = (el: MotionElement) => {
    const kfs = keyframes[el.id];
    if (!kfs || kfs.length === 0) return el;
    return {
      x: getKeyframeValue(kfs, currentFrame, 'x'),
      y: getKeyframeValue(kfs, currentFrame, 'y'),
      scale: getKeyframeValue(kfs, currentFrame, 'scale'),
      rotation: getKeyframeValue(kfs, currentFrame, 'rotation'),
      opacity: getKeyframeValue(kfs, currentFrame, 'opacity'),
    };
  };

  const timeStr = (frame: number) => {
    const secs = Math.floor(frame / fps);
    const frac = Math.floor((frame % fps) / fps * 100);
    return `${secs}.${frac.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] text-white select-none">
      <div className="h-11 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => addElement('text')} className="px-3 py-1.5 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] transition">+ Text</button>
          <button onClick={() => addElement('shape')} className="px-3 py-1.5 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] transition">+ Shape</button>
          <button onClick={() => addElement('particle')} className="px-3 py-1.5 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] transition">+ Particles</button>
        </div>
        <ImportFileButton createNode={createNode} parentId="documents" />
        <div className="w-px h-5 bg-[#3c3c3c]" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentFrame(0)}
            className="px-2 py-1 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] transition"
          >|◁</button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded text-xs font-bold transition ${isPlaying ? 'bg-red-500 text-white' : 'bg-[#3c3c3c] hover:bg-[#4a4a4a]'}`}
          >{isPlaying ? '■' : '▶'}</button>
          <button onClick={addKeyframe} className="px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500 transition font-medium">
            + Keyframe
          </button>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => {
            const project = { elements, keyframes, totalFrames, fps };
            saveToVFS(createNode, JSON.stringify(project, null, 2), `motion-${Date.now()}.json`, 'documents');
          }}
          className="px-3 py-1.5 rounded text-xs bg-emerald-600 hover:bg-emerald-500 transition"
        >
          💾 Save
        </button>
        <button
          onClick={() => {
            const project = { elements, keyframes, totalFrames, fps };
            downloadBlob(JSON.stringify(project, null, 2), `motion-${Date.now()}.json`, 'application/json');
          }}
          className="px-2 py-1 rounded text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] transition"
        >
          ⬇
        </button>
        <span className="text-xs text-gray-400 ml-auto">{timeStr(currentFrame)} / {timeStr(totalFrames)}</span>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-56 bg-[#252525] border-r border-[#333] flex flex-col shrink-0">
          <div className="h-8 bg-[#2d2d2d] border-b border-[#333] flex items-center px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Layers
          </div>
          <div className="flex-1 overflow-y-auto">
            {elements.map(el => {
              const anim = getAnimatedProps(el);
              return (
                <div
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-[#2a2a2a] transition ${selectedId === el.id ? 'bg-blue-600/30 border-l-2 border-l-blue-500' : 'hover:bg-[#2a2a2a]'}`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleVisibility(el.id); }}
                    className="text-xs w-4 text-center"
                  >{el.visible ? '👁' : '—'}</button>
                  <span className="text-xs font-medium truncate flex-1">{el.name}</span>
                  <span className="text-[10px] text-gray-500">{el.type}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-[#0a0a0a]"
          style={{ backgroundImage: 'radial-gradient(circle, #222 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerLeave={handleCanvasPointerUp}
        >
          <div className="absolute inset-4 border border-dashed border-white/10 rounded-lg flex items-center justify-center">
            {elements.filter(e => e.visible).map(el => {
              const anim = getAnimatedProps(el);
              return (
                <div
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={`absolute cursor-move transition-shadow ${selectedId === el.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : ''}`}
                  style={{
                    left: anim.x,
                    top: anim.y,
                    transform: `translate(-50%, -50%) scale(${anim.scale}) rotate(${anim.rotation}deg)`,
                    opacity: anim.opacity,
                  }}
                >
                  {el.type === 'text' && (
                    <div className="text-4xl font-bold whitespace-nowrap drop-shadow-lg" style={{ color: el.color }}>{el.content}</div>
                  )}
                  {el.type === 'shape' && (
                    el.content === 'circle' ? (
                      <div className="w-20 h-20 rounded-full" style={{ backgroundColor: el.color }} />
                    ) : el.content === 'square' ? (
                      <div className="w-20 h-20 rounded-lg" style={{ backgroundColor: el.color }} />
                    ) : el.content === 'star' ? (
                      <div className="text-5xl">⭐</div>
                    ) : (
                      <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px]" style={{ borderBottomColor: el.color, borderLeftColor: 'transparent', borderRightColor: 'transparent' }} />
                    )
                  )}
                  {el.type === 'particle' && (
                    <div className="relative w-24 h-24">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 rounded-full animate-ping"
                          style={{
                            backgroundColor: el.color,
                            left: `${40 + Math.sin(i * Math.PI / 4) * 30}px`,
                            top: `${40 + Math.cos(i * Math.PI / 4) * 30}px`,
                            animationDuration: `${0.5 + i * 0.1}s`,
                            animationDelay: `${i * 0.1}s`,
                            opacity: 0.7,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-56 bg-[#252525] border-l border-[#333] flex flex-col shrink-0">
          <div className="h-8 bg-[#2d2d2d] border-b border-[#333] flex items-center px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Properties
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {selectedElement ? (
              <>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Name</label>
                  <input
                    value={selectedElement.name}
                    onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Type</label>
                  <div className="text-xs text-gray-300">{selectedElement.type}</div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer bg-transparent border border-[#333]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Scale</label>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    step={0.01}
                    value={selectedElement.scale}
                    onChange={(e) => updateElement(selectedElement.id, { scale: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                  <span className="text-[10px] text-gray-500">{selectedElement.scale.toFixed(2)}</span>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Rotation</label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={selectedElement.rotation}
                    onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                  <span className="text-[10px] text-gray-500">{selectedElement.rotation}°</span>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Opacity</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={selectedElement.opacity}
                    onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                  <span className="text-[10px] text-gray-500">{selectedElement.opacity.toFixed(2)}</span>
                </div>
                {selectedElement.type === 'text' && (
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Content</label>
                    <input
                      value={selectedElement.content}
                      onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                )}
                {selectedElement.type === 'shape' && (
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Shape</label>
                    <select
                      value={selectedElement.content}
                      onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                    >
                      {SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div className="pt-2 border-t border-[#333]">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Keyframes ({elementKeyframes.length})</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {elementKeyframes.sort((a, b) => a.frame - b.frame).map(kf => (
                      <div key={`${kf.frame}`} className="flex items-center justify-between bg-[#1a1a1a] rounded px-2 py-1">
                        <span className="text-[10px] text-blue-300">{timeStr(kf.frame)}</span>
                        <button
                          onClick={() => deleteKeyframe(kf.frame)}
                          className="text-[10px] text-red-400 hover:text-red-300"
                        >×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={deleteSelected}
                  className="w-full py-1.5 rounded text-xs bg-red-600/30 hover:bg-red-600/50 text-red-300 transition"
                >Delete Layer</button>
              </>
            ) : (
              <div className="text-xs text-gray-500 text-center py-8">Select a layer</div>
            )}
          </div>
        </div>
      </div>

      <div className="h-20 bg-[#1e1e1e] border-t border-[#333] shrink-0 flex items-center px-4">
        <div className="flex-1 relative h-14 bg-[#252525] rounded-lg border border-[#333] overflow-hidden">
          <div className="absolute inset-0 flex items-center">
            {Object.entries(keyframes).map(([elemId, kfs]) =>
              kfs.map(kf => (
                <div
                  key={`${elemId}-${kf.frame}`}
                  className={`absolute w-2 h-2 rounded-full cursor-pointer z-10 ${selectedId === elemId ? 'bg-blue-400' : 'bg-gray-500'}`}
                  style={{ left: `${(kf.frame / totalFrames) * 100}%` }}
                  onClick={() => setCurrentFrame(kf.frame)}
                  title={`${elements.find(e => e.id === elemId)?.name || elemId}: ${timeStr(kf.frame)}`}
                />
              ))
            )}
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_6px_rgba(255,50,50,0.8)] z-20 pointer-events-none"
            style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
          />
          <div
            className="absolute inset-y-0 cursor-pointer z-10"
            style={{ left: 0, right: 0 }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setCurrentFrame(Math.floor(pct * totalFrames));
            }}
          />
        </div>
      </div>
    </div>
  );
};
