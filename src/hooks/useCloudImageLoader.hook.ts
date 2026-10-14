import { useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useConsolidatedSnackbar } from './useConsolidatedSnackbar.hook.tsx';
import { loadZarrFromUrl } from '../utils/loadZarrFromUrl';

export const IMAGE_URL_PARAM = 'imageUrl';

export const useCloudImageLoader = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { showConsolidatedMessages } = useConsolidatedSnackbar();
  const hasLoadedFromUrl = useRef(false);

  useEffect(() => {
    if (hasLoadedFromUrl.current) return;

    const imageUrl = new URLSearchParams(window.location.search).get(IMAGE_URL_PARAM);
    if (!imageUrl) return;

    hasLoadedFromUrl.current = true;

    const loadFromUrl = async () => {
      const { successMessages, warningMessages, errorMessage } = await loadZarrFromUrl({
        cloudImageUrl: imageUrl,
        t
      });
      if (errorMessage) {
        enqueueSnackbar({ message: errorMessage, variant: 'error' });
        return;
      }
      if (warningMessages.length === 0) {
        showConsolidatedMessages(successMessages, 'success', 'sourceFiles.zarrLoadComplete');
      }
      showConsolidatedMessages(warningMessages, 'warning', 'sourceFiles.zarrLoadWarnings');
    };

    loadFromUrl();
  }, [enqueueSnackbar, showConsolidatedMessages, t]);
};
