interface Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
}

declare module 'zarr' {
  export class KeyError extends Error {
    constructor(key: string);
  }

  export interface Attributes {
    asObject(): Promise<Record<string, unknown>>;
  }

  export interface Group {
    store: unknown;
    path: string;
    attrs: Attributes;
  }

  export interface ZarrArray {
    shape: number[];
    chunks: number[];
    dtype: string;
    getRaw(selection?: unknown): Promise<unknown>;
  }

  export function openGroup(
    store: unknown,
    path?: string | null,
    mode?: string,
    chunkStore?: unknown,
    cacheAttrs?: boolean
  ): Promise<Group>;

  export function openArray(options?: {
    store?: unknown;
    path?: string | null;
    mode?: string;
    chunks?: unknown;
    dtype?: string;
    shape?: number | number[];
  }): Promise<ZarrArray>;
}
