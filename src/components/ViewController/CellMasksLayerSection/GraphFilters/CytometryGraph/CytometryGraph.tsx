import { alpha, Box, Theme, Typography, useTheme } from "@mui/material";
import { CytometryGraphProps } from "./CytometryGraph.types";
import Plot from "react-plotly.js";
import { Data, Layout } from "plotly.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import { useCellSegmentationLayerStore } from "../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import { GxSelect } from "../../../../../shared/components/GxSelect";
import { GetBrandColorscale } from "./CytometryGraph.helpers";
import { CytometryGraphInputs } from "./CytometryGraphInputs";

export const CytometryGraph = ({
  data,
  binSize = 100,
}: CytometryGraphProps) => {
  const containerRef = useRef(null);
  const theme = useTheme();
  const sx = styles(theme);

  const { cytometryFilter } = useCellSegmentationLayerStore();
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        if (!entries || !entries[0]) return;

        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }, 25)
    );

    resizeObserver.observe(containerEl);

    return () => {
      if (containerEl) {
        resizeObserver.unobserve(containerEl);
      }
    };
  }, []);

  const heatmapData = useMemo(() => {
    if (!data.length) return { z: [[0]], x: [0], y: [0], xMax: 0, yMax: 0 };

    const xValues = data.map((p) => p.value_X);
    const yValues = data.map((p) => p.value_Y);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    const xBins = Math.ceil((xMax - xMin) / binSize) + 1;
    const yBins = Math.ceil((yMax - yMin) / binSize) + 1;

    const zMatrix: number[][] = Array(yBins)
      .fill(0)
      .map(() => Array(xBins).fill(0));

    const xAxis = Array(xBins)
      .fill(0)
      .map((_, i) => xMin + i * binSize);
    const yAxis = Array(yBins)
      .fill(0)
      .map((_, i) => yMin + i * binSize);

    data.forEach((point) => {
      const xBin = Math.floor((point.value_X - xMin) / binSize);
      const yBin = Math.floor((point.value_Y - yMin) / binSize);

      if (xBin >= 0 && xBin < xBins && yBin >= 0 && yBin < yBins) {
        zMatrix[yBin][xBin] += point.count;
      }
    });

    return {
      z: zMatrix,
      x: xAxis,
      y: yAxis,
      xMax: xMax,
      yMax: yMax,
    };
  }, [data, binSize]);

  const plotData: Data[] = [
    {
      type: "heatmap",
      z: heatmapData.z,
      x: heatmapData.x,
      y: heatmapData.y,
      colorscale: GetBrandColorscale(),
      showscale: true,
      hoverinfo: "x+y+z",
      hovertemplate: "X: %{x}<br>Y: %{y}<br>Count: %{z}<extra></extra>",
      zmin: 0,
      zmax: 15,
    },
  ];

  const layout = {
    dragmode: "select",
    hovermode: "closest",
    margin: { t: 50, r: 100, b: 80, l: 100 },
    paper_bgcolor: theme.palette.gx.primary.white,
    plot_bgcolor: theme.palette.gx.lightGrey[900],
    xaxis: {
      title: {
        text: "Test X",
        font: { size: 14 },
      },
      type: "linear",
      autorange: true,
      linewidth: 2,
      mirror: true,
      tickmode: "array",
      tickfont: { size: 12 },
      exponentformat: "power",
    },
    yaxis: {
      title: {
        text: "Test Y",
        font: { size: 14 },
        standoff: 10,
      },
      type: "linear",
      autorange: true,
      linewidth: 2,
      mirror: true,
      tickmode: "array",
      tickfont: { size: 12 },
      exponentformat: "power",
      scaleanchor: "x",
      scaleratio: 1,
    },
    width: dimensions.width,
    height: dimensions.height,
    activeselection: {
      opacity: 1,
      fillcolor: alpha(theme.palette.gx.primary.black, 0.1),
    },
    selections: [
      ...(cytometryFilter
        ? [
            {
              line: {
                color: theme.palette.gx.primary.black,
                width: 2,
                dash: "solid",
              },
              opacity: 1,
              type: "rect",
              x0: cytometryFilter.xRangeStart,
              x1: cytometryFilter.xRangeEnd,
              xref: "x",
              y0: cytometryFilter.yRangeEnd,
              y1: cytometryFilter.yRangeStart,
              yref: "y",
            },
          ]
        : []),
    ],
  };

  return (
    <Box sx={sx.container}>
      <Box sx={sx.selectWrapper}>
        <Typography sx={sx.selectLabel}>X Axis Source: </Typography>
        <GxSelect fullWidth placeholder="Select Data Source"></GxSelect>
        <Typography sx={sx.selectLabel}>Y Axis Source: </Typography>
        <GxSelect fullWidth placeholder="Select Data Source"></GxSelect>
      </Box>
      <Box ref={containerRef} sx={sx.graphWrapper}>
        <Plot
          data={plotData}
          layout={layout as Partial<Layout>}
          style={sx.plot}
          config={{
            modeBarButtons: [
              [
                "select2d",
                "zoom2d",
                "zoomIn2d",
                "zoomOut2d",
                "pan2d",
                "autoScale2d",
                "resetViews",
              ],
            ],
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
          }}
          onSelected={(e) => {
            if (e?.range) {
              useCellSegmentationLayerStore.setState({
                cytometryFilter: {
                  xRangeProteinName: "Protein-1",
                  xRangeStart: e.range.x[0],
                  xRangeEnd: e.range.x[1],
                  yRangeProteinName: "Protein-2",
                  yRangeStart: e.range.y[1],
                  yRangeEnd: e.range.y[0],
                },
              });
            }
          }}
        />
      </Box>
      <Box sx={sx.inputWrapper}>
        <CytometryGraphInputs />
      </Box>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  container: {
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1px",
  },
  graphWrapper: {
    overflow: "hidden",
  },
  plot: {
    width: "100%",
  },
  selectWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: theme.palette.gx.primary.white,
    paddingBlock: "8px",
    paddingInline: "24px",
  },
  selectLabel: {
    textAlign: "right",
    textWrap: "nowrap",
    fontWeight: "bold",
  },
  inputWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr) 150px",
    justifyContent: "space-between",
    alignItems: "start",
    gap: "8px",
    paddingBlock: "16px",
    height: "min-content",
    marginTop: "auto",
    backgroundColor: theme.palette.gx.primary.white,
    paddingInline: "24px",
  },
});
