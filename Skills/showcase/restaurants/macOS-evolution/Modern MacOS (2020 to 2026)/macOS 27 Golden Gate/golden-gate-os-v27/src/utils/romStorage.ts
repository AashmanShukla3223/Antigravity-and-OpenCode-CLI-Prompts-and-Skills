const DB_NAME = 'golden_gate_roms';
const DB_VERSION = 1;
const STORE_NAME = 'roms';

export interface StoredROM {
  key: string;
  name: string;
  system: string;
  data: ArrayBuffer;
  size: number;
  uploadedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const MAX_ROM_SIZE = 2 * 1024 * 1024 * 1024;

export async function saveROM(file: File, system: string): Promise<StoredROM> {
  if (file.size > MAX_ROM_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024 / 1024).toFixed(1)}GB). Maximum is 2GB.`);
  }
  const db = await openDB();
  const data = await file.arrayBuffer();
  const rom: StoredROM = {
    key: `rom_${system}`,
    name: file.name,
    system,
    data,
    size: file.size,
    uploadedAt: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(rom);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => resolve(rom);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getROM(key: string): Promise<StoredROM | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result ?? undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteROM(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listROMs(): Promise<StoredROM[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
