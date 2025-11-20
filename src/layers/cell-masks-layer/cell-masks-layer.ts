import { CompositeLayer } from '@deck.gl/core';
import { CellMasksLayerProps } from './cell-masks-layer.types';
import { PolygonLayer } from '@deck.gl/layers';
import * as protobuf from 'protobufjs';
import { SegmentationFileSchema } from '../../schemas/segmentationFile.schema';

class CellMasksLayer extends CompositeLayer<CellMasksLayerProps> {
  protoRoot: protobuf.Root;
  parsedColorMap: Record<string, number[]>;

  constructor(props: CellMasksLayerProps) {
    super(props);
    this.protoRoot = protobuf.Root.fromJSON(SegmentationFileSchema);
    this.parsedColorMap = Object.fromEntries(props.colormap.map((entry) => [entry.clusterId, entry.color]));
  }

  renderLayers() {
    const { outlierCellsData, cellsData } = this.props;
    const opacityValue = Math.round(this.props.cellFillOpacity * 255);

    const layers = [];

    if (outlierCellsData && outlierCellsData.length) {
      layers.push(
        // Discarded cell segmentatio layer
        new PolygonLayer({
          id: `sub-discarded-cells-layer-${this.props.id}`,
          data: this.props.outlierCellsData,
          positionFormat: 'XY',
          stroked: false,
          filled: this.props.showCellFill,
          getPolygon: (d) => d.vertices,
          getLineColor: [238, 238, 238],
          getFillColor: [238, 238, 238, opacityValue],
          updateTriggers: {
            getFillColor: this.props.cellFillOpacity
          },
          getLineWidth: 0,
          visible: this.props.visible && this.props.showDiscardedPoints
        })
      );
    }

    layers.push(
      // Main cell segmentation layer
      new PolygonLayer({
        id: `sub-cells-layer-${this.props.id}`,
        data: cellsData,
        positionFormat: 'XY',
        stroked: false,
        filled: this.props.showCellFill,
        getPolygon: (d) => d.vertices,
        getLineColor: (d) => (this.parsedColorMap[d.clusterId] as [number, number, number]) || [255, 255, 255],
        getFillColor: (d) => [...(this.parsedColorMap[d.clusterId] || [255, 255, 255]), opacityValue] as any,
        updateTriggers: {
          getFillColor: [this.props.cellFillOpacity, this.props.colormap]
        },
        getLineWidth: 0,
        pickable: true,
        visible: this.props.visible
      })
    );

    return layers;
  }
}

CellMasksLayer.layerName = 'CellMasksLayer';
export default CellMasksLayer;
