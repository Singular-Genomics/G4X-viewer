import { Box, Typography, Theme, useTheme, Button } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataGrid, GridRowSelectionModel } from '@mui/x-data-grid';
import { PlotSelectionTableProps, PlotSelectionTableRowEntry } from './PlotSelectionTable.types';
import { usePlotSelectionTableColumns } from './usePlotSelectionTableColumns';

export const PlotSelectionTable = ({
  genes,
  selectedGenes,
  onGeneSelect,
  onPlotClick,
  plotDisabled
}: PlotSelectionTableProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);
  const columns = usePlotSelectionTableColumns();

  const [geneSelectionModel, setGeneSelectionModel] = useState<GridRowSelectionModel>([]);

  // Create row data for genes
  const geneRows: PlotSelectionTableRowEntry[] = useMemo(
    () =>
      genes.map((gene, index) => ({
        id: `gene_${index}`,
        name: gene.label,
        visible: true
      })),
    [genes]
  );

  // Update selection model when props change
  useEffect(() => {
    const selectionModel = selectedGenes
      .map((gene) => {
        const geneIndex = genes.map((g) => g.name).indexOf(gene);
        return geneIndex >= 0 ? `gene_${geneIndex}` : null;
      })
      .filter(Boolean) as string[];

    setGeneSelectionModel(selectionModel);
  }, [selectedGenes, genes]);

  const handleGeneSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setGeneSelectionModel(newSelectionModel);

    const selectedGeneNames = newSelectionModel
      .map((selectedId) => {
        const geneIndex = parseInt((selectedId as string).replace('gene_', ''));
        return genes[geneIndex].label;
      })
      .filter(Boolean);

    onGeneSelect(selectedGeneNames);
  };

  return (
    <Box sx={sx.container}>
      <Box sx={sx.header}>
        <Typography
          variant="h6"
          sx={sx.sectionTitle}
        >
          {t('general.genes')} ({genes.length}) - Selected: {selectedGenes.length}
        </Typography>
        <Button
          variant="contained"
          onClick={onPlotClick}
          disabled={plotDisabled}
          sx={sx.plotButton}
        >
          {t('plots.createPlot')}
        </Button>
      </Box>

      <Box sx={sx.tableContainer}>
        <DataGrid
          rows={geneRows}
          columns={columns}
          checkboxSelection
          // Enable multiple selection
          rowSelectionModel={geneSelectionModel}
          onRowSelectionModelChange={handleGeneSelectionChange}
          hideFooter
          sx={sx.dataGrid}
          density="compact"
        />
      </Box>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    height: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    color: theme.palette.text.primary,
    fontWeight: 'bold'
  },
  plotButton: {
    backgroundColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.primary.white,
    '&:hover': {
      backgroundColor: theme.palette.gx.accent.greenBlue,
      opacity: 0.8
    },
    '&:disabled': {
      backgroundColor: theme.palette.grey[300],
      color: theme.palette.grey[500]
    }
  },
  tableContainer: {
    flex: 1,
    minHeight: '300px'
  },
  dataGrid: {
    border: `1px solid ${theme.palette.divider}`,
    '& .MuiDataGrid-cell': {
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: theme.palette.grey[50],
      borderBottom: `2px solid ${theme.palette.divider}`
    }
  }
});
