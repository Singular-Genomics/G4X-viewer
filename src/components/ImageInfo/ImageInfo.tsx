import { useViewerStore } from '../../stores/ViewerStore';
import { useChannelsStore } from '../../stores/ChannelsStore';
import { MobileChannelLegend } from '../MobileChannelLegend';
import { useShallow } from 'zustand/react/shallow';

export const ImageInfo = () => {
  const pyramidResolution = useViewerStore(useShallow((store) => store.pyramidResolution));

  const getLoader = useChannelsStore((store) => store.getLoader);
  const loader = getLoader();
  const level = loader[pyramidResolution];

  return (
    <>
      {level && (
        <>
          <MobileChannelLegend />
        </>
      )}
    </>
  );
};
