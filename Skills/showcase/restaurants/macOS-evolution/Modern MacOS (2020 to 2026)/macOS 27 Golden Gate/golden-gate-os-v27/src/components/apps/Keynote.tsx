import React, { useState, useCallback } from 'react';
import { PlusSignIcon, Delete02Icon, PresentationLineChart01Icon, Square01Icon, CircleIcon, TextIcon, ArrowLeft01Icon } from 'hugeicons-react';

interface SlideElement {
  id: string;
  type: 'text' | 'rect' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
}

interface Slide {
  id: string;
  elements: SlideElement[];
  backgroundColor: string;
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

function createSlide(): Slide {
  return {
    id: generateId(),
    elements: [],
    backgroundColor: '#1a1a2e',
  };
}

const STORAGE_KEY = 'golden_gate_keynote_unlocked';

export const Keynote: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>(() => {
    const s = createSlide();
    s.elements.push({ id: generateId(), type: 'text', x: 100, y: 100, width: 400, height: 60, content: 'Double-click to edit', color: '#ffffff' });
    return [s];
  });
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [presentMode, setPresentMode] = useState(false);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [paid, setPaid] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  const activeSlide = slides[activeSlideIndex];

  const addSlide = useCallback(() => {
    const newSlide = createSlide();
    setSlides(prev => [...prev, newSlide]);
    setActiveSlideIndex(prev => prev + 1);
  }, []);

