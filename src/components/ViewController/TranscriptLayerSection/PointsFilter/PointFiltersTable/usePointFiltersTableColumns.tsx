import { GetApplyQuickFilterFn, GridColDef } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PointFiltersTableRowEntry } from './PointFiltersTable.types';
import { GxFilterTableColorCell } from '../../../../../shared/components/GxFilterTable/GxFilterTableColorCell/GxFilterTableColorCell';
import { useBinaryFilesStore } from '../../../../../stores/BinaryFilesStore';

export const usePointFiltersTableColumns = (): GridColDef<PointFiltersTableRowEntry>[] => {
  const { t } = useTranslation();
  const { colorMapConfig, setColormapConfig } = useBinaryFilesStore();

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

  return [
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
  ];
};
