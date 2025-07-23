import { CompositeLayer } from '@deck.gl/core';
import { CellMasksLayerProps } from './cell-masks-layer.types';
import { PolygonLayer } from '@deck.gl/layers';
import * as protobuf from 'protobufjs';
import { CellMasksSchema } from './cell-masks-schema';
import { partition } from 'lodash';
import { SingleMask } from '../../shared/types';

class CellMasksLayer extends CompositeLayer<CellMasksLayerProps> {
  protoRoot: protobuf.Root;

  constructor(props: CellMasksLayerProps) {
    super(props);
    this.protoRoot = protobuf.Root.fromJSON(CellMasksSchema);
  }

  renderLayers() {
    let cellsData: SingleMask[] = [];
    let outlierCellsData: SingleMask[] = [];

    if (this.props.cellNameFilters === 'all') {
      cellsData = this.props.masksData;
    } else {
      [cellsData, outlierCellsData] = partition(this.props.masksData, (data) =>
        this.props.cellNameFilters.includes(data.clusterId)
      );
    }

    const { proteins, range } = this.props.cellCytometryFilter;
    if (range && !!proteins.xAxis && !!proteins.yAxis) {
      cellsData = cellsData.filter(
        (cell) =>
          cell.proteins[proteins.xAxis as string] <= range.xEnd &&
          cell.proteins[proteins.xAxis as string] >= range.xStart &&
          cell.proteins[proteins.yAxis as string] >= range.yEnd &&
          cell.proteins[proteins.yAxis as string] <= range.yStart
      );
    }

    const umapRange = this.props.umapFilter;
    if (umapRange) {
      cellsData = cellsData.filter(
        (cell) =>
          cell.umapValues.umapX >= umapRange.xStart &&
          cell.umapValues.umapX <= umapRange.xEnd &&
          cell.umapValues.umapY <= umapRange.yStart &&
          cell.umapValues.umapY >= umapRange.yEnd
      );
    }

    const selectedCellIds = new Set(this.props.selectedCells.map((cell: any) => cell.cellId));

    const selectedCellsData = [];
    const unselectedCellsData = [];

    for (const cell of cellsData) {
      if (selectedCellIds.has(cell.cellId)) {
        selectedCellsData.push(cell);
      } else {
        unselectedCellsData.push(cell);
      }
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
      updateTriggers: {
        getFillColor: this.props.cellFillOpacity
      },
      getLineWidth: 0,
      visible: this.props.visible && this.props.showDiscardedPoints
    });

    const unselectedPolygonLayer = new PolygonLayer({
      id: `sub-cells-layer-${this.props.id}`,
      data: unselectedCellsData,
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

    const selectedPolygonLayer = new PolygonLayer({
      id: `sub-selected-cells-layer-${this.props.id}`,
      data: selectedCellsData,
      positionFormat: 'XY',
      stroked: true,
      filled: this.props.showCellFill,
      getPolygon: (d) => d.vertices,
      getLineColor: [255, 255, 255],
      getFillColor: (d) => [...d.color, opacityValue] as any,
      getLineWidth: 1,
      lineWidthUnits: 'pixels',
      pickable: true,
      visible: selectedCellsData.length > 0
    });

    return [outliersPolygonLayer, unselectedPolygonLayer, selectedPolygonLayer];
  }
}

CellMasksLayer.layerName = 'CellMasksLayer';
export default CellMasksLayer;
