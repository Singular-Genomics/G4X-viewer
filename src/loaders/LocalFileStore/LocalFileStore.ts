import { KeyError } from 'zarr';

type ValidStoreType = ArrayBuffer;

/**
 * A read-only zarr.js AsyncStore that reads from a FileSystemDirectoryHandle.
 * Navigates subdirectories by splitting keys on '/' and reads the final
 * file as an ArrayBuffer.
 */
export class LocalFileStore {
  private rootHandle: FileSystemDirectoryHandle;
  private overrides: Record<string, FileSystemDirectoryHandle>;

  constructor(rootHandle: FileSystemDirectoryHandle, overrides: Record<string, FileSystemDirectoryHandle> = {}) {
    this.rootHandle = rootHandle;
    this.overrides = overrides;
  }

  async getItem(key: string): Promise<ValidStoreType> {
    try {
      const parts = key.split('/').filter(Boolean);
      let dirHandle: FileSystemDirectoryHandle = this.rootHandle;
      let startIndex = 0;

      const override = parts.length > 0 ? this.overrides[parts[0]] : undefined;
      if (override) {
        dirHandle = override;
        startIndex = 1;
      }

      for (const part of parts.slice(startIndex, -1)) {
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
