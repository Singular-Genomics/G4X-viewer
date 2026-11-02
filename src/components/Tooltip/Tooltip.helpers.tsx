import { CellMaskDatapointType, TranscriptDatapointType } from './Tooltip.types';
import { TooltipContent, TooltipContentItem } from './TooltipContent';
import { t } from 'i18next';

export function TooltipTranscriptConent({
  data,
  isDirectSeq = false
}: {
  data: TranscriptDatapointType;
  isDirectSeq?: boolean;
}) {
  const positionItem: TooltipContentItem = {
    label: t('transcript.position'),
    value: `X: ${data.position[0].toFixed(2)}
          Y: ${data.position[1].toFixed(2)}`
  };
  const cellIdItem: TooltipContentItem = { label: t('transcript.cellId'), value: data.cellId };

  // Direct-Seq keeps the target in geneName
  const tooltipItems: TooltipContentItem[] = isDirectSeq
    ? [
        { label: t('transcript.targetName'), value: data.geneName },
        { label: t('transcript.sequence'), value: data.sequence ?? '-' },
        { label: t('transcript.meanQs'), value: data.meanQs?.toFixed(1) ?? '-' },
        positionItem,
        cellIdItem
      ]
    : [positionItem, { label: t('transcript.geneName'), value: data.geneName }, cellIdItem];

  return (
    <TooltipContent
      data={tooltipItems}
      title={t(isDirectSeq ? 'tooltip.objectDirectSeq' : 'tooltip.objectTranscript')}
    />
  );
}

export function TooltipCellMaskContent({ data }: { data: CellMaskDatapointType }) {
  const tooltipItems: TooltipContentItem[] = [
    { label: t('segmentation.cellId'), value: data.cellId },
    { label: t('segmentation.clusterId'), value: data.clusterId },
    { label: t('segmentation.area'), value: data.area },
    { label: t('segmentation.totalCounts'), value: data.totalCounts },
    { label: t('segmentation.totalGenes'), value: data.totalGenes }
  ];

  return (
    <TooltipContent
      data={tooltipItems}
      title={t('tooltip.objectCell')}
    />
  );
}
