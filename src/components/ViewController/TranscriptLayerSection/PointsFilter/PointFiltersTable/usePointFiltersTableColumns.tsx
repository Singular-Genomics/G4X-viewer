import { GetApplyQuickFilterFn, GridColDef } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { PointFiltersTableRowEntry } from './PointFiltersTable.types';
import { GxFilterTableColorCell } from '../../../../../shared/components/GxFilterTable/GxFilterTableColorCell/GxFilterTableColorCell';
import { useZarrDataStore } from '../../../../../stores/ZarrDataStore';

const geneColorQuickFilter: GetApplyQuickFilterFn<any, unknown> = (value) => {
  if (!(value as string).startsWith('[')) {
    return null;
  }

  const parsedValue = (value as string).replace(/\[|\]/g, '').split(' ').map(Number);
  return (cellValue) => parsedValue.every((value) => (cellValue as Array<number>).includes(value));
};

const handleColorMapUpdate = (color: number[], geneName: string) => {
  const { colorMapConfig, setColormapConfig } = useZarrDataStore.getState();
  const updatedConfig = colorMapConfig.map((entry) => (entry.gene_name === geneName ? { ...entry, color } : entry));
  setColormapConfig(updatedConfig);
};

export const usePointFiltersTableColumns = (): GridColDef<PointFiltersTableRowEntry>[] => {
  const { t } = useTranslation();

  return useMemo<GridColDef<PointFiltersTableRowEntry>[]>(
    () => [
      {
        field: 'gene_name',
        headerName: t('transcript.geneName'),
        headerAlign: 'center',
        filterable: true,
        flex: 1,
        renderCell: (params) => <Typography>{params.row.gene_name}</Typography>
      },
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
    ],
    [t]
  );
};
