/**
 * A zarrita-compatible read-only store backed by a FileSystemDirectoryHandle.
 * Implements the zarrita AsyncReadable interface:
 *   get(key: `/${string}`) → Promise<Uint8Array | undefined>
 *
 * Navigates subdirectories via handle to read files on demand.
 */
export class LocalFileHandleZarritaStore {
  constructor(
    private handle: FileSystemDirectoryHandle,
    private basePath = ''
  ) {}

  async get(key: string): Promise<Uint8Array | undefined> {
    const relativePath = key.replace(/^\/+/, '');
    const fullPath = this.basePath ? `${this.basePath}/${relativePath}` : relativePath;
    const parts = fullPath.split('/').filter(Boolean);
    try {
      let dir = this.handle;
      for (const part of parts.slice(0, -1)) {
        dir = await dir.getDirectoryHandle(part);
      }
      const fileHandle = await dir.getFileHandle(parts[parts.length - 1]);
      const file = await fileHandle.getFile();
      return new Uint8Array(await file.arrayBuffer());
    } catch {
      return undefined;
    }
  }
}
