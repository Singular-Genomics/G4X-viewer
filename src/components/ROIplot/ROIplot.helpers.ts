import type { Layout } from 'plotly.js';
import type { ROIplotDataPoint } from './ROIplot.types';
import { ROIData } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';

function processROIPlotData(cellsData: ROIData, selectedGene: string): ROIplotDataPoint[] {
  const geneData: ROIplotDataPoint[] = [];
  console.table(cellsData);

  Object.entries(cellsData).forEach(([roiName, roiData]) => {
    const { cells } = roiData;

    // Process gene data
    if (selectedGene && cells.length > 0) {
      const geneValues: number[] = cells
        .map((cell) => cell.metrics.find((metric) => metric.name === selectedGene)?.value)
        .filter((value): value is number => typeof value === 'number' && !isNaN(value));

      if (geneValues.length > 0) {
        geneData.push({
          roiName,
          values: geneValues,
          geneName: selectedGene
        });
      }
    }
  });

  console.log('geneData', geneData);
  console.table(geneData);

  return geneData;
}

function createPlotlyBoxplotData(dataPoints: ROIplotDataPoint[]) {
  // Flatten the data for Plotly boxplot format
  const y: number[] = [];
  const x: string[] = [];

  dataPoints.forEach((point) => {
    point.values.forEach((value) => {
      y.push(value);
      x.push(point.roiName);
    });
  });

  return {
    type: 'box' as const,
    y,
    x,
    xaxis: 'x',
    yaxis: 'y',
    name: dataPoints[0].geneName,
    boxpoints: 'outliers' as const
  };
}

export const createPlotlyBoxplotDataForMultipleGenes = (selectedGenes: string[], plotsData: ROIData): string => {
  const allPlotData: ReturnType<typeof createPlotlyBoxplotData>[] = [];

  // Calculate optimal grid layout
  const numGenes = selectedGenes.length;

  selectedGenes.forEach((gene, index) => {
    const geneData = processROIPlotData(plotsData, gene);
    if (geneData && geneData.length > 0) {
      // boxplotData plotly JS format
      const boxplotData = createPlotlyBoxplotData(geneData);

      // Assign to specific subplot axes
      const subplotIndex = index + 1;
      boxplotData.yaxis = subplotIndex === 1 ? 'y' : `y${subplotIndex}`;

      allPlotData.push(boxplotData);
    }
  });

  if (allPlotData.length === 0) {
    return '';
  }

  const gridLayout = { rows: numGenes, cols: 1 };
  console.log('Plot data created for subplots:', { allPlotData, gridLayout });
  // Create subplot layout

  const layout = createSubplotLayout(gridLayout.rows, gridLayout.cols, selectedGenes);

  // Create standalone HTML page with embedded plot
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Boxplot Analysis: ${selectedGenes.join(', ')}</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        #plot { width: 100%; height: calc(100vh - 60px); }
        h1 { margin: 0 0 20px 0; color: #333; }
    </style>
</head>
<body>
    <h1>Boxplot Analysis: ${selectedGenes.join(', ')}</h1>

    <div id="plot"></div>
    <script>
        const plotData = ${JSON.stringify(allPlotData)};
        const layout = ${JSON.stringify(layout)};

        const config = {
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false,
            responsive: true
        };

        Plotly.newPlot('plot', plotData, layout, config);
        window.addEventListener('resize', () => Plotly.Plots.resize('plot'));
    </script>
</body>
</html>`;

  return htmlContent;
};
function createSubplotLayout(rows: number, cols: number, genes: string[]): Partial<Layout> {
  const layout: Partial<Layout> = {
    margin: {
      l: Math.max(60, cols > 2 ? 40 : 60),
      r: 50,
      b: Math.max(80, rows > 2 ? 60 : 80),
      t: Math.max(100, rows > 1 ? 120 : 80)
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    autosize: true,
    showlegend: false
  };

  // Calculate subplot positioning with better spacing
  const totalHorizontalSpacing = cols > 1 ? 0.15 : 0;
  const totalVerticalSpacing = rows > 1 ? 0.15 : 0;
  const horizontalSpacing = cols > 1 ? totalHorizontalSpacing / (cols - 1) : 0;
  const verticalSpacing = rows > 1 ? totalVerticalSpacing / (rows - 1) : 0;
  const subplotWidth = (1 - totalHorizontalSpacing) / cols;
  const subplotHeight = (1 - totalVerticalSpacing) / rows;

  genes.forEach((gene, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const subplotIndex = index + 1;

    // Calculate domain positions
    const xStart = col * (subplotWidth + horizontalSpacing);
    const xEnd = xStart + subplotWidth;
    const yStart = 1 - (row + 1) * (subplotHeight + verticalSpacing);
    const yEnd = yStart + subplotHeight;

    // Define axes
    const xaxisKey = 'xaxis' + (subplotIndex === 1 ? '' : subplotIndex);
    const yaxisKey = 'yaxis' + (subplotIndex === 1 ? '' : subplotIndex);

    (layout as any)[xaxisKey] = {
      domain: [xStart, xEnd],
      anchor: 'y' + (subplotIndex === 1 ? '' : subplotIndex),
      title: 'ROI',
      tickangle: -45
    };

    (layout as any)[yaxisKey] = {
      domain: [yStart, yEnd],
      anchor: 'x' + (subplotIndex === 1 ? '' : subplotIndex),
      title: 'Expression'
    };

    // Add subplot title as annotation
    layout.annotations = layout.annotations || [];
    layout.annotations.push({
      text: '<b>' + gene + '</b>',
      x: (xStart + xEnd) / 2,
      y: yEnd + 0.02,
      xref: 'paper',
      yref: 'paper',
      xanchor: 'center',
      yanchor: 'bottom',
      showarrow: false,
      font: { size: 14, color: '#333' }
    });
  });

  return layout;
}
