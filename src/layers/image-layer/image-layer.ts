import { CompositeLayer } from '@deck.gl/core';
import { BitmapLayer, XRLayer } from '@vivjs/layers';
import { getImageSize, isInterleaved } from '@vivjs/loaders';

// Tile cache limits for viv MultiscaleImageLayer. Viv tile content has no `byteLength`, so the
// cache is bounded by tile count. At ~2000x1250 px with 1024 px tiles a level needs ~6 (up to 12)
// selected tiles; best-available refinement also keeps the ancestor level, and a one-step zoom
// needs another ~12 tiles of the finer level. Tiles are 2 B/px per channel (see ReleasingXRLayer).
export const IMAGE_TILE_CACHE_PROPS = {
  maxCacheSize: 40,
  maxRequests: 6
};

/**
 * Viv's XRLayer casts tiles to Float32 for linear interpolation and keeps that CPU copy alive via the
 * luma texture props (and `_newTexturesFromLoadThisFrame`) long after it is uploaded to the GPU.
 * Textures are only re-created from `props.channelData` (see XRLayer.updateState), so drop the copy
 * once the upload is done.
 */
class ReleasingXRLayer extends XRLayer {
  updateState(params: any) {
    super.updateState(params);
    const self = this as any;
    self._newTexturesFromLoadThisFrame = null;
    for (const texture of Object.values(self.state.textures ?? {}) as any[]) {
      if (texture?.props) texture.props.data = undefined;
      if (texture?.view?.props) texture.view.props.data = undefined;
    }
  }
}
(ReleasingXRLayer as any).layerName = 'ReleasingXRLayer';

// Same as viv's default MultiscaleImageLayer renderSubLayers, but with ReleasingXRLayer.
export function renderImageTileSubLayers(props: any) {
  const {
    bbox: { left, top, right, bottom },
    index: { x, y, z }
  } = props.tile;
  const { data, id, loader, maxZoom } = props;
  if ([left, bottom, right, top].some((v) => v < 0) || !data) return null;
  if (data.width === 0 || data.height === 0) return null;

  const base = loader[0];
  const { height, width } = getImageSize(base);
  const bounds = [left, data.height < base.tileSize ? height : bottom, data.width < base.tileSize ? width : right, top];

  if (isInterleaved(base.shape)) {
    const { photometricInterpretation = 2 } = base.meta;
    return new (BitmapLayer as any)(props, {
      image: data,
      photometricInterpretation,
      bounds,
      id: `tile-sub-layer-${bounds}-${id}`,
      tileId: { x, y, z },
      extensions: []
    });
  }

  return new ReleasingXRLayer(props, {
    channelData: data,
    bounds,
    id: `tile-sub-layer-${bounds}-${id}`,
    tileId: { x, y, z },
    interpolation: z === maxZoom ? 'nearest' : 'linear'
  });
}

/**
 * Composite wrapper so the XRLayer is a child: deck sets `info.sourceLayer` to the child below the
 * top-level picked layer, and VivViewer.onHover returns early when it is null (a bare XRLayer has none).
 */
class ImageBackdropLayer extends CompositeLayer<any> {
  // WORKAROUND (root cause unknown): the first frame after the backdrop is created sometimes leaves it and its lens
  // ring blank, and nothing redraws a still view. Same issue as TranscriptTileLayer.scheduleSettleRedraw.
  initializeState() {
    this.state = { settleRedraw: requestAnimationFrame(() => (this.getCurrentLayer() as any)?.setNeedsRedraw()) };
  }

  finalizeState(context: any) {
    cancelAnimationFrame(this.state.settleRedraw as number);
    super.finalizeState(context);
  }

  renderLayers() {
    return new (XRLayer as any)(this.props, {
      id: `image-backdrop-sub-layer-${this.props.id}`,
      bounds: this.props.bounds,
      channelData: this.props.backdropChannelData
    });
  }
}
(ImageBackdropLayer as any).layerName = 'ImageBackdropLayer';

/**
 * Stand-in for a hidden multiplex layer. Viv's MultiscaleImageLayer cannot be kept mounted without
 * fetching (its background ImageLayer fetches the lowest level; with `selections: []` it draws nothing),
 * so a single XRLayer covering the full image (2^(levels-1) x the lowest level, as viv's background does)
 * is drawn instead. It has a 1x1 texture and no visible channels, so it renders opaque black like viv's
 * background, keeps viv's lens extension (ring), and is pickable so VivViewer.onHover reports the cursor
 * coordinate (it reads `channelData` out of range, giving "no value" pixel readouts).
 * `id` must contain the viv view id suffix so VivViewer.layerFilter keeps it in the detail view.
 */
export function createImageBackdropLayer(id: string, loader: any[], props: any) {
  const { height, width } = getImageSize(loader[loader.length - 1]);
  const scale = 2 ** (loader.length - 1);
  const { loader: _loader, selections, ...rest } = props;
  return new ImageBackdropLayer({
    ...rest,
    id,
    bounds: [0, height * scale, width * scale, 0],
    selections: selections?.slice(0, 1),
    channelsVisible: [false],
    contrastLimits: [[0, 65535]],
    colors: [[255, 255, 255]],
    dtype: 'Uint16',
    interpolation: 'nearest',
    backdropChannelData: { data: [new Uint16Array(1)], width: 1, height: 1 },
    // CompositeLayer defaults to pickable: false, which the XRLayer child inherits; without picks
    // VivViewer.onHover never fires and the coordinate readout freezes.
    pickable: true
  });
}
