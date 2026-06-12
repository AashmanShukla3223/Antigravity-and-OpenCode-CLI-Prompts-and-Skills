import React, { useCallback } from 'react';
import type { FileSystemNode } from '../contexts/FileSystemContext';

export function downloadBlob(content: string, filename: string, mimeType: string = 'application/octet-stream') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadDataURL(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function readFilesAndStore(
  files: File[],
  createNode: (node: Omit<FileSystemNode, 'id' | 'modifiedAt'>) => void,
  parentId: string,
  onEachFile?: (file: File, dataUrl: string) => void,
) {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        createNode({ name: file.name, type: 'file', parentId, content: dataUrl, size: file.size });
        onEachFile?.(file, dataUrl);
      } catch (e) {
        console.warn('Failed to import file:', file.name, e);
      }
    };
    reader.onerror = () => console.warn('Failed to read file:', file.name);
    reader.readAsDataURL(file);
  });
}

export function useImportFile(
  createNode: (node: Omit<FileSystemNode, 'id' | 'modifiedAt'>) => void,
  parentId: string = 'documents',
  accept: string = '*/*'
) {
  return () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = accept;
    input.style.display = 'none';
    document.body.appendChild(input);
    input.onchange = () => {
      const files = Array.from(input.files || []);
      if (files.length === 0) { cleanup(input); return; }
      readFilesAndStore(files, createNode, parentId);
      cleanup(input);
    };
    input.click();
  };
}

function cleanup(input: HTMLInputElement) {
  try { if (input.parentNode) document.body.removeChild(input); } catch {/* ignore */}
}

export function saveToVFS(
  createNode: (node: Omit<FileSystemNode, 'id' | 'modifiedAt'>) => void,
  content: string,
  name: string,
  parentId: string = 'documents'
) {
  createNode({
    name,
    type: 'file',
    parentId,
    content,
    size: content.length,
  });
}

export function ImportFileButton({
  createNode,
  parentId = 'documents',
  className = '',
  accept = '*/*',
  onImport,
}: {
  createNode: (node: Omit<FileSystemNode, 'id' | 'modifiedAt'>) => void;
  parentId?: string;
  className?: string;
  accept?: string;
  onImport?: (file: File, dataUrl: string) => void;
}) {
  return React.createElement(
    'button',
    {
      onClick: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = accept;
        input.style.display = 'none';
        document.body.appendChild(input);
        input.onchange = () => {
          const files = Array.from(input.files || []);
          if (files.length === 0) { try { document.body.removeChild(input); } catch {} return; }
          readFilesAndStore(files, createNode, parentId, onImport);
          try { document.body.removeChild(input); } catch {}
        };
        input.click();
      },
      className: `px-3 py-1.5 rounded text-xs transition ${className || 'bg-[#3c3c3c] hover:bg-[#4a4a4a] text-gray-300 hover:text-white'}`,
      title: 'Import files to VFS',
    },
    '📂 Import'
  );
}

export function useFileDrop(
  createNode: (node: Omit<FileSystemNode, 'id' | 'modifiedAt'>) => void,
  parentId: string,
  accept: string,
  onEachFile?: (file: File, dataUrl: string) => void,
) {
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return accept.split(',').some(a => ext === a.trim().toLowerCase());
    });
    if (files.length === 0) return;
    readFilesAndStore(files, createNode, parentId, onEachFile);
  }, [createNode, parentId, accept, onEachFile]);

  return { onDragOver, onDrop };
}
