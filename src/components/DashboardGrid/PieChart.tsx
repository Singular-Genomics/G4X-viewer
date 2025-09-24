import Plot from 'react-plotly.js';
import { Layout } from 'plotly.js';
export function PieChart() {
  const layout = {
    grid: { rows: 1, columns: 2 },
    margin: { l: 0, r: 0, b: 0, t: 60 },
    paper_bgcolor: '#2d3748',
    showlegend: true,
    legend: {
      font: {
        color: '#fff',
        size: 14
      }
    },
    annotations: [
      {
        text: 'ROI1',
        font: { color: '#fff', size: 16 },
        x: 0.225, // Center of first subplot
        y: 1.08,
        xref: 'paper',
        yref: 'paper',
        showarrow: false
      },
      {
        text: 'ROI2',
        font: { color: '#fff', size: 16 },
        x: 0.775,
        y: 1.08,
        xref: 'paper',
        yref: 'paper',
        showarrow: false
      }
    ]
  };
  const allLabels = ['Cluster 1', 'Cluster 2', 'Cluster 3'];
  const data: any[] = [
    {
      type: 'pie',
      labels: allLabels,
      values: [2, 1, 3], // ROI 1 has 2 cells in cluster 1, 1 in cluster 2
      name: 'ROI 1',
      marker: { colors: ['#1f77b4', '#f458', '#ff7f0e'] },
      domain: { x: [0, 0.45], y: [0, 1] },
      showlegend: true,
      legendgroup: 'clusters',
      textinfo: 'label+percent'
    },
    {
      type: 'pie',
      labels: allLabels,
      values: [1, 0, 2], // ROI 2 has 1 cell in cluster 1, 2 in cluster 3
      name: 'ROI 2',
      marker: { colors: ['#1f77b4', '#f458', '#ff7f0e'] },
      domain: { x: [0.55, 1], y: [0, 1] },
      showlegend: false,
      legendgroup: 'clusters',
      textinfo: 'label+percent'
    }
  ];
  return (
    <Plot
      data={data}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
      layout={layout as Partial<Layout>}
      config={{
        scrollZoom: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d']
      }}
    />
  );
}
