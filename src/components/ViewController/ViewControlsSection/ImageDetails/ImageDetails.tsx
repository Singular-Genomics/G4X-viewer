import { Box, Typography } from '@mui/material';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { useChannelsStore } from '../../../../stores/ChannelsStore';
import { useZarrDataStore } from '../../../../stores/ZarrDataStore';
import { useTranscriptLayerStore } from '../../../../stores/TranscriptLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { HoverInfo } from '../../../ImageInfo/HoverInfo/HoverInfo';
import { PercentageOfTranscripts } from '../../../ImageInfo/PercentageOfTranscripts';
import { ZoomInput } from '../ZoomInput';

export const ImageDetails = () => {
  const { t } = useTranslation();
  const pyramidResolution = useViewerStore(useShallow((store) => store.pyramidResolution));
  const getLoader = useChannelsStore((store) => store.getLoader);
  const hasTranscriptsData = useZarrDataStore((store) => store.hasTranscriptsData);
  const isTranscriptLayerOn = useTranscriptLayerStore((store) => store.isTranscriptLayerOn);

  const loader = getLoader();
  const level = loader[pyramidResolution];

  if (!level) return null;

  return (
    <Box>
      <Typography sx={sx.subsectionTitle}>{t('viewSettings.imageDetails')}</Typography>
      <Box sx={sx.detailsWrapper}>
        <Typography>{t('viewSettings.imageLayer')}</Typography>
        <Box sx={sx.valueBox}>{`${pyramidResolution + 1}/${loader.length}`}</Box>
        <Typography>{t('viewSettings.imageShape')}</Typography>
        <Box sx={sx.valueBox}>{level.shape.join(', ')}</Box>
        <Typography>{t('viewSettings.scale')}</Typography>
        <ZoomInput />
        <Typography>{t('viewSettings.cursor')}</Typography>
        <Box sx={sx.valueBox}>
          <HoverInfo />
        </Box>
        <Typography>{t('viewSettings.transcriptsPercentage')}</Typography>
        <Box sx={sx.valueBox}>{hasTranscriptsData && isTranscriptLayerOn ? <PercentageOfTranscripts /> : '--'}</Box>
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
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 165px)',
    alignItems: 'center',
    gap: '4px 16px',
    paddingLeft: '24px',
    paddingRight: '8px'
  },
  valueBox: {
    minHeight: '28px',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    textAlign: 'left',
    padding: '2px 10px',
    borderRadius: '6px',
    backgroundColor: 'background.paper',
    color: 'text.primary',
    fontSize: '14px',
    overflowWrap: 'anywhere',
    '& .MuiTypography-root': { fontSize: 'inherit' }
  }
};
