import { Box, Typography } from '@mui/material';
import { GxInfoSection } from '../../shared/components/GxInfoSection';
import { useActiveFilters } from './ActiveFilters.helpers';

export const ActiveFilters = () => {
  const { activeFilters, hasActiveFilters } = useActiveFilters();

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <GxInfoSection
      position={{ top: '90px', left: '20px' }}
      infoBoxes={[
        {
          title: 'Active filters',
          content: (
            <Box>
              {activeFilters.map((filter, index) => (
                <Typography
                  key={index}
                  sx={sx.filterItem}
                >
                  • {filter}
                </Typography>
              ))}
            </Box>
          ),
          tag: activeFilters.length
        }
      ]}
    />
  );
};

const sx = {
  filterItem: {
    fontSize: '13px',
    marginBottom: '4px',
    '&:last-child': {
      marginBottom: 0
    }
  }
};
