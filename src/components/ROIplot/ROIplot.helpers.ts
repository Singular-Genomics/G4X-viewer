import { CellsExportData } from '../PolygonImportExport/PolygonImportExport.types';
import { ROIplotDataPoint, ProcessedROIplotData } from './ROIplot.types';

export function processROIPlotData(cellsData: CellsExportData, selectedGene: string): ProcessedROIplotData {
  const geneData: ROIplotDataPoint[] = [];

  Object.entries(cellsData).forEach(([roiName, roiData]) => {
    const { cells, polygonId } = roiData;

    // Process gene data
    if (selectedGene && cells.length > 0) {
      const geneValues: number[] = cells
        .map((cell) => cell.transcript?.[selectedGene])
        .filter((value): value is number => typeof value === 'number' && !isNaN(value));

      if (geneValues.length > 0) {
        geneData.push({
          roiName,
          values: geneValues,
          polygonId
        });
      }
    }
  });

  return { geneData };
}

export function createPlotlyBoxplotData(dataPoints: ROIplotDataPoint[], name: string) {
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
    name,
    boxpoints: 'outliers' as const
  };
}

export const createPlotlyBoxplotDataForMultipleGenes = (
  selectedGenes: string[],
  plotsData: CellsExportData
): string => {
  const allPlotData: any[] = [];

  // Calculate optimal grid layout
  const numGenes = selectedGenes.length;
  let cols, rows;

  if (numGenes === 1) {
    cols = 1;
    rows = 1;
  } else if (numGenes === 2) {
    cols = 2;
    rows = 1;
  } else if (numGenes <= 4) {
    cols = 2;
    rows = Math.ceil(numGenes / 2);
  } else if (numGenes <= 6) {
    cols = 3;
    rows = Math.ceil(numGenes / 3);
  } else {
    cols = Math.ceil(Math.sqrt(numGenes));
    rows = Math.ceil(numGenes / cols);
  }

  selectedGenes.forEach((gene, index) => {
    const { geneData } = processROIPlotData(plotsData, gene);
    if (geneData && geneData.length > 0) {
      const boxplotData = createPlotlyBoxplotData(geneData, gene);

      // Assign to specific subplot axes
      const subplotIndex = index + 1;
      (boxplotData as any).xaxis = subplotIndex === 1 ? 'x' : `x${subplotIndex}`;
      (boxplotData as any).yaxis = subplotIndex === 1 ? 'y' : `y${subplotIndex}`;

      allPlotData.push(boxplotData);
    }
  });

  if (allPlotData.length === 0) {
    return '';
  }

  const plotData = allPlotData;
  const gridLayout = { rows, cols };
  console.log('Plot data created for subplots:', { plotData, gridLayout });

  // Create standalone HTML with embedded plot
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
    <h1>Piechart Analysis: ${selectedGenes.join(', ')}</h1>

    <div id="plot"></div>
    <script>
        const plotData = ${JSON.stringify(plotData)};
        const gridLayout = ${JSON.stringify(gridLayout)};
        const selectedGenes = ${JSON.stringify(selectedGenes)};

        // Create subplot layout
        function createSubplotLayout(rows, cols, genes) {
            const layout = {
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

                layout[xaxisKey] = {
                    domain: [xStart, xEnd],
                    anchor: 'y' + (subplotIndex === 1 ? '' : subplotIndex),
                    title: 'ROI',
                    tickangle: -45
                };

                layout[yaxisKey] = {
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

        const layout = createSubplotLayout(gridLayout.rows, gridLayout.cols, selectedGenes);

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
