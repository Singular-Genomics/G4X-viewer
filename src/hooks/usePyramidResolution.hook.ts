import { useChannelsStore } from '../stores/ChannelsStore';
import { useViewerStore } from '../stores/ViewerStore';

// Same level Viv fetches: -ceil(zoom) clamped to the pyramid (0 = full resolution)
export const getPyramidResolution = (zoom: number | undefined, levels: number) => {
  if (typeof zoom !== 'number' || !Number.isFinite(zoom) || levels < 1) {
    return 0;
  }
  return Math.min(Math.max(-Math.ceil(zoom), 0), levels - 1);
};

export const usePyramidResolution = () => {
  const levels = useChannelsStore((store) => store.getLoader().length);
  return useViewerStore((store) => getPyramidResolution(store.viewState?.zoom, levels));
};
