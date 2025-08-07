import { Box, IconButton, Theme, useTheme } from '@mui/material';
import { useMetadata } from '../../hooks/useMetadata.hook';
import { guessRgb } from '../../legacy/utils';
import { useEffect, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { ViewControllerProps } from './ViewController.types';
import { GxCollapsibleSection } from '../../shared/components/GxCollapsibleSection/GxCollapsibleSection';
import { SourceFilesSection } from './SourceFilesSection/SourceFilesSection';
import { ViewControlsSection } from './ViewControlsSection/ViewControlsSection';
import { TranscriptLayerSection } from './TranscriptLayerSection/TranscriptLayerSection';
import { useBinaryFilesStore } from '../../stores/BinaryFilesStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { CellMasksLayerSection } from './CellMasksLayerSection';
import { ControllerHeader } from './ControllerHeader';
import { ChannelsSettingsSection } from './ChannelsSettingsSection/ChannelsSettingsSection';
import { BrightfieldImagesSection } from './BrightfieldImagesSection/BrightfieldImagesSection';
import { SocialIcons } from '../SocialIcons/SocialIcons';
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
          <Box sx={sx.viewControllerContentWrapper}>
            <ControllerHeader onCloseController={() => setIsControllerOn(false)} />
            <Box sx={sx.viewControllerSectionsWrapper}>
              <GxCollapsibleSection
                sectionTitle={t('sourceFiles.sectionTitle')}
                defultState="open"
              >
                <SourceFilesSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle="View Settings"
                disabled={!imageLoaded}
              >
                <ViewControlsSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle="Protein Channel Settings"
                disabled={!imageLoaded || isRgb}
              >
                <ChannelsSettingsSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle="Brightfield Images Settings"
                disabled={!imageLoaded}
              >
                <BrightfieldImagesSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle="Transcript Layer Settings"
                disabled={!imageLoaded || !metadataFiles.length}
                unmountOnExit={false}
              >
                <TranscriptLayerSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle="Segmentation Layer Settings"
                disabled={!imageLoaded || !cellMasksFiles?.length}
                unmountOnExit={false}
              >
                <CellMasksLayerSection />
              </GxCollapsibleSection>
            </Box>
            <Box sx={sx.socialIconsWrapper}>
              <SocialIcons />
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={sx.viewControllerToggleButton}>
          <IconButton
            size="large"
            disableTouchRipple
            onClick={() => setIsControllerOn(true)}
            style={{ color: theme.palette.gx.primary.white }}
          >
            <MenuIcon fontSize="large" />
          </IconButton>
        </Box>
      )}
    </>
  );
};

const styles = (theme: Theme) => ({
  viewControllerContainer: {
    backgroundColor: theme.palette.gx.mediumGrey[300],
    padding: '8px 0 0 8px',
    width: '550px',
    height: '100vh'
  },

  viewControllerContentWrapper: {
    backgroundColor: theme.palette.gx.lightGrey[100],
    borderTopLeftRadius: '32px',
    padding: '16px 8px 8px 16px',
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
  viewControllerToggleButton: {
    position: 'absolute',
    top: 0,
    right: 10
  },
  socialIconsWrapper: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '8px',
    paddingRight: '16px'
  }
});
