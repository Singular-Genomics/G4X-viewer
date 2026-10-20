// Directory handles resolved so far, per root handle: "a/b/c" -> Promise<handle for a/b/c>.
// Sharing across store instances (the store factory creates one per subpath) means each directory is walked once
// instead of once per file read (~30 getDirectoryHandle calls per transcript tile before).
const dirHandleCaches = new WeakMap<FileSystemDirectoryHandle, Map<string, Promise<FileSystemDirectoryHandle>>>();

function resolveDirectory(root: FileSystemDirectoryHandle, parts: string[]): Promise<FileSystemDirectoryHandle> {
  let cache = dirHandleCaches.get(root);
  if (!cache) {
    cache = new Map();
    dirHandleCaches.set(root, cache);
  }
  let current: Promise<FileSystemDirectoryHandle> = Promise.resolve(root);
  let path = '';
  for (const part of parts) {
    path = path ? `${path}/${part}` : part;
    let next = cache.get(path);
    if (!next) {
      const parent = current;
      next = parent.then((dir) => dir.getDirectoryHandle(part));
      cache.set(path, next);
    }
    current = next;
  }
  return current;
}

/**
 * A zarrita-compatible read-only store backed by a FileSystemDirectoryHandle.
 * Implements the zarrita AsyncReadable interface:
 *   get(key: `/${string}`) → Promise<Uint8Array | undefined>
 *
 * Navigates subdirectories via handle to read files on demand (directory handles are cached).
 *
 * `overrides` maps a first path segment to a separately granted handle, for
 * symlinked directories the File System Access API cannot traverse.
 */
export class LocalFileHandleZarritaStore {
  constructor(
    private handle: FileSystemDirectoryHandle,
    private basePath = '',
    private overrides: Record<string, FileSystemDirectoryHandle> = {}
  ) {}

  async get(key: string): Promise<Uint8Array | undefined> {
    const relativePath = key.replace(/^\/+/, '');
    const fullPath = this.basePath ? `${this.basePath}/${relativePath}` : relativePath;
    const parts = fullPath.split('/').filter(Boolean);
    try {
      let root = this.handle;
      let startIndex = 0;

      const override = this.overrides[parts[0]];
      if (override) {
        root = override;
        startIndex = 1;
      }

      const dir = await resolveDirectory(root, parts.slice(startIndex, -1));
      const fileHandle = await dir.getFileHandle(parts[parts.length - 1]);
      const file = await fileHandle.getFile();
      return new Uint8Array(await file.arrayBuffer());
    } catch {
      return undefined;
    }
  }
}
