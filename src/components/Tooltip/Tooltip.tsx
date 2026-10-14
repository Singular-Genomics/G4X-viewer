import { Box, Theme, useTheme } from '@mui/material';
import { TooltipType, useTooltipStore } from '../../stores/TooltipStore';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useViewerStore } from '../../stores/ViewerStore';
import { TooltipCellMaskContent, TooltipTranscriptConent } from './Tooltip.helpers';
import { CellMaskDatapointType, TranscriptDatapointType } from './Tooltip.types';

function getTooltipContent(type: TooltipType | undefined, object: any) {
  if (type === 'Transcript') {
    return <TooltipTranscriptConent data={object as TranscriptDatapointType} />;
  } else if (type === 'CellMask') {
    return <TooltipCellMaskContent data={object as CellMaskDatapointType} />;
  }
  return null;
}

export function Tooltip() {
  const theme = useTheme();
  const sx = styles(theme);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, viewportHeight] = useViewerStore(
    useShallow((store) => [store.viewportWidth, store.viewportHeight])
  );

  const [{ x, y }, object, type] = useTooltipStore(useShallow((store) => [store.position, store.object, store.type]));

  const tooltipElement = tooltipRef.current;

  useEffect(() => {
    if (tooltipElement) {
      if (object) {
        tooltipElement.style.display = 'block';

        const tooltipWidth = tooltipElement.offsetWidth;
        const tooltipHeight = tooltipElement.offsetHeight;

        const adjustedPositionX = x + tooltipWidth > viewportWidth ? x - tooltipWidth : x;
        const adjustedPositionY = y + tooltipHeight > viewportHeight ? y - tooltipHeight : y;

        tooltipElement.style.top = `${adjustedPositionY}px`;
        tooltipElement.style.left = `${adjustedPositionX}px`;
      } else {
        tooltipElement.style.display = 'none';
      }
    }
  }, [tooltipElement, x, y, object, viewportWidth, viewportHeight]);

  return (
    <Box
      ref={tooltipRef}
      sx={sx.tooltipWrapper}
    >
      <Box sx={sx.tooltipContainer}>{object && getTooltipContent(type, object)}</Box>
    </Box>
  );
}

const styles = (theme: Theme) => ({
  tooltipWrapper: {
    position: 'absolute',
    zIndex: 10,
    pointerEvents: 'none',
    display: 'none'
  },
  tooltipContainer: {
    backgroundColor: theme.palette.gx.darkGrey[300],
    color: theme.palette.gx.lightGrey[900],
    padding: '8px 16px',
    border: `5px solid ${theme.palette.gx.darkGrey[100]}`,
    borderRadius: '10px',
    cursor: 'crosshair',
    fontSize: '13px'
  }
});
