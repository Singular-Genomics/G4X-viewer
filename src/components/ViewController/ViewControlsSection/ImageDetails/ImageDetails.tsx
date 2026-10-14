import { Box, Typography } from '@mui/material';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { useChannelsStore } from '../../../../stores/ChannelsStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

export const ImageDetails = () => {
  const { t } = useTranslation();
  const pyramidResolution = useViewerStore(useShallow((store) => store.pyramidResolution));
  const getLoader = useChannelsStore((store) => store.getLoader);

  const loader = getLoader();
  const level = loader[pyramidResolution];

  if (!level) {
    return null;
  }

  return (
    <Box>
      <Typography sx={sx.subsectionTitle}>{t('viewSettings.imageDetails')}</Typography>
      <Box sx={sx.detailsWrapper}>
        <Typography>{`${t('general.layers')}: ${pyramidResolution + 1}/${loader.length}`}</Typography>
        <Typography>{`${t('general.shape')}: ${level.shape.join(', ')}`}</Typography>
      </Box>
    </Box>
  );
};

const sx = {
  subsectionTitle: {
    fontWeight: 700,
    paddingLeft: '8px',
    marginBottom: '8px'
  },
  detailsWrapper: {
    display: 'flex',
    gap: '24px',
    paddingLeft: '8px'
  }
};
