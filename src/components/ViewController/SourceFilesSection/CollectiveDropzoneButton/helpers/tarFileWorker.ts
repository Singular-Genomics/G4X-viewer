import { extract } from 'it-tar';
import { pipe } from 'it-pipe';

onmessage = async (e) => {
  const file = e.data;
  const extractedFiles: File[] = [];
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
        const sourcePath = entry.header.name;
        const entryFileName = sourcePath.split('/').pop();
        if (!entryFileName || entryFileName.startsWith('.')) continue;

        const chunks = [];
        for await (const chunk of entry.body) {
          chunks.push(chunk);
        }
        const blob = new Blob(chunks, { type: 'application/octet-stream' });
        extractedFiles.push(new File([blob], sourcePath));
      }
      postMessage({ success: true, files: extractedFiles, completed: true });
    });

    postMessage({ success: true, files: extractedFiles });
  } catch (error) {
    postMessage({ success: false, error: error });
  }
};
