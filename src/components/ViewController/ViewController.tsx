import { Box, IconButton, Theme, useTheme } from '@mui/material';
import { useMetadata } from '../../hooks/useMetadata.hook';
import { guessRgb } from '../../legacy/utils';
import { useEffect, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ViewControllerProps } from './ViewController.types';
import { GxCollapsibleSection } from '../../shared/components/GxCollapsibleSection/GxCollapsibleSection';
import { SourceFilesSection } from './SourceFilesSection/SourceFilesSection';
import { ViewControlsSection } from './ViewControlsSection/ViewControlsSection';
import { TranscriptLayerSection } from './TranscriptLayerSection/TranscriptLayerSection';
import { useBinaryFilesStore } from '../../stores/BinaryFilesStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { CellMasksLayerSection } from './CellMasksLayerSection';
import { ChannelsSettingsSection } from './ChannelsSettingsSection/ChannelsSettingsSection';
import { BrightfieldImagesSection } from './BrightfieldImagesSection/BrightfieldImagesSection';
import { useTranslation } from 'react-i18next';

export const ViewController = ({ imageLoaded }: ViewControllerProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const sx = styles(theme);
  const [isControllerOn, setIsControllerOn] = useState(true);
  const metadataFiles = useBinaryFilesStore((store) => store.files);
  const cellMasksFiles = useCellSegmentationLayerStore((store) => store.cellMasksData);
  const metadata = useMetadata();

  useEffect(() => {
    window.dispatchEvent(new Event('onControllerToggle'));
  }, [isControllerOn]);

  const isRgb = metadata && guessRgb(metadata);

  return (
    <>
      {isControllerOn ? (
        <Box sx={sx.viewControllerContainer}>
          <Box sx={sx.collapseButton}>
            <IconButton
              onClick={() => setIsControllerOn(false)}
              sx={sx.collapseIconButton}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Box sx={sx.viewControllerContentWrapper}>
            <Box sx={sx.viewControllerSectionsWrapper}>
              <GxCollapsibleSection
                sectionTitle={t('sourceFiles.sectionTitle')}
                defultState="open"
              >
                <SourceFilesSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle={t('viewSettings.sectionTitle')}
                disabled={!imageLoaded}
              >
                <ViewControlsSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle={t('channelSettings.sectionTitle')}
                disabled={!imageLoaded || isRgb}
              >
                <ChannelsSettingsSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle={t('brightfieldImages.sectionTitle')}
                disabled={!imageLoaded}
              >
                <BrightfieldImagesSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle={t('transcriptsSettings.sectionTitle')}
                disabled={!imageLoaded || !metadataFiles.length}
                unmountOnExit={false}
              >
                <TranscriptLayerSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle={t('segmentationSettings.sectionTitle')}
                disabled={!imageLoaded || !cellMasksFiles?.length}
                unmountOnExit={false}
              >
                <CellMasksLayerSection />
              </GxCollapsibleSection>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={sx.expandButton}>
          <IconButton
            onClick={() => setIsControllerOn(true)}
            sx={sx.expandIconButton}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      )}
    </>
  );
};

const styles = (theme: Theme) => ({
  viewControllerContainer: {
    width: '550px',
    height: '100%',
    position: 'relative'
  },

  viewControllerContentWrapper: {
    backgroundColor: theme.palette.gx.lightGrey[100],

    padding: '16px 4px 8px 20px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    scrollbarWidth: 'thin'
  },
  viewControllerSectionsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingRight: '8px',
    overflowY: 'scroll',
    scrollbarColor: '#8E9092 transparent'
  },
  viewControllerLoaderWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  collapseButton: {
    position: 'absolute',
    left: '-30px',
    top: '100px',
    zIndex: 1
  },
  collapseIconButton: {
    backgroundColor: theme.palette.gx.lightGrey[100],
    borderTopLeftRadius: '8px',
    borderBottomLeftRadius: '8px',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    padding: '12px 4px',
    '&:hover': {
      backgroundColor: theme.palette.gx.lightGrey[300]
    }
  },
  expandButton: {
    position: 'fixed',
    right: 0,
    top: '170px',
    zIndex: 1
  },
  expandIconButton: {
    backgroundColor: theme.palette.gx.lightGrey[100],
    borderTopLeftRadius: '8px',
    borderBottomLeftRadius: '8px',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    padding: '12px 4px',
    '&:hover': {
      backgroundColor: theme.palette.gx.lightGrey[300]
    }
  }
});
