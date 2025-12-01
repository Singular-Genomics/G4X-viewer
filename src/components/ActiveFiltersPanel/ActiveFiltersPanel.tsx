import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useActiveFilters } from './ActiveFiltersPanel.helpers';
import { useHiddenLayers } from './ActiveFiltersPanel.helpers';
import { CollapsibleInfoSection } from './CollapsibleInfoSection';
import { ROIDetailsPanel } from '../ROIDetailsPanel';

export const ActiveFiltersPanel = () => {
  const { t } = useTranslation();
  const { groupedActiveFilters, hasActiveFilters } = useActiveFilters();
  const { hiddenLayers, hasHiddenLayers } = useHiddenLayers();

  const activeFiltersCount = Object.values(groupedActiveFilters).flat().length;
  const hiddenLayersData = hasHiddenLayers ? { [t('hiddenLayers.title')]: hiddenLayers } : {};

  return (
    <Box sx={sx.wrapper}>
      {hasActiveFilters && (
        <CollapsibleInfoSection
          title={t('activeFilters.title')}
          data={groupedActiveFilters}
          totalCount={activeFiltersCount}
        />
      )}
      {hasHiddenLayers && (
        <CollapsibleInfoSection
          title={t('hiddenLayers.title')}
          data={hiddenLayersData}
          totalCount={hiddenLayers.length}
        />
      )}
      <ROIDetailsPanel />
    </Box>
  );
};

const sx = {
  wrapper: {
    position: 'fixed',
    top: '90px',
    left: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  }
};
