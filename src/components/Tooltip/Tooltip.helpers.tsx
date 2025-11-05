import { CellMaskDatapointType, TranscriptDatapointType } from './Tooltip.types';
import { TooltipContent, TooltipContentItem } from './TooltipContent';
import { t } from 'i18next';

export function TooltipTranscriptConent({ data }: { data: TranscriptDatapointType }) {
  const tooltipItems: TooltipContentItem[] = [
    {
      label: t('transcript.position'),
      value: `X: ${data.position[0].toFixed(2)} 
          Y: ${data.position[1].toFixed(2)}`
    },
    { label: t('transcript.geneName'), value: data.geneName },
    { label: t('transcript.cellId'), value: data.cellId }
  ];

  return <TooltipContent data={tooltipItems} />;
}

export function TooltipCellMaskContent({ data }: { data: CellMaskDatapointType }) {
  const tooltipItems: TooltipContentItem[] = [
    { label: t('segmentation.cellId'), value: data.cellId },
    { label: t('segmentation.clusterId'), value: data.clusterId },
    { label: t('segmentation.area'), value: data.area },
    { label: t('segmentation.totalCounts'), value: data.totalCounts },
    { label: t('segmentation.totalGenes'), value: data.totalGenes }
  ];

  return <TooltipContent data={tooltipItems} />;
}
