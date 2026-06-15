import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSystem } from '../../contexts/SystemContext';
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  PlusSignIcon,
  Delete02Icon,
} from 'hugeicons-react';

interface PageDocument {
  id: string;
  name: string;
  content: string;
  updatedAt: number;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

const STORAGE_KEY = 'golden_gate_pages_unlocked';

export const Pages: React.FC = () => {
  const { showConfirm } = useSystem();
  const [documents, setDocuments] = useState<PageDocument[]>(() => {
    try {
      const saved = localStorage.getItem('golden_gate_pages_docs');
      return saved ? JSON.parse(saved) : [{ id: generateId(), name: 'Untitled', content: '', updatedAt: Date.now() }];
    } catch {
      return [{ id: generateId(), name: 'Untitled', content: '', updatedAt: Date.now() }];
    }
  });
  const [activeDocId, setActiveDocId] = useState<string>(documents[0]?.id || '');
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: '16',
    alignment: 'left',
  });
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const [paid, setPaid] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  const activeDoc = documents.find((d) => d.id === activeDocId);

  useEffect(() => {
    localStorage.setItem('golden_gate_pages_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    if (editorRef.current && activeDoc) {
      editorRef.current.innerHTML = activeDoc.content;
    }
  }, [activeDocId]);

  const updateContent = useCallback(() => {
    if (!editorRef.current || !activeDoc) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText || '';
    setWordCount(text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length);
    setDocuments((prev) =>
      prev.map((d) => (d.id === activeDoc.id ? { ...d, content: html, updatedAt: Date.now() } : d)),
    );
  }, [activeDoc]);

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    updateContent();
  };

  const createDoc = async () => {
    const name = `Document ${documents.length + 1}`;
    const newDoc: PageDocument = { id: generateId(), name, content: '', updatedAt: Date.now() };
    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
  };

  const deleteDoc = async (id: string) => {
    if (documents.length <= 1) return;
    const confirmed = await showConfirm('Delete this document?', 'Delete Document');
    if (!confirmed) return;
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDocId === id) setActiveDocId(documents.find((d) => d.id !== id)?.id || '');
  };

  const renameDoc = (id: string, name: string) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));
  };

  if (!paid) {
    return (
      <div className="h-full w-full bg-zinc-900 text-white flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/20 flex items-center justify-center">
          <img src="/icons/pages.png" alt="Pages" className="w-14 h-14 object-contain" />
        </div>
        <h2 className="text-2xl font-bold">Pages</h2>
        <p className="text-white/50 text-sm">Create beautiful documents.</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, 'true');
              setPaid(true);
            }}
            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium text-sm transition"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-900 text-white flex flex-col overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10 bg-zinc-800/50">
        <select
          value={formatting.fontSize}
          onChange={(e) => {
            setFormatting((prev) => ({ ...prev, fontSize: e.target.value }));
            execCmd('fontSize', e.target.value);
          }}
          className="bg-white/10 border border-white/10 rounded-md px-2 py-1 text-xs cursor-pointer"
        >
          {['12', '14', '16', '18', '20', '24', '28', '36', '48'].map((s) => (
            <option key={s} value={s}>
              {s}px
            </option>
          ))}
        </select>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button
          onClick={() => {
            setFormatting((prev) => ({ ...prev, bold: !prev.bold }));
            execCmd('bold');
          }}
          className={`p-1.5 rounded-md transition ${formatting.bold ? 'bg-blue-500 text-white' : 'hover:bg-white/10'}`}
        >
          <TextBoldIcon size={16} />
        </button>
        <button
          onClick={() => {
            setFormatting((prev) => ({ ...prev, italic: !prev.italic }));
            execCmd('italic');
          }}
          className={`p-1.5 rounded-md transition ${formatting.italic ? 'bg-blue-500 text-white' : 'hover:bg-white/10'}`}
        >
          <TextItalicIcon size={16} />
        </button>
        <button
          onClick={() => {
            setFormatting((prev) => ({ ...prev, underline: !prev.underline }));
            execCmd('underline');
          }}
          className={`p-1.5 rounded-md transition ${formatting.underline ? 'bg-blue-500 text-white' : 'hover:bg-white/10'}`}
        >
          <TextUnderlineIcon size={16} />
        </button>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button onClick={() => execCmd('justifyLeft')} className="p-1.5 rounded-md hover:bg-white/10">
          <TextAlignLeftIcon size={16} />
        </button>
        <button onClick={() => execCmd('justifyCenter')} className="p-1.5 rounded-md hover:bg-white/10">
          <TextAlignCenterIcon size={16} />
        </button>
        <button onClick={() => execCmd('justifyRight')} className="p-1.5 rounded-md hover:bg-white/10">
          <TextAlignRightIcon size={16} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 bg-zinc-800/30 border-r border-white/10 flex flex-col overflow-y-auto p-2">
          <button
            onClick={createDoc}
            className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg mb-2 transition text-sm"
          >
            <PlusSignIcon size={16} /> New Document
          </button>
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveDocId(doc.id)}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${doc.id === activeDocId ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-white/10'}`}
            >
              <input
                value={doc.name}
                onChange={(e) => renameDoc(doc.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent text-sm w-32 outline-none"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteDoc(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition"
              >
                <Delete02Icon size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={updateContent}
            className="flex-1 p-8 outline-none overflow-y-auto text-[16px] leading-relaxed"
            style={{ fontSize: `${formatting.fontSize}px` }}
          />
          <div className="px-4 py-1.5 border-t border-white/10 text-xs text-white/40 flex items-center justify-between">
            <span>{wordCount} words</span>
            <span>{activeDoc?.updatedAt ? new Date(activeDoc.updatedAt).toLocaleString() : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
