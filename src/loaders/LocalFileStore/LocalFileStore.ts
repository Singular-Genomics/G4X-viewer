import { KeyError } from 'zarr';

type ValidStoreType = ArrayBuffer;

/**
 * A read-only zarr.js AsyncStore backed by a Map<string, File>.
 * Used as a fallback when FileSystemDirectoryHandle is not available
 * (e.g. non-secure contexts). Files are keyed by their relative path
 * within the directory.
 */
export class LocalFileMapStore {
  private fileMap: Map<string, File>;

  constructor(fileMap: Map<string, File>) {
    this.fileMap = fileMap;
  }

  async getItem(key: string): Promise<ValidStoreType> {
    const normalizedKey = key.split('/').filter(Boolean).join('/');
    const file = this.fileMap.get(normalizedKey);
    if (!file) {
      throw new KeyError(key);
    }
    return await file.arrayBuffer();
  }

  async containsItem(key: string): Promise<boolean> {
    const normalizedKey = key.split('/').filter(Boolean).join('/');
    return this.fileMap.has(normalizedKey);
  }

  async setItem(): Promise<boolean> {
    throw new Error('LocalFileMapStore is read-only');
  }

  async deleteItem(): Promise<boolean> {
    throw new Error('LocalFileMapStore is read-only');
  }

  async keys(): Promise<string[]> {
    return Array.from(this.fileMap.keys());
  }
}

/**
 * A read-only zarr.js AsyncStore that reads from a FileSystemDirectoryHandle.
 * Navigates subdirectories by splitting keys on '/' and reads the final
 * file as an ArrayBuffer.
 */
export class LocalFileStore {
  private rootHandle: FileSystemDirectoryHandle;

  constructor(rootHandle: FileSystemDirectoryHandle) {
    this.rootHandle = rootHandle;
  }

  async getItem(key: string): Promise<ValidStoreType> {
    try {
      const parts = key.split('/').filter(Boolean);
      let dirHandle: FileSystemDirectoryHandle = this.rootHandle;

      for (const part of parts.slice(0, -1)) {
        dirHandle = await dirHandle.getDirectoryHandle(part);
      }

      const fileName = parts[parts.length - 1];
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return await file.arrayBuffer();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'NotFoundError') {
        throw new KeyError(key);
      }
      if (e instanceof TypeError) {
        throw new KeyError(key);
      }
      throw e;
    }
  }

  async containsItem(key: string): Promise<boolean> {
    try {
      await this.getItem(key);
      return true;
    } catch (e) {
      if (e instanceof KeyError) {
        return false;
      }
      throw e;
    }
  }

  async setItem(): Promise<boolean> {
    throw new Error('LocalFileStore is read-only');
  }

  async deleteItem(): Promise<boolean> {
    throw new Error('LocalFileStore is read-only');
  }

  async keys(): Promise<string[]> {
    return [];
  }
}
