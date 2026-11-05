import { Theme } from '@mui/material';
import { Layout } from 'plotly.js';

// Plotly renders outside MUI, so pass its interface colors explicitly.
export const getPlotTheme = (theme: Theme): Partial<Layout> => {
  const axis = {
    color: theme.palette.text.primary,
    gridcolor: theme.palette.divider,
    zerolinecolor: theme.palette.divider,
    linecolor: theme.palette.divider
  };

  return {
    paper_bgcolor: theme.palette.background.paper,
    plot_bgcolor: theme.palette.background.paper,
    font: { color: theme.palette.text.primary },
    xaxis: axis,
    yaxis: axis,
    modebar: {
      bgcolor: theme.palette.background.paper,
      color: theme.palette.text.secondary,
      activecolor: theme.palette.primary.main
    }
  };
};
