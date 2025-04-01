import {
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { GxWindow } from "../../../../shared/components/GxWindow";
import { CytometryGraph } from "./CytometryGraph/CytometryGraph";
import { UmapGraph } from "./UmapGraph/UmapGraph";
import { UmapDataPoint } from "./UmapGraph";
import { CytometryDataPoint } from "./CytometryGraph";

type GraphMode = undefined | "Cytometry" | "Umap";

export const GraphFilters = () => {
  const theme = useTheme();
  const sx = styles(theme);

  const [selectedGraph, setSelectedGraph] = useState<GraphMode>(undefined);
  const [isWindowVisible, setIsWindowVisible] = useState(false);

  const handleGraphChange = useCallback(
    (_: React.MouseEvent, newValue: string) => {
      setSelectedGraph(newValue as GraphMode);
      setIsWindowVisible(!!newValue);
    },
    []
  );

  const mockData = useMemo(() => generateMockData(), []);

  const mockUmapData: UmapDataPoint[] = Array.from({ length: 500 }, () => ({
    value_X: Math.floor(Math.random() * 1000),
    value_Y: Math.floor(Math.random() * 1000),
  }));

  return (
    <>
      <ToggleButtonGroup
        sx={sx.toggleButtonGroup}
        orientation="vertical"
        value={selectedGraph}
        exclusive
        onChange={handleGraphChange}
      >
        <ToggleButton sx={sx.toggleButton} value="Umap">
          UMAP
        </ToggleButton>
        <ToggleButton sx={sx.toggleButton} value="Cytometry">
          Cytometry
        </ToggleButton>
      </ToggleButtonGroup>
      {isWindowVisible && (
        <GxWindow
          title="test"
          onClose={() => {
            setIsWindowVisible(false);
            setSelectedGraph(undefined);
          }}
        >
          {selectedGraph === "Cytometry" ? (
            <CytometryGraph data={mockData || []} />
          ) : (
            <UmapGraph data={mockUmapData} />
          )}
        </GxWindow>
      )}
    </>
  );
};

const styles = (theme: Theme) => ({
  toggleButtonGroup: {
    marginBottom: "16px",
    width: "100%",
  },
  toggleButton: {
    width: "100%",
    display: "flex",
    fontWeight: 700,
    borderColor: theme.palette.gx.primary.black,
    color: theme.palette.gx.primary.black,
    gap: "8px",
    "&.Mui-selected.Mui-disabled": {
      background: theme.palette.gx.mediumGrey[100],
    },
    "&.Mui-selected": {
      background: theme.palette.gx.gradients.brand(),
      color: theme.palette.gx.primary.white,
    },
  },
  toggleButtonLabel: {
    fontSize: "11px",
    textWrap: "nowrap",
  },
});

const generateMockData = (): CytometryDataPoint[] => {
  const data: CytometryDataPoint[] = [];

  const hotspots = [
    { x: 3000, y: 7000, radius: 1000, intensity: 15, points: 3000 },
    { x: 8000, y: 2000, radius: 500, intensity: 10, points: 1500 },
    { x: 2000, y: 3000, radius: 400, intensity: 8, points: 800 },
    { x: 5000, y: 5000, radius: 300, intensity: 6, points: 600 },
    { x: 7000, y: 8000, radius: 350, intensity: 7, points: 700 },
  ];

  hotspots.forEach((hotspot) => {
    for (let i = 0; i < hotspot.points; i++) {
      const angle = Math.random() * Math.PI * 2;

      const distance = Math.pow(Math.random(), 1.5) * hotspot.radius;
      const x = Math.round(hotspot.x + Math.cos(angle) * distance);
      const y = Math.round(hotspot.y + Math.sin(angle) * distance);

      if (x >= 0 && x <= 10000 && y >= 0 && y <= 10000) {
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - hotspot.x, 2) + Math.pow(y - hotspot.y, 2)
        );

        const count =
          Math.round(
            hotspot.intensity *
              Math.pow(1 - distanceFromCenter / hotspot.radius, 1.5)
          ) + 1;

        data.push({ value_X: x, value_Y: y, count });
      }
    }
  });

  const minorClusters = [
    { x: 1500, y: 1500, radius: 200, points: 200 },
    { x: 9000, y: 3500, radius: 250, points: 250 },
    { x: 6500, y: 9000, radius: 180, points: 180 },
    { x: 4000, y: 2000, radius: 220, points: 220 },
    { x: 9000, y: 9000, radius: 200, points: 200 },
  ];

  minorClusters.forEach((cluster) => {
    for (let i = 0; i < cluster.points; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * cluster.radius;
      const x = Math.round(cluster.x + Math.cos(angle) * distance);
      const y = Math.round(cluster.y + Math.sin(angle) * distance);

      if (x >= 0 && x <= 10000 && y >= 0 && y <= 10000) {
        const count = Math.floor(Math.random() * 3) + 1;
        data.push({ value_X: x, value_Y: y, count });
      }
    }
  });

  for (let i = 0; i < 2000; i++) {
    const x = Math.round(Math.random() * 10000);
    const y = Math.round(Math.random() * 10000);
    const count = Math.floor(Math.random() * 2) + 1;
    data.push({ value_X: x, value_Y: y, count });
  }

  return data;
};
