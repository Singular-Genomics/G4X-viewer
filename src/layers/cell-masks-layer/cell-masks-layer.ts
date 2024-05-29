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

      console.log(cellMasksData[0].color)

    const polygonLayer = new PolygonLayer({
      data: cellMasksData,
      positionFormat: "XY",
      getPolygon: d => d.vertices,
      getLineColor: d => d.color,
      getFillColor: d => [d.color[0], d.color[1], d.color[2], 128],
      getLineWidth: 10,
      pickable: true,
    });

    return [polygonLayer];
  }
}

CellMasksLayer.layerName = "CellMasksLayer";
export default CellMasksLayer;
