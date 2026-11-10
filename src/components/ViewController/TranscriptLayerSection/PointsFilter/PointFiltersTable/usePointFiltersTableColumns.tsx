import { useMemo } from 'react';
import { GetApplyQuickFilterFn, GridColDef } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PointFiltersTableRowEntry } from './PointFiltersTable.types';
import { GxFilterTableColorCell } from '../../../../../shared/components/GxFilterTable/GxFilterTableColorCell/GxFilterTableColorCell';
import { useTranscriptSource } from '../../TranscriptSourceContext';
import {
  formatMetadataKey,
  formatMetadataValue,
  getMetadataKeys,
  isNumericMetadataKey
} from './PointFiltersTable.helpers';

export const usePointFiltersTableColumns = (): GridColDef<PointFiltersTableRowEntry>[] => {
  const { t } = useTranslation();
  const { useColorMap, fallbackNameLabelKey } = useTranscriptSource();
  const { colorMapConfig, setColormapConfig } = useColorMap();

  const geneColorQuickFilter: GetApplyQuickFilterFn<any, unknown> = (value) => {
    if (!(value as string).startsWith('[')) {
      return null;
    }

    const parsedValue = (value as string).replace(/\[|\]/g, '').split(' ').map(Number);
    return (cellValue) => parsedValue.every((value) => (cellValue as Array<number>).includes(value));
  };

  const handleColorMapUpdate = (color: number[], geneName: string) => {
    const updatedConfig = colorMapConfig.map((entry) => (entry.gene_name === geneName ? { ...entry, color } : entry));
    setColormapConfig(updatedConfig);
  };

  // Name columns come from the dataset metadata, entries without any fall back to the plain name column
  const nameColumns = useMemo((): GridColDef<PointFiltersTableRowEntry>[] => {
    const metadataKeys = getMetadataKeys(colorMapConfig);

    if (metadataKeys.length === 0) {
      return [
        {
          field: 'gene_name',
          headerName: t(fallbackNameLabelKey),
          headerAlign: 'center',
          filterable: true,
          flex: 1,
          renderCell: (params) => <Typography>{params.row.gene_name}</Typography>
        }
      ];
    }

    return metadataKeys.map((key): GridColDef<PointFiltersTableRowEntry> => {
      const isNumeric = isNumericMetadataKey(colorMapConfig, key);
      return {
        field: `metadata.${key}`,
        headerName: t(`transcript.metadataColumns.${key}`, { defaultValue: formatMetadataKey(key) }),
        type: isNumeric ? 'number' : 'string',
        align: 'center',
        headerAlign: 'center',
        filterable: true,
        flex: 1,
        valueGetter: (_value, row) =>
          isNumeric ? (row.metadata?.[key] ?? null) : formatMetadataValue(row.metadata?.[key]),
        // Many columns share a narrow panel, so long values get an ellipsis instead of being clipped on both sides
        renderCell: (params) => {
          const text = formatMetadataValue(params.value);
          return (
            <Typography
              noWrap
              title={text}
            >
              {text}
            </Typography>
          );
        }
      };
    });
  }, [colorMapConfig, fallbackNameLabelKey, t]);

  return [
    ...nameColumns,
    {
      field: 'color',
      headerAlign: 'center',
      headerName: t('transcript.color'),
      filterable: false,
      flex: 1,
      getApplyQuickFilterFn: geneColorQuickFilter,
      renderCell: (params) => (
        <GxFilterTableColorCell
          currentColor={params.row.color}
          currnetValueName={params.row.gene_name}
          handleColorUpdate={handleColorMapUpdate}
        />
      )
    }
  ];
};
