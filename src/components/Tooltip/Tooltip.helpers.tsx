import { CellMaskDatapointType, TranscriptDatapointType } from './Tooltip.types';
import { TooltipContent, TooltipContentItem } from './TooltipContent';

export function TooltipTranscriptConent({ data }: { data: TranscriptDatapointType }) {
  const tooltipItems: TooltipContentItem[] = [
    {
      label: 'cell id',
      value: `X: ${data.position[0].toFixed(2)} 
          Y: ${data.position[1].toFixed(2)}`
    },
    {
      label: 'color',
      value: `R ${data.color[0]} G ${data.color[1]} B ${data.color[2]}`
    },
    { label: 'gene name', value: data.geneName },
    { label: 'cell id', value: data.cellId }
  ];

  return <TooltipContent data={tooltipItems} />;
}

export function TooltipCellMaskContent({ data }: { data: CellMaskDatapointType }) {
  const tooltipItems: TooltipContentItem[] = [
    { label: 'cell id', value: data.cellId },
    {
      label: 'color',
      value: `R ${data.color[0]} G ${data.color[1]} B ${data.color[2]}`
    },
    { label: 'area', value: data.area },
    { label: 'total counts', value: data.totalCounts },
    { label: 'total genes', value: data.totalGenes }
  ];

  return <TooltipContent data={tooltipItems} />;
}
