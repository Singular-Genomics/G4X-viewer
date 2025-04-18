import { ImageLayer, MultiscaleImageLayer } from '@vivjs/layers';

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
        reject('No result available from file read.');
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

export function getImageLayer(id: string, props: any) {
  const { loader } = props;
  // Grab name of PixelSource if a class instance (works for Tiff & Zarr).
  const sourceName = loader[0]?.constructor?.name;

  // Create at least one layer even without selections so that the tests pass.
  const Layer = loader.length > 1 ? MultiscaleImageLayer : ImageLayer;
  const layerLoader = loader.length > 1 ? loader : loader[0];

  return new Layer({
    ...props,
    id: `${sourceName}${getVivId(id)}`,
    viewportId: id,
    loader: layerLoader
  });
}
