import { ZARR_SUBPATHS } from '../../utils/ZarrPaths';

type ValidStoreType = ArrayBuffer;

type InnerStore = {
  getItem(key: string): Promise<ValidStoreType>;
  setItem(key: string, value: ValidStoreType): Promise<boolean>;
  deleteItem(key: string): Promise<boolean>;
  containsItem(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
};

/**
 * Wraps any zarr-compatible store with an LRU cache (Map with size limit).
 * Prevents redundant disk reads when panning back over viewed regions.
 */
export class LRUCacheStore {
  readonly __localZarrStore = true;
  readonly __localZarrPath: string;
  private inner: InnerStore;
  private cache: Map<string, ValidStoreType>;
  private maxSize: number;

  constructor(inner: InnerStore, maxSize = 100, path: string = ZARR_SUBPATHS.images.multiplex()) {
    this.inner = inner;
    this.cache = new Map();
    this.maxSize = maxSize;
    this.__localZarrPath = path;
  }

  async getItem(key: string): Promise<ValidStoreType> {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }

    const value = await this.inner.getItem(key);
    this.cache.set(key, value);

    if (this.cache.size > this.maxSize) {
      // Evict oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    return value;
  }

  async containsItem(key: string): Promise<boolean> {
    return this.inner.containsItem(key);
  }

  async setItem(key: string, value: ValidStoreType): Promise<boolean> {
    return this.inner.setItem(key, value);
  }

  async deleteItem(key: string): Promise<boolean> {
    return this.inner.deleteItem(key);
  }

  async keys(): Promise<string[]> {
    return this.inner.keys();
  }
}
