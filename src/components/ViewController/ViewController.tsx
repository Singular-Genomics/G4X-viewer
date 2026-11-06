import { Box, SvgIcon, Theme, lighten, useTheme } from '@mui/material';
import { useMetadata } from '../../hooks/useMetadata.hook';
import { guessRgb } from '../../legacy/utils';
import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import StorageIcon from '@mui/icons-material/Storage';
import LayersIcon from '@mui/icons-material/Layers';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import { ViewControllerProps } from './ViewController.types';
import { GxCollapsibleSection } from '../../shared/components/GxCollapsibleSection/GxCollapsibleSection';
import { SourceFilesSection } from './SourceFilesSection/SourceFilesSection';
import { ViewControlsSection } from './ViewControlsSection/ViewControlsSection';
import { TranscriptLayerSection } from './TranscriptLayerSection/TranscriptLayerSection';
import { useZarrDataStore } from '../../stores/ZarrDataStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { CellMasksLayerSection } from './CellMasksLayerSection';
import { ChannelsSettingsSection } from './ChannelsSettingsSection/ChannelsSettingsSection';
import { useTranslation } from 'react-i18next';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { GxLayerToggle } from '../../shared/components/GxLayerToggle';
import { useShallow } from 'zustand/react/shallow';
import { useChannelsStore } from '../../stores/ChannelsStore';

export const SIDE_PANEL_DEFAULT_WIDTH = 540;
const SIDE_PANEL_MIN_WIDTH = 380;
const SIDE_PANEL_MAX_WIDTH = 800;
const VIEWER_MIN_WIDTH = 320;

const getMaxPanelWidth = () =>
  Math.max(SIDE_PANEL_MIN_WIDTH, Math.min(SIDE_PANEL_MAX_WIDTH, window.innerWidth - VIEWER_MIN_WIDTH));

const clampPanelWidth = (width: number) => Math.min(Math.max(width, SIDE_PANEL_MIN_WIDTH), getMaxPanelWidth());

export const ViewController = ({ imageLoaded, panelWidth, onPanelWidthChange }: ViewControllerProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const sx = styles(theme);
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

  const handleResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      const offset = resizeStartRef.current.pointerX - event.clientX;
      onPanelWidthChange(clampPanelWidth(resizeStartRef.current.panelWidth + offset));
    },
    [onPanelWidthChange]
  );

  const handleResizeEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsResizing(false);
  }, []);

  useEffect(() => {
    const handleWindowResize = () => onPanelWidthChange((currentWidth) => clampPanelWidth(currentWidth));
    // Window may have been resized while the panel was hidden.
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [onPanelWidthChange]);

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
        sx={sx.resizeHandle}
        onPointerDown={handleResizeStart}
        onPointerMove={handleResize}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
      />
      <Box sx={sx.viewControllerContentWrapper}>
        <Box sx={sx.viewControllerSectionsWrapper}>
          <GxCollapsibleSection
            sectionTitle={t('sourceFiles.sectionTitle')}
            sectionIcon={<StorageIcon fontSize="small" />}
            defultState="open"
          >
            <SourceFilesSection />
          </GxCollapsibleSection>
          <GxCollapsibleSection
            sectionTitle={t('viewSettings.sectionTitle')}
            sectionIcon={
              <SvgIcon
                fontSize="small"
                viewBox="0 -960 960 960"
              >
                <path d="M200-120v-80h200v-80q-83 0-141.5-58.5T200-480q0-57 29-105t80-73q-4 22 1.5 43t17.5 40q-23 16-35.5 41T280-480q0 50 35 85t85 35h320v80H520v80h240v80H200Zm360-356-12-38-38 14-20-53q20-16 31-38.5t11-48.5q0-47-33-79.5T418-752l-18-50 38-14-14-36 76-28 12 38 38-14 110 300-38 14 14 38-76 28Zm-140-92q-30 0-51-21t-21-51q0-30 21-51t51-21q30 0 51 21t21 51q0 30-21 51t-51 21Z" />
              </SvgIcon>
            }
            disabled={!imageLoaded}
          >
            <ViewControlsSection />
          </GxCollapsibleSection>
          <GxCollapsibleSection
            sectionTitle={t('channelSettings.sectionTitle')}
            sectionIcon={<LayersIcon fontSize="small" />}
            disabled={!imageLoaded}
            headerAction={
              <GxLayerToggle
                label={t('layerVisibility.toggle', { layer: t('channelSettings.sectionTitle') })}
                checked={isChannelLayerVisible}
                onChange={toggleChannelLayerVisibility}
                disabled={!imageLoaded || !!isRgb}
              />
            }
          >
            <ChannelsSettingsSection isRgb={!!isRgb} />
          </GxCollapsibleSection>
          <GxCollapsibleSection
            sectionTitle={t('transcriptsSettings.sectionTitle')}
            sectionIcon={<ScatterPlotIcon fontSize="small" />}
            disabled={!imageLoaded || !hasTranscriptsData}
            unmountOnExit={false}
            headerAction={
              <GxLayerToggle
                label={t('layerVisibility.toggle', { layer: t('transcriptsSettings.sectionTitle') })}
                checked={isTranscriptLayerOn}
                onChange={toggleTranscriptLayer}
                disabled={!imageLoaded || !hasTranscriptsData}
              />
            }
          >
            <TranscriptLayerSection />
          </GxCollapsibleSection>
          <GxCollapsibleSection
            sectionTitle={t('segmentationSettings.sectionTitle')}
            sectionIcon={<BubbleChartIcon fontSize="small" />}
            disabled={!imageLoaded || !hasSegmentationData}
            unmountOnExit={false}
            headerAction={
              <GxLayerToggle
                label={t('layerVisibility.toggle', { layer: t('segmentationSettings.sectionTitle') })}
                checked={isCellLayerOn}
                onChange={toggleCellLayer}
                disabled={!imageLoaded || !hasSegmentationData}
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
    backgroundColor: theme.palette.background.settingsPanel,

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
    scrollbarColor: `${theme.palette.divider} transparent`
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
    top: '40px',
    zIndex: 1,
    width: '28px',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'ew-resize',
    touchAction: 'none',
    outline: 'none',
    '&::before': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '12px',
      width: '8px',
      height: '70px',
      backgroundColor: theme.palette.background.paper,
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px',
      pointerEvents: 'none'
    },
    '&:hover::before': {
      backgroundColor: lighten(theme.palette.background.paper, 0.1)
    }
  }
});
