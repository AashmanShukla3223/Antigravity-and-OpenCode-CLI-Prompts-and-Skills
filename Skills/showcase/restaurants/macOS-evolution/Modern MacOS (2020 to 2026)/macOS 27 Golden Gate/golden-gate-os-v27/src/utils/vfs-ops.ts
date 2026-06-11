import React from 'react';
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
      let loaded = 0;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          try {
            createNode({
              name: file.name,
              type: 'file',
              parentId,
              content: dataUrl,
              size: file.size,
            });
          } catch (e) {
            console.warn('Failed to import file:', file.name, e);
          }
          loaded++;
          if (loaded === files.length) cleanup(input);
        };
        reader.onerror = () => { loaded++; if (loaded === files.length) cleanup(input); };
        reader.readAsDataURL(file);
      });
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
}: {
  createNode: (node: Omit<FileSystemNode, 'id' | 'modifiedAt'>) => void;
  parentId?: string;
  className?: string;
  accept?: string;
}) {
  const importFile = useImportFile(createNode, parentId, accept);
  return React.createElement(
    'button',
    {
      onClick: importFile,
      className: `px-3 py-1.5 rounded text-xs transition ${className || 'bg-[#3c3c3c] hover:bg-[#4a4a4a] text-gray-300 hover:text-white'}`,
      title: 'Import files to VFS',
    },
    '📂 Import'
  );
}
