import { useChannelsStore } from "../stores/ChannelsStore/ChannelsStore"
import { useViewerStore } from "../stores/ViewerStore/ViewerStore";

export const useMetadata = () => {
  const image = useChannelsStore((store) => store.image);
  const metadata = useViewerStore((store) => store.metadata);
  return Array.isArray(metadata) ? metadata[image] : metadata;
}