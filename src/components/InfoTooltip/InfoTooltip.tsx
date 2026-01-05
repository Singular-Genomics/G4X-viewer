import { IconButton, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { InfoTooltipProps } from './InfoTooltip.types';

export const InfoTooltip = ({ title, size = 'small' }: InfoTooltipProps) => {
  return (
    <Tooltip
      title={title}
      arrow
      placement="top"
      enterDelay={250}
      leaveDelay={50}
    >
      <IconButton
        size={size}
        sx={sx.infoButton}
      >
        <InfoOutlined fontSize={size} />
      </IconButton>
    </Tooltip>
  );
};

const sx = {
  infoButton: {
    padding: '4px'
  }
};
