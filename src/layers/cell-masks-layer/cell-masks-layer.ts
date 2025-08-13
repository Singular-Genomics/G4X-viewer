import { CompositeLayer } from '@deck.gl/core';
import { CellMasksLayerProps } from './cell-masks-layer.types';
import { PolygonLayer } from '@deck.gl/layers';
import * as protobuf from 'protobufjs';
import { CellMasksSchema } from './cell-masks-schema';

class CellMasksLayer extends CompositeLayer<CellMasksLayerProps> {
  protoRoot: protobuf.Root;

  constructor(props: CellMasksLayerProps) {
    super(props);
    this.protoRoot = protobuf.Root.fromJSON(CellMasksSchema);
  }

  renderLayers() {
    const cellsData = this.props.preFilteredUnselectedCells || [];
    const outlierCellsData = this.props.preFilteredOutlierCells || [];

    const opacityValue = Math.round(this.props.cellFillOpacity * 255);

    const outliersPolygonLayer = new PolygonLayer({
      id: `sub-discarded-cells-layer-${this.props.id}`,
      data: outlierCellsData,
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
    });

    const cellsPolygonLayer = new PolygonLayer({
      id: `sub-cells-layer-${this.props.id}`,
      data: cellsData,
      positionFormat: 'XY',
      stroked: false,
      filled: this.props.showCellFill,
      getPolygon: (d) => d.vertices,
      getLineColor: (d) => d.color,
      getFillColor: (d) => [...d.color, opacityValue] as any,
      updateTriggers: {
        getFillColor: this.props.cellFillOpacity
      },
      getLineWidth: 0,
      pickable: true,
      visible: this.props.visible
    });

    return [outliersPolygonLayer, cellsPolygonLayer];
  }
}

CellMasksLayer.layerName = 'CellMasksLayer';
export default CellMasksLayer;
