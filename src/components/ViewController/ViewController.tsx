import { Box, Theme, useTheme } from '@mui/material';
import { useMetadata } from '../../hooks/useMetadata.hook';
import { guessRgb } from '../../legacy/utils';
import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { ViewControllerProps } from './ViewController.types';
import { GxCollapsibleSection } from '../../shared/components/GxCollapsibleSection/GxCollapsibleSection';
import { SourceFilesSection } from './SourceFilesSection/SourceFilesSection';
import { ViewControlsSection } from './ViewControlsSection/ViewControlsSection';
import { TranscriptLayerSection } from './TranscriptLayerSection/TranscriptLayerSection';
import { useZarrDataStore } from '../../stores/ZarrDataStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { CellMasksLayerSection } from './CellMasksLayerSection';
import { ChannelsSettingsSection } from './ChannelsSettingsSection/ChannelsSettingsSection';
import { BrightfieldImagesSection } from './BrightfieldImagesSection/BrightfieldImagesSection';
import { useTranslation } from 'react-i18next';
import { useBrightfieldImagesStore } from '../../stores/BrightfieldImagesStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { GxCheckbox } from '../../shared/components/GxCheckbox';
import { useShallow } from 'zustand/react/shallow';
import { useChannelsStore } from '../../stores/ChannelsStore';

const SIDE_PANEL_DEFAULT_WIDTH = 540;
const SIDE_PANEL_MIN_WIDTH = 380;
const SIDE_PANEL_MAX_WIDTH = 800;
const VIEWER_MIN_WIDTH = 320;

const getMaxPanelWidth = () =>
  Math.max(SIDE_PANEL_MIN_WIDTH, Math.min(SIDE_PANEL_MAX_WIDTH, window.innerWidth - VIEWER_MIN_WIDTH));

const clampPanelWidth = (width: number) => Math.min(Math.max(width, SIDE_PANEL_MIN_WIDTH), getMaxPanelWidth());

export const ViewController = ({ imageLoaded }: ViewControllerProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const sx = styles(theme);
  const [panelWidth, setPanelWidth] = useState(SIDE_PANEL_DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ pointerX: 0, panelWidth: SIDE_PANEL_DEFAULT_WIDTH });
  const hasTranscriptsData = useZarrDataStore((store) => store.hasTranscriptsData);
  const hasSegmentationData = useZarrDataStore((store) => store.hasSegmentationData);
  const [isCellLayerOn, toggleCellLayer] = useCellSegmentationLayerStore(
    useShallow((store) => [store.isCellLayerOn, store.toggleCellLayer])
  );
  const [isTranscriptLayerOn, toggleTranscriptLayer] = useTranscriptLayerStore(
    useShallow((store) => [store.isTranscriptLayerOn, store.toggleTranscriptLayer])
  );
  const [isBrightfieldLayerVisible, toggleBrightfieldLayer] = useBrightfieldImagesStore(
    useShallow((store) => [store.isLayerVisible, store.toggleImageLayer])
  );
  const [isChannelLayerVisible, toggleChannelLayerVisibility] = useChannelsStore(
    useShallow((store) => [store.isLayerVisible, store.toggleLayerVisibility])
  );
  const metadata = useMetadata();

  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      resizeStartRef.current = { pointerX: event.clientX, panelWidth };
      setIsResizing(true);
    },
    [panelWidth]
  );

  const handleResize = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const offset = resizeStartRef.current.pointerX - event.clientX;
    setPanelWidth(clampPanelWidth(resizeStartRef.current.panelWidth + offset));
  }, []);

  const handleResizeEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsResizing(false);
  }, []);

  useEffect(() => {
    const handleWindowResize = () => setPanelWidth((currentWidth) => clampPanelWidth(currentWidth));
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event('onControllerResize'));
  }, [panelWidth]);

  useEffect(() => {
    if (!isResizing) return;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [isResizing]);

  const isRgb = metadata && guessRgb(metadata);

  return (
    <Box sx={{ ...sx.viewControllerContainer, width: panelWidth }}>
      <Box
        sx={{ ...sx.resizeHandle, ...(isResizing ? sx.resizeHandleActive : {}) }}
        onPointerDown={handleResizeStart}
        onPointerMove={handleResize}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
      >
        <DragIndicatorIcon fontSize="small" />
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
            headerAction={
              <GxCheckbox
                checked={isChannelLayerVisible}
                onChange={toggleChannelLayerVisibility}
                disabled={!imageLoaded || !!isRgb}
                disableTouchRipple
                sx={sx.headerCheckbox}
              />
            }
          >
            <ChannelsSettingsSection />
          </GxCollapsibleSection>
          <GxCollapsibleSection
            sectionTitle={t('brightfieldImages.sectionTitle')}
            disabled={!imageLoaded}
            headerAction={
              <GxCheckbox
                checked={isBrightfieldLayerVisible}
                onChange={toggleBrightfieldLayer}
                disabled={!imageLoaded}
                disableTouchRipple
                sx={sx.headerCheckbox}
              />
            }
          >
            <BrightfieldImagesSection />
          </GxCollapsibleSection>
          <GxCollapsibleSection
            sectionTitle={t('transcriptsSettings.sectionTitle')}
            disabled={!imageLoaded || !hasTranscriptsData}
            unmountOnExit={false}
            headerAction={
              <GxCheckbox
                checked={isTranscriptLayerOn}
                onChange={toggleTranscriptLayer}
                disabled={!imageLoaded || !hasTranscriptsData}
                disableTouchRipple
                sx={sx.headerCheckbox}
              />
            }
          >
            <TranscriptLayerSection />
          </GxCollapsibleSection>
          <GxCollapsibleSection
            sectionTitle={t('segmentationSettings.sectionTitle')}
            disabled={!imageLoaded || !hasSegmentationData}
            unmountOnExit={false}
            headerAction={
              <GxCheckbox
                checked={isCellLayerOn}
                onChange={toggleCellLayer}
                disabled={!imageLoaded || !hasSegmentationData}
                disableTouchRipple
                sx={sx.headerCheckbox}
              />
            }
          >
            <CellMasksLayerSection />
          </GxCollapsibleSection>
        </Box>
      </Box>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  viewControllerContainer: {
    minWidth: `${SIDE_PANEL_MIN_WIDTH}px`,
    maxWidth: `min(${SIDE_PANEL_MAX_WIDTH}px, calc(100vw - ${VIEWER_MIN_WIDTH}px))`,
    flexShrink: 0,
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
  resizeHandle: {
    position: 'absolute',
    left: '-28px',
    top: '100px',
    zIndex: 1,
    width: '28px',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.gx.lightGrey[100],
    borderTopLeftRadius: '8px',
    borderBottomLeftRadius: '8px',
    cursor: 'ew-resize',
    touchAction: 'none',
    outline: 'none',
    '&:hover': {
      backgroundColor: theme.palette.gx.lightGrey[300]
    }
  },
  resizeHandleActive: {
    backgroundColor: theme.palette.gx.lightGrey[300]
  },
  headerCheckbox: {
    padding: '0 8px 0 0',
    '&, &.Mui-checked': {
      color: theme.palette.gx.primary.black
    },
    '&.Mui-disabled': {
      opacity: 0.26
    }
  }
});
