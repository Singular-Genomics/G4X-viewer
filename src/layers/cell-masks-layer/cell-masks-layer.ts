import { CompositeLayer } from '@deck.gl/core/typed';
import { CellMasksLayerProps } from './cell-masks-layer.types';
import { PolygonLayer } from '@deck.gl/layers/typed';
import * as protobuf from 'protobufjs';
import { CellMasksSchema } from './cell-masks-schema';
import { partition } from 'lodash';

class CellMasksLayer extends CompositeLayer<CellMasksLayerProps> {
  protoRoot: protobuf.Root;

  constructor(props: CellMasksLayerProps) {
    super(props);
    this.protoRoot = protobuf.Root.fromJSON(CellMasksSchema);
  }

  renderLayers() {
    const cellMasksData = (this.protoRoot.lookupType('CellMasks').decode(this.props.masksData) as any).cellMasks;

    let cellsData = [];
    let outlierCellsData = [];

    if (this.props.cellFilters === 'all') {
      cellsData = cellMasksData;
    } else {
      [cellsData, outlierCellsData] = partition(
        cellMasksData,
        (data) => this.props.cellFilters.includes(data.cellName) //TODO: Update the key name.
      );
    }

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
      getLineWidth: 0,
      visible: this.props.showDiscardedPoints
    });

    const polygonLayer = new PolygonLayer({
      id: `sub-cells-layer-${this.props.id}`,
      data: cellsData,
      positionFormat: 'XY',
      stroked: false,
      filled: this.props.showCellFill,
      getPolygon: (d) => d.vertices,
      getLineColor: (d) => d.color,
      getFillColor: (d) => [...d.color, opacityValue] as any,
      getLineWidth: 0,
      pickable: true
    });

    return [outliersPolygonLayer, polygonLayer];
  }
}

CellMasksLayer.layerName = 'CellMasksLayer';
export default CellMasksLayer;