  const deleteSlide = useCallback((index: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== index));
    if (activeSlideIndex >= index && activeSlideIndex > 0) setActiveSlideIndex(prev => prev - 1);
  }, [slides.length, activeSlideIndex]);

  const addElement = useCallback((type: 'text' | 'rect' | 'circle') => {
    const el: SlideElement = {
      id: generateId(),
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: type === 'text' ? 300 : 120,
      height: type === 'text' ? 50 : 120,
      content: type === 'text' ? 'New Text' : '',
      color: type === 'rect' ? '#3b82f6' : type === 'circle' ? '#ef4444' : '#ffffff',
    };
    setSlides(prev => prev.map((s, i) => i === activeSlideIndex ? { ...s, elements: [...s.elements, el] } : s));
  }, [activeSlideIndex]);

  const updateElement = useCallback((elId: string, updates: Partial<SlideElement>) => {
    setSlides(prev => prev.map((s, i) => i === activeSlideIndex ? {
      ...s,
      elements: s.elements.map(e => e.id === elId ? { ...e, ...updates } : e)
    } : s));
  }, [activeSlideIndex]);

  const deleteElement = useCallback((elId: string) => {
    setSlides(prev => prev.map((s, i) => i === activeSlideIndex ? {
      ...s,
      elements: s.elements.filter(e => e.id !== elId)
    } : s));
  }, [activeSlideIndex]);

  const moveSlide = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(slides.length - 1, index + 1);
    if (newIndex === index) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    setSlides(newSlides);
    setActiveSlideIndex(newIndex);
  }, [slides]);

  if (!paid) {
    return (
      <div className="h-full w-full bg-zinc-900 text-white flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-orange-500/20 flex items-center justify-center">
          <img src="/icons/keynote.png" alt="Keynote" className="w-14 h-14 object-contain" />
        </div>
        <h2 className="text-2xl font-bold">Keynote</h2>
        <p className="text-white/50 text-sm">Build stunning presentations.</p>
        <button onClick={() => { localStorage.setItem(STORAGE_KEY, 'true'); setPaid(true); }} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl font-medium text-sm transition">
          Continue
        </button>
      </div>
    );
  }

  if (presentMode) {
    return (
      <div className="h-full w-full bg-black flex flex-col" onClick={() => setPresentMode(false)}>
        <div className="absolute top-4 left-4 z-20">
          <button onClick={() => setPresentMode(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition flex items-center gap-2">
            <ArrowLeft01Icon size={16} /> Exit Present
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-full h-full max-w-5xl max-h-[80vh] rounded-2xl border border-white/10 relative overflow-hidden" style={{ backgroundColor: activeSlide?.backgroundColor || '#1a1a2e' }}>
            {activeSlide?.elements.map(el => (
              el.type === 'text' ? (
                <div key={el.id} className="absolute font-bold" style={{ left: el.x, top: el.y, width: el.width, color: el.color, fontSize: '24px' }}>
                  {el.content}
                </div>
              ) : el.type === 'rect' ? (
                <div key={el.id} className="absolute rounded-lg border-2" style={{ left: el.x, top: el.y, width: el.width, height: el.height, backgroundColor: el.color, borderColor: el.color }} />
              ) : (
                <div key={el.id} className="absolute rounded-full border-2" style={{ left: el.x, top: el.y, width: el.width, height: el.height, backgroundColor: el.color, borderColor: el.color }} />
              )
            ))}
          </div>
        </div>
        <div className="text-center pb-4 text-white/40 text-sm">Click anywhere to exit presentation</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <button onClick={() => addElement('text')} className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition"><TextIcon size={14} /> Text</button>
          <button onClick={() => addElement('rect')} className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition"><Square01Icon size={14} /> Shape</button>
          <button onClick={() => addElement('circle')} className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition"><CircleIcon size={14} /> Circle</button>
        </div>
        <button onClick={() => setPresentMode(true)} className="flex items-center gap-2 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-xs font-medium transition">
          <PresentationLineChart01Icon size={14} /> Present
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-36 bg-zinc-800/30 border-r border-white/10 flex flex-col overflow-y-auto p-2">
          <button onClick={addSlide} className="flex items-center justify-center p-2 hover:bg-white/10 rounded-lg mb-2 transition">
            <PlusSignIcon size={16} />
          </button>
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              onClick={() => setActiveSlideIndex(i)}
              className={`relative group mb-2 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${i === activeSlideIndex ? 'border-blue-500' : 'border-white/10 hover:border-white/30'}`}
              style={{ aspectRatio: '16/10', backgroundColor: slide.backgroundColor }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {slide.elements.slice(0, 2).map(el => (
                  el.type === 'text' ? (
                    <div key={el.id} className="text-[6px] font-bold truncate px-1" style={{ color: el.color }}>{el.content}</div>
                  ) : (
                    <div key={el.id} className="rounded-sm" style={{ width: 12, height: 12, backgroundColor: el.color }} />
                  )
                ))}
              </div>
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                <button onClick={(e) => { e.stopPropagation(); moveSlide(i, 'up'); }} className="p-0.5 bg-black/50 rounded text-[8px] hover:bg-black/80">▲</button>
                <button onClick={(e) => { e.stopPropagation(); moveSlide(i, 'down'); }} className="p-0.5 bg-black/50 rounded text-[8px] hover:bg-black/80">▼</button>
                <button onClick={(e) => { e.stopPropagation(); deleteSlide(i); }} className="p-0.5 bg-red-500/50 rounded text-[8px] hover:bg-red-500"><Delete02Icon size={8} /></button>
              </div>
              <div className="absolute bottom-1 left-1 text-[8px] text-white/40">{i + 1}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 flex items-center justify-center bg-zinc-800/20 overflow-hidden">
          <div className="w-[90%] h-[85%] rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl" style={{ backgroundColor: activeSlide?.backgroundColor || '#1a1a2e' }}>
            {activeSlide?.elements.map(el => (
              <div
                key={el.id}
                className="absolute group cursor-move"
                style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
              >
                {el.type === 'text' ? (
                  editingElement === el.id ? (
                    <textarea
                      autoFocus
                      value={editText}
                      onChange={(e) => {
                        setEditText(e.target.value);
                        updateElement(el.id, { content: e.target.value });
                      }}
                      onBlur={() => setEditingElement(null)}
                      onKeyDown={(e) => { if (e.key === 'Escape') setEditingElement(null); }}
                      className="w-full h-full bg-transparent outline-none resize-none font-bold"
                      style={{ color: el.color, fontSize: '20px' }}
                    />
                  ) : (
                    <div
                      onDoubleClick={() => { setEditingElement(el.id); setEditText(el.content); }}
                      className="w-full h-full font-bold cursor-text overflow-hidden"
                      style={{ color: el.color, fontSize: '20px' }}
                    >
                      {el.content}
                    </div>
                  )
                ) : el.type === 'rect' ? (
                  <div className="w-full h-full rounded-lg border-2" style={{ backgroundColor: el.color, borderColor: el.color }} />
                ) : (
                  <div className="w-full h-full rounded-full border-2" style={{ backgroundColor: el.color, borderColor: el.color }} />
                )}
                <button
                  onClick={() => deleteElement(el.id)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                >
                  <Delete02Icon size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
