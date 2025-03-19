import { useEffect, useState } from "react";
import { useHEImageStore } from "../stores/HEImageStore";
import { ViewerSourceType } from "../stores/ViewerStore";
import { buildDefaultSelection, createLoader } from "../legacy/utils";
import { unstable_batchedUpdates } from "react-dom";
import { isInterleaved } from "@hms-dbmi/viv";

export const useHEImage = (source: ViewerSourceType | null) => {
  const [isLoaderCreated, setIsLoaderCreated] = useState(false);
  const loader = useHEImageStore.getState().getLoader();

  useEffect(() => {
    async function changeLoader() {
      if (!source) return null;

      useHEImageStore.setState({ isImageLoading: true });

      const { urlOrFile } = source;

      // --------------------- LEGACY LOADER ----------------------
      const newLoader = await createLoader(
        urlOrFile,
        () => {},
        () => {}
      );
      // ----------------------------------------------------------
      let nextLoader: any;

      if (Array.isArray(newLoader)) {
        if (newLoader.length > 1) {
          nextLoader = newLoader.map((l) => l.data);
        } else {
          nextLoader = newLoader[0].data;
        }
      } else {
        nextLoader = newLoader.data;
      }
      if (nextLoader) {
        unstable_batchedUpdates(() => {
          useHEImageStore.setState({ loader: nextLoader });
        });
        setIsLoaderCreated(true);
      }
    }
    if (source) changeLoader();
  }, [source, history]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!source || !isLoaderCreated) return;

    useHEImageStore.setState({ isImageLoading: true });
    const newSelections = buildDefaultSelection(loader[0]);

    let newContrastLimits = [];
    if (isInterleaved(loader[0].shape)) {
      newContrastLimits = [[0, 255]];
    } else {
      newContrastLimits = [
        [0, 255],
        [0, 255],
        [0, 255],
      ];
    }

    useHEImageStore.setState({
      selections: newSelections,
      contrastLimits: newContrastLimits,
      isImageLoading: false,
    });
  }, [loader, source, isLoaderCreated]); // eslint-disable-line react-hooks/exhaustive-deps
};
