import { CompositeLayer } from "@deck.gl/core/typed";
import { CellMasksLayerProps } from "./cell-masks-layer.types";
import { PolygonLayer } from "@deck.gl/layers/typed";
import * as protobuf from "protobufjs";
import { CellMasksSchema } from "./cell-masks-schema";

class CellMasksLayer extends CompositeLayer<CellMasksLayerProps> {
  protoRoot: protobuf.Root;

  constructor(props: CellMasksLayerProps) {
    super(props);
    this.protoRoot = protobuf.Root.fromJSON(CellMasksSchema);
  }

  renderLayers() {
    const cellMasksData = (this.protoRoot
      .lookupType("CellMasks")
      .decode(this.props.masksData) as any).cellMasks;

    const opacityValue = Math.round(this.props.cellFillOpacity * 255);

    const polygonLayer = new PolygonLayer({
      data: cellMasksData,
      positionFormat: "XY",
      stroked: this.props.showCellStroke,
      filled: this.props.showCellFill,
      getPolygon: d => d.vertices,
      getLineColor: d => d.color,
      getFillColor: d => ([...d.color, opacityValue] as any),
      getLineWidth: this.props.cellStrokeWidth,
      pickable: true,
    });

    return [polygonLayer];
  }
}

CellMasksLayer.layerName = "CellMasksLayer";
export default CellMasksLayer;
