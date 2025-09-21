import type { Layout } from 'plotly.js';
import { ROIData } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';

function groupDataByROI(ROIData: ROIData, selectedGene: string) {
  // Flatten the data for Plotly boxplot format
  //single gene across all RIO
  // x is ROI name
  const boxplotData = {
    name: selectedGene,
    type: 'box',
    y: [] as number[],
    x: [] as string[],
    xaxis: 'x',
    yaxis: 'y',
    boxpoints: 'outliers'
  };

  for (const ROI of ROIData) {
    for (const cell of ROI.cells) {
      const geneMetric = cell.metrics.find((metric) => metric.label === selectedGene);
      if (geneMetric && typeof geneMetric.value === 'number' && !isNaN(geneMetric.value)) {
        boxplotData.y.push(geneMetric.value);
        boxplotData.x.push(ROI.roiName);
      }
    }
  }

  return boxplotData;
}
function groupDataByCluster(ROIData: ROIData, selectedGene: string) {
  // Get all unique cluster IDs and ROI names first
  const allClusterIds = new Set<string>();
  const allROINames = new Set<string>();

  ROIData.forEach(({ roiName, cells }) => {
    allROINames.add(roiName);
    cells.forEach((cell) => {
      if (cell.metrics.some((metric) => metric.label === selectedGene)) {
        allClusterIds.add(cell.clusterId);
      }
    });
  });

  const clusterColors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf'
  ];
  const clusterTraces: any[] = [];

  // Create a trace for each cluster
  Array.from(allClusterIds).forEach((clusterId, clusterIndex) => {
    const trace = {
      name: `Cluster ${clusterId}`,
      type: 'box',
      y: [] as number[],
      x: [] as string[],
      xaxis: 'x',
      yaxis: 'y',
      boxpoints: 'outliers',
      marker: { color: clusterColors[clusterIndex % clusterColors.length] },
      legendgroup: `cluster-${clusterId}`,
      showlegend: true
    };

    // Collect data for this cluster across all ROIs
    ROIData.forEach(({ roiName, cells }) => {
      cells.forEach((cell) => {
        if (cell.clusterId === clusterId) {
          const geneMetric = cell.metrics.find((metric) => metric.label === selectedGene);
          if (geneMetric && typeof geneMetric.value === 'number' && !isNaN(geneMetric.value)) {
            trace.y.push(geneMetric.value);
            trace.x.push(roiName);
          }
        }
      });
    });

    // Only add trace if it has data
    if (trace.y.length > 0) {
      clusterTraces.push(trace);
    }
  });

  return clusterTraces;
}

