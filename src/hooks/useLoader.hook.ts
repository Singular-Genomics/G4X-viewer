import { useShallow } from "zustand/react/shallow"
import { useChannelsStore } from "../stores/ChannelsStore/ChannelsStore"

export const useLoader = () => {
  const [loader, image] = useChannelsStore(
    useShallow((store) => ([store.loader, store.image]))
  );
  return Array.isArray(loader[0]) ? loader[image] : loader;
}