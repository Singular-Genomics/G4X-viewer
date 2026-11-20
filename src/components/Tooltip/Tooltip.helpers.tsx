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
  const sharedItems: TooltipContentItem[] = [
    {
      label: t('transcript.position'),
      value: `X: ${data.position[0].toFixed(2)}
          Y: ${data.position[1].toFixed(2)}`
    },
    { label: t('transcript.cellId'), value: data.cellId }
  ];

  // Direct-Seq keeps the target in geneName
  const tooltipConfig = isDirectSeq
    ? {
        title: t('tooltip.objectDirectSeq'),
        items: [
          ...sharedItems,
          { label: t('transcript.targetName'), value: data.geneName },
          { label: t('transcript.sequence'), value: data.sequence ?? '-' },
          { label: t('transcript.meanQs'), value: data.meanQs?.toFixed(1) ?? '-' }
        ]
      }
    : {
        title: t('tooltip.objectTranscript'),
        items: [...sharedItems, { label: t('transcript.geneName'), value: data.geneName }]
      };

  return (
    <TooltipContent
      data={tooltipConfig.items}
      title={tooltipConfig.title}
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
