/**
 * A zarrita-compatible read-only store backed by a Map<string, File>.
 * Implements the zarrita AsyncReadable interface:
 *   get(key: `/${string}`) → Promise<Uint8Array | undefined>
 *
 * Used to plug into zarrita's `open()` in place of `FetchStore`
 * for local directory loading.
 */
export class LocalFileMapZarritaStore {
  private fileMap: Map<string, File>;
  private basePath: string;

  constructor(fileMap: Map<string, File>, basePath = '') {
    this.fileMap = fileMap;
    this.basePath = basePath;
  }

  async get(key: string): Promise<Uint8Array | undefined> {
    // zarrita keys are absolute paths like "/cells/metadata/.zarray"
    // Strip leading slash and prepend basePath
    const relativePath = key.replace(/^\/+/, '');
    const fullPath = this.basePath ? `${this.basePath}/${relativePath}` : relativePath;
    const file = this.fileMap.get(fullPath);
    if (!file) {
      return undefined;
    }
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
  }
}
