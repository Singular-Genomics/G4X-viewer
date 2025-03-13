export const getVivId = (id: string) => {
  return `-#${id}#`;
};

export const parseJsonFromFile = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result;
      if (result) {
        resolve(JSON.parse(result as string));
      } else {
        reject("No result available from file read.");
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
