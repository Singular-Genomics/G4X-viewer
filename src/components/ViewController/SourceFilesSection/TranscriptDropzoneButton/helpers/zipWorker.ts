import JSZip from 'jszip';

onmessage = async function (e) {
  const file = e.data;
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  let processedFiles = 0;

  const promises = [];
  const totalFiles = Object.keys(contents.files).length;

  for (const [relativePath, zipEntry] of Object.entries(contents.files)) {
    if (!zipEntry.dir) {
      const promise = zipEntry.async('blob').then((blob) => {
        processedFiles++;
        postMessage({
          progress: Math.round((processedFiles / totalFiles) * 100)
        });
        return new File([blob], relativePath, { type: blob.type });
      });
      promises.push(promise);
    }
  }

  const files = await Promise.all(promises);
  postMessage({ files, completed: true });
};
