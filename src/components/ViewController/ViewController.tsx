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
    width: '550px',
    height: '100vh',
    zIndex: 100
  },

  viewControllerContentWrapper: {
    backgroundColor: theme.palette.gx.lightGrey[100],
    borderTopLeftRadius: '32px',
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
  viewControllerToggleButton: {
    position: 'absolute',
    top: 4,
    right: 10,
    zIndex: 100
  },
  socialIconsWrapper: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '8px',
    paddingRight: '16px'
  }
});
