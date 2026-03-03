import { useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { loadZarrFromUrl } from '../utils/loadZarrFromUrl';

export const IMAGE_URL_PARAM = 'imageUrl';

export const useCloudImageLoader = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
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
        enqueueSnackbar({
          message: errorMessage,
          variant: 'error'
        });
        return;
      }
      warningMessages.forEach((message) =>
        enqueueSnackbar({
          message,
          variant: 'warning'
        })
      );
      successMessages.forEach((message) =>
        enqueueSnackbar({
          message,
          variant: 'success'
        })
      );
    };

    loadFromUrl();
  }, [enqueueSnackbar, t]);
};
