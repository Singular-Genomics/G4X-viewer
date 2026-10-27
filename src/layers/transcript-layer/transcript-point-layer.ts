import { Layer, LayerContext, UpdateParameters, UNIT, color, picking, project32 } from '@deck.gl/core';
import type { DefaultProps, LayerProps } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import type { Device } from '@luma.gl/core';
import { Model } from '@luma.gl/engine';

import { fs, vs, transcriptPointUniforms } from './transcript-point-layer.glsl';

/** `?txPointLayer=0` selects the stock ScatterplotLayer (A/B comparison) */
export const POINT_LAYER_ENABLED =
  typeof window === 'undefined' || new URLSearchParams(window.location.search).get('txPointLayer') !== '0';

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];
const SMOOTH_EDGE_RADIUS = 0.5;

export type TranscriptPointLayerProps = {
  /** Pixels (only `radiusUnits: 'pixels'` is supported) */
  getRadius?: number;
  radiusUnits?: 'pixels';
  filled?: boolean;
  stroked?: boolean;
  getLineWidth?: number;
  lineWidthUnits?: 'meters' | 'common' | 'pixels';
  antialiasing?: boolean;
  /** Constant; rgb is normally replaced by the gene lookup, alpha is used */
  getFillColor?: number[];
  getLineColor?: number[];
  /** Read by the parent's pick culling and picking resolution */
  bucket?: unknown;
  pickBounds?: unknown;
};

const defaultProps: DefaultProps<TranscriptPointLayerProps> = {
  getPosition: { type: 'accessor', value: (x: any) => x.position },
  getRadius: 1,
  radiusUnits: 'pixels',
  filled: true,
  stroked: false,
  getLineWidth: 1,
  lineWidthUnits: 'meters',
  antialiasing: true,
  getFillColor: DEFAULT_COLOR,
  getLineColor: DEFAULT_COLOR
} as any;

const maxPointSizes = new WeakMap<Device, number>();

/** Largest `gl_PointSize` (device pixels) the GPU draws; WebGL only guarantees 1 */
export function getMaxPointSize(device: Device): number {
  let size = maxPointSizes.get(device);
  if (size === undefined) {
    const gl = (device as any).gl as WebGL2RenderingContext | undefined;
    const range = gl?.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array | undefined;
    size = range && range.length > 1 ? range[1] : 1;
    maxPointSizes.set(device, size);
  }
  return size;
}

/** One vertex per point, drawn as a GL point sprite. Same disc/ring/antialiasing maths as ScatterplotLayer. */
export class TranscriptPointLayer extends Layer<Required<TranscriptPointLayerProps> & LayerProps> {
  static layerName = 'TranscriptPointLayer';
  static defaultProps = defaultProps;

  getShaders() {
    return super.getShaders({ vs, fs, modules: [project32, color, picking, transcriptPointUniforms] });
  }

  initializeState() {
    const attributeManager = this.getAttributeManager()!;
    attributeManager.remove(['instancePickingColors']);
    attributeManager.add({
      pointPositions: { size: 2, type: 'float32', accessor: 'getPosition' },
      pickingColors: {
        type: 'uint8',
        size: 4,
        noAlloc: true,
        update: this.calculateInstancePickingColors
      }
    });
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);
    if (params.changeFlags.extensionsChanged) {
      (this.state.model as Model | undefined)?.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager()!.invalidateAll();
    }
  }

  draw() {
    const { stroked, filled, antialiasing, lineWidthUnits, getRadius, getLineWidth, getFillColor, getLineColor } =
      this.props;
    const rgba = filled ? getFillColor : getLineColor;
    const model = this.state.model as Model;
    model.shaderInputs.setProps({
      transcriptPoint: {
        color: [rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, (rgba[3] ?? 255) / 255],
        radiusPixels: getRadius,
        lineWidth: getLineWidth,
        stroked: stroked ? 1 : 0,
        filled: filled ? 1 : 0,
        antialiasing: antialiasing ? 1 : 0,
        maxPointSize: getMaxPointSize(this.context.device),
        lineWidthUnits: UNIT[lineWidthUnits]
      }
    });
    model.setVertexCount(this.getNumInstances());
    model.draw(this.context.renderPass);
  }

  _getModel() {
    return new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      topology: 'point-list',
      isInstanced: false,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts({ isInstanced: false }),
      vertexCount: 0
    });
  }
}

type SpriteProps = Record<string, any> & {
  getRadius: number;
  getLineWidth?: number;
  stroked?: boolean;
  lineWidthUnits?: 'meters' | 'common' | 'pixels';
  antialiasing?: boolean;
};

/** Sprite diameter in device pixels this draw needs (CSS radius + stroke + antialiasing rim) */
function neededSpriteSize(context: LayerContext, props: SpriteProps): number {
  const dpr = context.device.canvasContext?.cssToDeviceRatio() ?? 1;
  let radius = props.getRadius;
  if (props.stroked) {
    const width = props.getLineWidth ?? 1;
    radius += (props.lineWidthUnits === 'pixels' ? width : width * (context.viewport?.scale ?? 1)) / 2;
  }
  if (props.antialiasing !== false) radius += SMOOTH_EDGE_RADIUS;
  return 2 * radius * dpr;
}

// deck stacks coplanar layers with a per-layer polygon offset, which GL ignores for POINTS: with the default LEQUAL
// depth test the points would lose to the image layers drawn before them. Draw order alone decides.
const POINT_PARAMETERS = { depthCompare: 'always' } as const;

/** Point-sprite layer, or a stock ScatterplotLayer when disabled or when the sprite exceeds the GPU's point size limit */
export function createPointLayer(context: LayerContext, props: SpriteProps): Layer {
  const usePoints = POINT_LAYER_ENABLED && neededSpriteSize(context, props) <= getMaxPointSize(context.device);
  return usePoints
    ? new TranscriptPointLayer({ ...props, parameters: { ...POINT_PARAMETERS, ...props.parameters } } as any)
    : new ScatterplotLayer(props as any);
}