function createSubplotLayout(
  rows: number,
  cols: number,
  genes: string[],
  title: string,
  boxmode: 'group' | 'overlay' = 'overlay'
): Partial<Layout> {
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
    showlegend: true,
    title: {
      text: title,
      font: { size: 16, color: '#333' }
    },
    boxmode: boxmode,
    annotations: []
  };

  // Calculate subplot positioning with increased spacing
  const totalHorizontalSpacing = cols > 1 ? 0.15 : 0;
  const totalVerticalSpacing = rows > 1 ? Math.min(0.3, 0.1 * rows) : 0; // Increased vertical spacing
  const horizontalSpacing = cols > 1 ? totalHorizontalSpacing / (cols - 1) : 0;
  const verticalSpacing = rows > 1 ? totalVerticalSpacing / (rows - 1) : 0;
  const subplotWidth = (1 - totalHorizontalSpacing) / cols;
  const subplotHeight = (1 - totalVerticalSpacing) / rows;

  genes.forEach((gene, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const subplotIndex = index + 1;
    const isBottomRow = row === rows - 1;

    // Calculate domain positions
    const xStart = col * (subplotWidth + horizontalSpacing);
    const xEnd = xStart + subplotWidth;
    const yStart = 1 - (row + 1) * (subplotHeight + verticalSpacing);
    const yEnd = yStart + subplotHeight;

    // Generate axis keys
    const xaxisKey = subplotIndex === 1 ? 'xaxis' : `xaxis${subplotIndex}`;
    const yaxisKey = subplotIndex === 1 ? 'yaxis' : `yaxis${subplotIndex}`;
    const xanchor = subplotIndex === 1 ? 'y' : `y${subplotIndex}`;
    const yanchor = subplotIndex === 1 ? 'x' : `x${subplotIndex}`;

    // X-axis configuration - only show title on bottom row
    (layout as any)[xaxisKey] = {
      domain: [xStart, xEnd],
      anchor: xanchor,
      tickangle: -45,
      ...(isBottomRow && { title: 'ROI' })
    };

    // Y-axis configuration
    (layout as any)[yaxisKey] = {
      domain: [yStart, yEnd],
      anchor: yanchor,
      title: 'Expression'
    };

    // Add subplot title annotation
    layout.annotations!.push({
      text: `<b>${gene}</b>`,
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

// function filterROIBygenes(Data: ROIData, selectedGenes: string[]) {
//   for (const ROI of Data) {
//     for ( const cell of ROI.cells) {
//       let metrics = cell.metrics;
//       cell.metrics = metrics.filter((metric) => selectedGenes.includes(metric.label));
//   }

// }
export function creatPlots(selectedGenes: string[], plotsData: ROIData): string {
  // Generate individual gene plot data with subplot assignments

  const boxPlotData: ReturnType<typeof groupDataByROI>[] = [];
  selectedGenes.forEach((gene, index) => {
    const boxplotData = groupDataByROI(plotsData, gene);

    // Assign to specific subplot axes
    const subplotIndex = index + 1;
    boxplotData.xaxis = subplotIndex === 1 ? 'x' : `x${subplotIndex}`;
    boxplotData.yaxis = subplotIndex === 1 ? 'y' : `y${subplotIndex}`;

    boxPlotData.push(boxplotData);
  });

  // Generate grouped cluster plot data with subplot assignments
  const clusterPlotData: any[] = [];

  selectedGenes.forEach((gene, index) => {
    // Get unique cluster IDs for this gene
    const currData = groupDataByCluster(plotsData, gene);
    const subplotIndex = index + 1;
    currData.forEach((clusterTrace) => {
      clusterTrace.xaxis = subplotIndex === 1 ? 'x' : `x${subplotIndex}`;
      clusterTrace.yaxis = subplotIndex === 1 ? 'y' : `y${subplotIndex}`;

      // Use offsetgroup to align same clusters at same x position across subplots
      const originalClusterId = clusterTrace.name.replace('Cluster ', '');
      clusterTrace.offsetgroup = `cluster-${originalClusterId}`;

      // Only show legend for the first gene subplot to avoid duplicates
      clusterTrace.showlegend = index === 0;

      clusterPlotData.push(clusterTrace); // Push individual traces, not the array
    });
  });

  if (boxPlotData.length === 0 && clusterPlotData.length === 0) {
    return 'No data to plot';
  }

  const numGenes = selectedGenes.length;
  const individualLayout = createSubplotLayout(numGenes, 1, selectedGenes, 'Individual Gene Expression by ROI');
  const clusterLayout = createSubplotLayout(numGenes, 1, selectedGenes, 'Expression Grouped by Cluster ID', 'group');

  // Create standalone HTML page with two-column layout
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>ROI Boxplot Analysis: ${selectedGenes.join(', ')}</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc; }
    </style>
</head>
<body class="min-h-screen">
    <div class="container mx-auto p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
            ROI Boxplot Analysis: ${selectedGenes.join(', ')}
        </h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column: Individual Gene Plots -->
            <div class="bg-white rounded-lg shadow-lg p-4">
                <div id="individual-plot" class="w-full" style="height: ${Math.max(400, selectedGenes.length * 350)}px;"></div>
            </div>

            <!-- Right Column: Grouped Cluster Plot -->
            <div class="bg-white rounded-lg shadow-lg p-4">
                <div id="cluster-plot" class="w-full" style="height: ${Math.max(400, selectedGenes.length * 350)}px;"></div>
            </div>
        </div>
    </div>

    <script>
        const individualPlotData = ${JSON.stringify(boxPlotData)};
        const clusterPlotData = ${JSON.stringify(clusterPlotData)};
        const individualLayout = ${JSON.stringify(individualLayout)};
        const clusterLayout = ${JSON.stringify(clusterLayout)};

        const config = {
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false,
            responsive: true
        };

        // Create individual gene plot
        if (individualPlotData.length > 0) {
            Plotly.newPlot('individual-plot', individualPlotData, individualLayout, config);
        }

        // Create cluster grouped plot
        if (clusterPlotData.length > 0) {
            Plotly.newPlot('cluster-plot', clusterPlotData, clusterLayout, config);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (individualPlotData.length > 0) {
                Plotly.Plots.resize('individual-plot');
            }
            if (clusterPlotData.length > 0) {
                Plotly.Plots.resize('cluster-plot');
            }
        });

        console.log('Individual plot data:', individualPlotData);
        console.log('Cluster plot data:', clusterPlotData);
    </script>
</body>
</html>`;

  return htmlContent;
}
