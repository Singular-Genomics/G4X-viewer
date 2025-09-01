import { Box, Typography } from '@mui/material';
import { GxInfoSection } from '../../../shared/components/GxInfoSection';
import { CollapsibleInfoSectionProps } from './CollapsibleInfoSection.types';

export const CollapsibleInfoSection = ({ title, data, totalCount }: CollapsibleInfoSectionProps) => {
  if (Object.keys(data).length === 0) {
    return null;
  }

  return (
    <GxInfoSection
      infoBoxes={[
        {
          title,
          content: (
            <Box>
              {Object.entries(data).map(([groupTitle, items]) => (
                <Box
                  key={groupTitle}
                  sx={sx.layerGroup}
                >
                  <Typography sx={sx.layerTitle}>• {groupTitle}:</Typography>
                  {items.map((item, index) => (
                    <Typography
                      key={index}
                      sx={sx.filterItem}
                    >
                      - {item}
                    </Typography>
                  ))}
                </Box>
              ))}
            </Box>
          ),
          tag: totalCount
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
