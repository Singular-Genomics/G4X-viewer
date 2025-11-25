import { extract } from 'it-tar';
import { pipe } from 'it-pipe';

onmessage = async (e) => {
  const file = e.data;
  const entries: File[] = [];
  const fileSize = file.size;
  let processedBytes = 0;

  const source = (async function* () {
    const reader = file.stream().getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          processedBytes += value.length;
          postMessage({
            progress: Math.round((processedBytes / fileSize) * 100)
          });
        }
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  })();

  try {
    await pipe(source, extract(), async function (source) {
      for await (const entry of source) {
        const chunks: Uint8Array[] = [];
        for await (const chunk of entry.body) {
          chunks.push(chunk);
        }
        const blob = new Blob(chunks as BlobPart[], { type: 'application/octet-stream' });
        entries.push(new File([blob], entry.header.name));
      }
      postMessage({ success: true, files: entries, completed: true });
    });

    postMessage({ success: true, files: entries });
  } catch (error) {
    postMessage({ success: false, error: error });
  }
};
