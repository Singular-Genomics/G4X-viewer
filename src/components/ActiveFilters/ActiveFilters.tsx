import { Box, Typography } from '@mui/material';
import { GxInfoBox } from '../../shared/components/GxInfoBox';
import { useActiveFilters } from './ActiveFilters.helpers';

export const ActiveFilters = () => {
  const { activeFilters, hasActiveFilters } = useActiveFilters();

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <GxInfoBox
      title="Active filters"
      content={
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
      }
      counter={activeFilters.length}
      position={{ top: '90px', left: '20px' }}
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
