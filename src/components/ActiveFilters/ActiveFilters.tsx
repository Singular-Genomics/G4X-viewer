import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GxInfoSection } from '../../shared/components/GxInfoSection';
import { useActiveFilters } from './ActiveFilters.helpers';

export const ActiveFilters = () => {
  const { t } = useTranslation();
  const { groupedActiveFilters, hasActiveFilters } = useActiveFilters();

  if (!hasActiveFilters) {
    return null;
  }

  const totalFilters = Object.values(groupedActiveFilters).flat().length;

  return (
    <GxInfoSection
      position={{ top: '90px', left: '20px' }}
      infoBoxes={[
        {
          title: t('activeFilters.title'),
          content: (
            <Box>
              {Object.entries(groupedActiveFilters).map(([layer, filters]) => (
                <Box
                  key={layer}
                  sx={sx.layerGroup}
                >
                  <Typography sx={sx.layerTitle}>• {layer}:</Typography>
                  {filters.map((filter, index) => (
                    <Typography
                      key={index}
                      sx={sx.filterItem}
                    >
                      - {filter}
                    </Typography>
                  ))}
                </Box>
              ))}
            </Box>
          ),
          tag: totalFilters
        }
      ]}
    />
  );
};

const sx = {
  layerGroup: {
    marginBottom: '8px',
    '&:last-child': {
      marginBottom: 0
    }
  },
  layerTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '2px'
  },
  filterItem: {
    fontSize: '13px',
    marginLeft: '8px',
    marginBottom: '2px',
    '&:last-child': {
      marginBottom: 0
    }
  }
};
