import { createLoader } from '../legacy/utils';
import { ViewerSourceType } from '../stores/ViewerStore';

type LoadOverlayImageResult = {
  loader: any;
  metadata: any;
};

export const loadOverlayImage = async (source: ViewerSourceType): Promise<LoadOverlayImageResult> => {
  const newLoader = await createLoader(
    source.urlOrFile,
    () => {},
    () => {}
  );

  if (Array.isArray(newLoader)) {
    if (newLoader.length > 1) {
      return {
        loader: newLoader.map((l) => l.data),
        metadata: newLoader.map((l) => l.metadata)
      };
    }
    return { loader: newLoader[0].data, metadata: newLoader[0].metadata };
  }

  return { loader: newLoader.data, metadata: newLoader.metadata };
};
