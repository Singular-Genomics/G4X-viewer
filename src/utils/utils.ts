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

export const POLYGON_COLORS: [number, number, number][] = [
  [99, 255, 132], // Green
  [54, 162, 235], // Blue
  [255, 99, 132], // Red
  [153, 102, 255], // Purple
  [255, 206, 86], // Yellow
  [0, 255, 255], // Cyan
  [255, 159, 64], // Orange
  [255, 99, 255], // Magenta
  [124, 252, 0], // Lawn Green
  [75, 192, 192], // Teal
  [255, 20, 147], // Deep Pink
  [132, 99, 255], // Violet
  [255, 165, 0], // Orange Alt
  [255, 192, 203], // Pink
  [255, 69, 0] // Red Orange
];

export const generatePolygonColor = (index: number): [number, number, number] => {
  // Use modulo to cycle through colors if we have more polygons than predefined colors
  return POLYGON_COLORS[index % POLYGON_COLORS.length];
};
