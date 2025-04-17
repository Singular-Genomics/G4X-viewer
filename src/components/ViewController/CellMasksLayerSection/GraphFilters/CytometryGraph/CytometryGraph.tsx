import { alpha, Box, MenuItem, Theme, Typography, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { Data, Layout } from 'plotly.js';
import { useEffect, useRef, useState } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { GxSelect } from '../../../../../shared/components/GxSelect';
import { GetBrandColorscale } from './CytometryGraph.helpers';
import { CytometrySettingsMenu } from './CytometrySettingsMenu/CytometrySettingsMenu';
import { GraphRangeInputs } from '../GraphRangeInputs';
import { CytometryFilter } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';

export const CytometryGraph = () => {
  const containerRef = useRef(null);
  const theme = useTheme();
  const sx = styles(theme);

  const { cytometryFilter } = useCellSegmentationLayerStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;

      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerEl);

    return () => {
      if (containerEl) {
        resizeObserver.unobserve(containerEl);
      }
    };
  }, []);

  const plotData: Data[] = [
    {
      type: 'heatmap',
      z: [],
      x: [],
      y: [],
      colorscale: GetBrandColorscale(),
      showscale: true,
      hoverinfo: 'x+y+z',
      hovertemplate: 'X: %{x}<br>Y: %{y}<br>Count: %{z}<extra></extra>',
      zmin: 0,
      zmax: 15
    }
  ];

  const layout = {
    dragmode: 'select',
    hovermode: 'closest',
    margin: { t: 50, r: 100, b: 80, l: 100 },
    paper_bgcolor: theme.palette.gx.primary.white,
    plot_bgcolor: theme.palette.gx.lightGrey[900],
    xaxis: {
      title: {
        text: 'Test X',
        font: { size: 14 }
      },
      type: 'linear',
      autorange: true,
      linewidth: 2,
      mirror: true,
      tickmode: 'array',
      tickfont: { size: 12 },
      exponentformat: 'power'
    },
    yaxis: {
      title: {
        text: 'Test Y',
        font: { size: 14 },
        standoff: 10
      },
      type: 'linear',
      autorange: true,
      linewidth: 2,
      mirror: true,
      tickmode: 'array',
      tickfont: { size: 12 },
      exponentformat: 'power',
      scaleanchor: 'x',
      scaleratio: 1
    },
    width: dimensions.width,
    height: dimensions.height,
    activeselection: {
      opacity: 1,
      fillcolor: alpha(theme.palette.gx.primary.black, 0.1)
    },
    selections: [
      ...(cytometryFilter
        ? [
            {
              line: {
                color: theme.palette.gx.primary.black,
                width: 2,
                dash: 'solid'
              },
              opacity: 1,
              type: 'rect',
              x0: cytometryFilter.xRangeStart,
              x1: cytometryFilter.xRangeEnd,
              xref: 'x',
              y0: cytometryFilter.yRangeEnd,
              y1: cytometryFilter.yRangeStart,
              yref: 'y'
            }
          ]
        : [])
    ]
  };

  return (
    <Box sx={sx.container}>
      <Box sx={sx.headerWrapper}>
        <Box sx={sx.selectWrapper}>
          <Typography sx={sx.selectLabel}>X Axis Source: </Typography>
          <GxSelect
            fullWidth
            placeholder="Select Data Source"
            MenuProps={{ sx: { zIndex: 3000 } }}
          >
            <MenuItem>Select One...</MenuItem>
          </GxSelect>
          <Typography sx={sx.selectLabel}>Y Axis Source: </Typography>
          <GxSelect
            fullWidth
            placeholder="Select Data Source"
            MenuProps={{ sx: { zIndex: 3000 } }}
          >
            <MenuItem>Select One...</MenuItem>
          </GxSelect>
        </Box>
        <CytometrySettingsMenu />
      </Box>

      <Box
        ref={containerRef}
        sx={sx.graphWrapper}
      >
        <Plot
          data={plotData}
          layout={layout as Partial<Layout>}
          style={sx.plot}
          config={{
            modeBarButtons: [['select2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'pan2d', 'autoScale2d', 'resetViews']],
            responsive: true,
            displayModeBar: true
          }}
          onSelected={(e) => {
            if (e?.range) {
              useCellSegmentationLayerStore.setState({
                cytometryFilter: {
                  xRangeProteinName: cytometryFilter?.xRangeProteinName || '',
                  yRangeProteinName: cytometryFilter?.yRangeProteinName || '',
                  xRangeStart: e.range.x[0],
                  xRangeEnd: e.range.x[1],
                  yRangeStart: e.range.y[1],
                  yRangeEnd: e.range.y[0]
                }
              });
            }
          }}
        />
      </Box>
      <GraphRangeInputs
        rangeSource={cytometryFilter}
        onUpdateRange={(newFilter) =>
          useCellSegmentationLayerStore.setState({
            cytometryFilter: newFilter as CytometryFilter
          })
        }
        onClear={() =>
          useCellSegmentationLayerStore.setState({
            cytometryFilter: undefined
          })
        }
      />
    </Box>
  );
};

const styles = (theme: Theme) => ({
  container: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1px'
  },
  graphWrapper: {
    overflow: 'hidden'
  },
  plot: {
    width: '100%'
  },
  headerWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    backgroundColor: theme.palette.gx.primary.white,
    gap: '16px',
    padding: '8px'
  },
  selectLabel: {
    textAlign: 'right',
    textWrap: 'nowrap',
    fontWeight: 'bold'
  }
});
