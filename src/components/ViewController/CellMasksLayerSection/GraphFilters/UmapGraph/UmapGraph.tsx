import { Box, darken, useTheme } from "@mui/material";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { GraphRangeInputs } from "../GraphRangeInputs";
import { useCellSegmentationLayerStore } from "../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import { Layout } from "plotly.js";
import { UmapGraphProps } from "./UmapGraph.types";
import { UmapFilter } from "../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types";

export const UmapGraph = ({ data }: UmapGraphProps) => {
  const theme = useTheme();
  const sx = styles();

  const containerRef = useRef(null);
  const { umapFilter } = useCellSegmentationLayerStore();
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

  const layout = {
    width: dimensions.width,
    height: dimensions.height,
    dragmode: "select",
    margin: { l: 50, r: 50, b: 50, t: 50 },
    selections: [
      ...(umapFilter
        ? [
            {
              line: {
                color: theme.palette.gx.primary.black,
                width: 2,
                dash: "solid",
              },
              opacity: 1,
              type: "rect",
              x0: umapFilter.xRangeStart,
              x1: umapFilter.xRangeEnd,
              xref: "x",
              y0: umapFilter.yRangeEnd,
              y1: umapFilter.yRangeStart,
              yref: "y",
            },
          ]
        : []),
    ],
  };

  return (
    <Box sx={sx.container}>
      <Box ref={containerRef} sx={sx.graphWrapper}>
        <Plot
          data={[
            {
              x: data.map((point) => point.value_X),
              y: data.map((point) => point.value_Y),
              mode: "markers",
              type: "scatter",
              marker: {
                color: darken(theme.palette.gx.accent.greenBlue, 0.25),
              },
            },
          ]}
          style={{
            width: "100%",
          }}
          layout={layout as Partial<Layout>}
          config={{
            displayModeBar: true,
            modeBarButtonsToRemove: ["lasso2d", "toImage"],
          }}
          onSelected={(e) => {
            if (e?.range) {
              useCellSegmentationLayerStore.setState({
                umapFilter: {
                  xRangeStart: e.range.x[0],
                  xRangeEnd: e.range.x[1],
                  yRangeStart: e.range.y[1],
                  yRangeEnd: e.range.y[0],
                },
              });
            }
          }}
        />
      </Box>
      <GraphRangeInputs
        rangeSource={umapFilter}
        onUpdateRange={(newFilter) =>
          useCellSegmentationLayerStore.setState({
            umapFilter: newFilter as UmapFilter,
          })
        }
        onClear={() =>
          useCellSegmentationLayerStore.setState({
            umapFilter: undefined,
          })
        }
      />
    </Box>
  );
};

const styles = () => ({
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
});
