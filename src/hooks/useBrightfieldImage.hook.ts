import { useEffect, useState } from 'react';
import { useViewerStore, VIEWER_LOADING_TYPES, ViewerSourceType } from '../stores/ViewerStore';
import { buildDefaultSelection, createLoader } from '../legacy/utils';
import { unstable_batchedUpdates } from 'react-dom';
import { isInterleaved } from '@hms-dbmi/viv';
import { useBrightfieldImagesStore } from '../stores/BrightfieldImagesStore';
import { useTranslation } from 'react-i18next';

export const useBrightfieldImage = (source: ViewerSourceType | null) => {
  const { t } = useTranslation();
  const [isLoaderCreated, setIsLoaderCreated] = useState(false);
  const loader = useBrightfieldImagesStore.getState().getLoader();

  useEffect(() => {
    // Reset state when source changes
    setIsLoaderCreated(false);

    async function changeLoader() {
      if (!source) return null;

      useViewerStore.setState({
        isViewerLoading: {
          type: VIEWER_LOADING_TYPES.BRIGHTFIELD_IMAGE,
          message: t('viewer.loadingBrightfieldImage')
        }
      });

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
          useBrightfieldImagesStore.setState({ loader: nextLoader });
        });
        setIsLoaderCreated(true);
      }
    }

    if (source) {
      changeLoader();
    } else {
      // Reset loader state when source is null
      useBrightfieldImagesStore.setState({
        loader: [{ labels: [], shape: [] }]
      });
      useViewerStore.setState({
        isViewerLoading: undefined
      });
    }
  }, [source, t]);

  useEffect(() => {
    if (!source || !isLoaderCreated) return;

    useViewerStore.setState({
      isViewerLoading: {
        type: VIEWER_LOADING_TYPES.BRIGHTFIELD_IMAGE,
        message: t('viewer.loadingBrightfieldImage')
      }
    });
    const newSelections = buildDefaultSelection(loader[0]);

    let newContrastLimits = [];
    if (isInterleaved(loader[0].shape)) {
      newContrastLimits = [[0, 255]];
    } else {
      newContrastLimits = [
        [0, 255],
        [0, 255],
        [0, 255]
      ];
    }

    useBrightfieldImagesStore.setState({
      selections: newSelections,
      contrastLimits: newContrastLimits
    });
    useViewerStore.setState({
      isViewerLoading: undefined
    });
  }, [loader, source, isLoaderCreated, t]);
};
