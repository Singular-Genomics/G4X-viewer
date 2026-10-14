import { CompositeLayer } from '@deck.gl/core';
import { CellMasksLayerProps } from './cell-masks-layer.types';
import { PolygonLayer } from '@deck.gl/layers';
import { DataFilterExtension } from '@deck.gl/extensions';

class CellMasksLayer extends CompositeLayer<CellMasksLayerProps> {
  parsedColorMap: Record<string, number[]>;
  filterExtension = new DataFilterExtension({ filterSize: 1 });

  constructor(props: CellMasksLayerProps) {
    super(props);
    this.parsedColorMap = Object.fromEntries(props.colormap.map((entry) => [entry.clusterId, entry.color]));
  }

  renderLayers() {
    const { cellMasksData, filterValues, showDiscardedPoints } = this.props;
    const opacityValue = Math.round(this.props.cellFillOpacity * 255);

    const layers = [];

    if (showDiscardedPoints) {
      layers.push(
        // Discarded cell segmentatio layer
        new PolygonLayer({
          id: `sub-discarded-cells-layer-${this.props.id}`,
          data: cellMasksData,
          positionFormat: 'XY',
          stroked: this.props.showBoundary,
          filled: this.props.showCellFill,
          getPolygon: (d) => d.vertices,
          getLineColor: [238, 238, 238],
          getFillColor: [238, 238, 238, opacityValue],
          getFilterValue: (_d: unknown, info: { index: number }) => filterValues[info.index],
          filterRange: [1, 1],
          extensions: [this.filterExtension],
          updateTriggers: {
            getFillColor: this.props.cellFillOpacity,
            getFilterValue: filterValues
          },
          getLineWidth: this.props.showBoundary ? this.props.boundaryWidth : 0,
          visible: this.props.visible
        })
      );
    }

    layers.push(
      // Main cell segmentation layer
      new PolygonLayer({
        id: `sub-cells-layer-${this.props.id}`,
        data: cellMasksData,
        positionFormat: 'XY',
        stroked: this.props.showBoundary,
        filled: this.props.showCellFill,
        getPolygon: (d) => d.vertices,
        getLineColor: (d) => (this.parsedColorMap[d.clusterId] as [number, number, number]) || [255, 255, 255],
        getFillColor: (d) => [...(this.parsedColorMap[d.clusterId] || [255, 255, 255]), opacityValue] as any,
        getFilterValue: (_d: unknown, info: { index: number }) => filterValues[info.index],
        filterRange: [2, 2],
        extensions: [this.filterExtension],
        updateTriggers: {
          getFillColor: [this.props.cellFillOpacity, this.props.colormap],
          getLineColor: this.props.colormap,
          getFilterValue: filterValues
        },
        getLineWidth: this.props.showBoundary ? this.props.boundaryWidth : 0,
        pickable: true,
        visible: this.props.visible
      })
    );

    return layers;
  }
}

CellMasksLayer.layerName = 'CellMasksLayer';
export default CellMasksLayer;
