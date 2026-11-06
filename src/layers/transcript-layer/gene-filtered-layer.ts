import {
  CompositeLayer,
  FilterContext,
  GetPickingInfoParams,
  Layer,
  LayerContext,
  UpdateParameters
} from '@deck.gl/core';
import type { Texture } from '@luma.gl/core';

import { LAYER_ZOOM_OFFSET } from '../../shared/constants';
import {
  CHUNK_FAILED,
  GeneGroupedTranscriptSource,
  GeneChunk,
  ChunkRef
} from '../../utils/GeneGroupedTranscriptSource';
import {
  GENE_LEVEL_ROW_BUDGET,
  chooseLevel,
  estimateRows,
  planRendered,
  visibleTileRect
} from '../../utils/geneGroupedCore';
import { GENE_LOOKUP_EXTENSIONS, WHITE } from './gene-lookup-extension';
import { createPointLayer } from './transcript-point-layer';
import { GeneBucket, resolveGeneBucketIndex, updateGeneBuckets } from './gene-buckets';
import { PickCuller } from './pick-culling';

export type GeneFilteredTranscriptLayerProps = {
  /** Part of the layer id upstream (a different source means a different layer), so it never changes here */
  source: GeneGroupedTranscriptSource;
  /** Names of the genes passing the filter */
  genes: ReadonlySet<string>;
  /** Gene name -> index into the shared gene lookup texture (GeneRegistry) */
  lookupIndexOf: (name: string) => number | undefined;
  pointSize: number;
  geneLookupTexture: Texture | null;
  geneLookupVersion: number;
  /** Number of pyramid levels of transcripts/ (levels are p0..pLayers) */
  layers: number;
  overrideLayers: boolean;
  maxVisibleLayers: number;
  onLoadingStateChange?: (isLoading: boolean) => void;
  /** Level of the chunks being drawn (null when nothing is drawn / the layer is gone) */
  onLevelChange?: (level: number | null) => void;
  /** Called once every chunk of the view has loaded, each time awaitingReady turns on (initially: once) */
  onReady?: () => void;
  /** The parent waits for onReady (default true) */
  awaitingReady?: boolean;
  /** Hidden (grace period): keeps its chunks, requests nothing until shown again */
  visible?: boolean;
  pickable?: boolean;
  id?: string;
};

type State = {
  level: number | null;
  /** Chunks of the current view; the view is complete when all of them are loaded */
  wanted: ChunkRef[];
  /** Chunks drawn right now: the loaded part of `wanted`, plus the previous view until `wanted` is complete */
  rendered: Map<string, GeneChunk>;
  wantedKeys: Set<string>;
  /** Wanted chunks that are empty / missing: they count as loaded so the view can complete */
  empty: Set<string>;
  /** Wanted chunks whose load failed: drawn as absent (the view can complete) but retried when the view changes */
  failed: Set<string>;
  requested: Set<string>;
  finalized: boolean;
  hidden: boolean;
  pending: number;
  readyReported: boolean;
  viewSignature: string;
  renderVersion: number;
  buckets: Map<string, GeneBucket>;
  reportedLevel: number | null;
  pickCuller: PickCuller;
};

/**
 * Draws only the selected genes, straight from the gene-grouped store: a few binary ScatterplotLayers
 * (chunks merged per level / gene slot / group of 32 chunks, see gene-buckets) with stable ids, so a bucket is uploaded to the
 * GPU once and kept while its member chunks are unchanged.
 * Which level / chunks are needed is recomputed from the viewport (see geneGroupedCore for the rules); decoded chunks
 * are cached (row-capped LRU, viewport pinned) in the source and dropped when this layer is finalized.
 */
export default class GeneFilteredTranscriptLayer extends CompositeLayer<GeneFilteredTranscriptLayerProps> {
  static layerName = 'GeneFilteredTranscriptLayer';

  initializeState() {
    const state: State = {
      level: null,
      wanted: [],
      rendered: new Map(),
      wantedKeys: new Set(),
      empty: new Set(),
      failed: new Set(),
      requested: new Set(),
      finalized: false,
      hidden: false,
      pending: 0,
      readyReported: false,
      viewSignature: '',
      renderVersion: 0,
      buckets: new Map(),
      reportedLevel: null,
      pickCuller: new PickCuller()
    };
    this.setState(state);
  }

  finalizeState(context: LayerContext) {
    super.finalizeState(context);
    const state = this.state as unknown as State;
    state.finalized = true; // late chunk loads must not touch a finalized layer
    this.props.source.clearCache();
    if (state.reportedLevel !== null) this.props.onLevelChange?.(null);
    state.reportedLevel = null;
    // Report idle now: the callback must not depend on the (finalized) parent being reachable later
    const wasLoading = state.pending > 0;
    state.pending = 0;
    if (wasLoading) this.props.onLoadingStateChange?.(false);
  }

  shouldUpdateState({ changeFlags }: UpdateParameters<this>) {
    return changeFlags.somethingChanged;
  }

  updateState({ props, oldProps, changeFlags }: UpdateParameters<this>) {
    const state = this.state as unknown as State;
    // The parent waits for a (new) ready report: send one once the view is complete
    const awaiting = props.awaitingReady !== false && oldProps.awaitingReady === false;
    if (awaiting) state.readyReported = false;
    // Hidden: ignore view changes (queued loads see `hidden` and are skipped), catch up when shown again
    state.hidden = props.visible === false;
    if (state.hidden) return;
    const shown = oldProps.visible === false;
    const viewChanged =
      shown ||
      changeFlags.viewportChanged ||
      props.genes !== oldProps.genes ||
      props.overrideLayers !== oldProps.overrideLayers ||
      props.layers !== oldProps.layers ||
      props.maxVisibleLayers !== oldProps.maxVisibleLayers;
    if (viewChanged) this.refreshView();
    if (shown || awaiting) {
      // the view may be unchanged (refreshView returned early): re-check completeness and what is missing
      this.syncRendered();
      this.requestMissing();
    }
  }

  /** Zoom-implied level, as the stock tile layer would pick it: ceil(zoom) + offset (not clamped by the slider) */
  private zoomLevel(maxLevel: number) {
    const { layers } = this.props;
    const z = Math.min(Math.max(Math.ceil(this.context.viewport.zoom) + LAYER_ZOOM_OFFSET, 0), layers);
    return Math.min(Math.max(layers - z, 0), maxLevel);
  }

  private refreshView() {
    const state = this.state as unknown as State;
    const { source, genes, overrideLayers, maxVisibleLayers } = this.props;
    const { manifest } = source;
    const maxLevel = manifest.levels[manifest.levels.length - 1] ?? 0;
    const geneIdx = Array.from(genes, (name) => source.geneIndex(name)).filter(
      (idx): idx is number => idx !== undefined
    );
    const bounds = this.context.viewport.getBounds() as [number, number, number, number];
    const rectAt = (level: number) =>
      manifest.grid[level] ? visibleTileRect(bounds, manifest.tile_size[level], manifest.grid[level]) : null;

    // The override slider is a detail floor: never coarser than level maxVisibleLayers (minZoom = layers - max)
    const zoomLevel = this.zoomLevel(maxLevel);
    const level = chooseLevel({
      zoomLevel: overrideLayers ? Math.min(zoomLevel, maxVisibleLayers) : zoomLevel,
      current: state.level,
      budget: GENE_LEVEL_ROW_BUDGET,
      estimate: (l) => estimateRows(manifest, geneIdx, l, rectAt(l))
    });
    state.level = level;

    const wanted = source.plan(geneIdx, level, rectAt(level));
    // Same chunks as before (e.g. a pan inside the same tiles): nothing to do
    const signature = `${level}|${wanted.map((ref) => ref.key).join(',')}`;
    if (signature === state.viewSignature) return;
    state.viewSignature = signature;
    state.failed.clear(); // the view changed: failed chunks are tried again
    state.wanted = wanted;
    state.wantedKeys = new Set(wanted.map((ref) => ref.key));
    this.syncRendered();

    this.requestMissing();
  }

  private requestMissing() {
    const state = this.state as unknown as State;
    const { source } = this.props;
    if (state.hidden) return;
    for (const ref of state.wanted) {
      const { key } = ref;
      if (source.peek(key) || state.empty.has(key) || state.failed.has(key) || state.requested.has(key)) continue;
      state.requested.add(ref.key);
      this.setPending(1);
      source
        // checked when the load reaches the head of the queue: skip chunks the user already moved away from
        .load(ref, () => !state.hidden && state.wantedKeys.has(ref.key))
        .then((chunk) => {
          if (chunk === null) state.empty.add(ref.key);
          else if (chunk === CHUNK_FAILED) state.failed.add(ref.key);
        })
        .finally(() => {
          state.requested.delete(ref.key);
          this.setPending(-1);
          if (state.finalized || state.hidden) return; // hidden: caught up when shown again
          this.syncRendered();
          // skipped while unwanted but wanted again by now
          if (!source.peek(ref.key) && state.wantedKeys.has(ref.key)) this.requestMissing();
        });
    }
  }

  /** Recomputes what is drawn (see planRendered), re-pins what must stay cached and requests a render pass. */
  private syncRendered() {
    const state = this.state as unknown as State;
    const { source } = this.props;
    const rendered = planRendered(state.rendered, state.wanted, (key) =>
      state.empty.has(key) || state.failed.has(key) ? null : source.peek(key)
    );
    const changed =
      rendered.size !== state.rendered.size || [...rendered.keys()].some((key) => !state.rendered.has(key));
    state.rendered = rendered;
    const drawnLevel = rendered.size ? (rendered.values().next().value as GeneChunk).level : null;
    if (drawnLevel !== state.reportedLevel) {
      state.reportedLevel = drawnLevel;
      this.props.onLevelChange?.(drawnLevel);
    }
    const pinned = new Set(state.wantedKeys);
    for (const key of rendered.keys()) pinned.add(key);
    source.setPinned(pinned);

    const complete = state.wanted.every(
      (ref) => state.empty.has(ref.key) || state.failed.has(ref.key) || source.peek(ref.key)
    );
    const latest = (this.getCurrentLayer() as GeneFilteredTranscriptLayer | null) ?? this;
    if (complete && latest.props.awaitingReady !== false && !state.readyReported) {
      state.readyReported = true;
      // deferred: the parent must not change state in the middle of its own sublayer update pass
      void Promise.resolve().then(() =>
        (this.getCurrentLayer() as GeneFilteredTranscriptLayer | null)?.props.onReady?.()
      );
    }
    if (changed) {
      // new sublayers to draw: flag the (current instance of the) layer for a renderLayers pass
      const current = this.getCurrentLayer() as GeneFilteredTranscriptLayer | null;
      current?.setState({ renderVersion: ++state.renderVersion });
      current?.setNeedsUpdate();
    }
  }

  private setPending(delta: number) {
    const state = this.state as unknown as State;
    const before = state.pending;
    state.pending = Math.max(0, before + delta);
    if (before > 0 !== state.pending > 0) this.props.onLoadingStateChange?.(state.pending > 0);
  }

  filterSubLayer(context: FilterContext) {
    return (this.state as unknown as State).pickCuller.shouldDraw(context, this.props.pointSize + 1);
  }

  getPickingInfo({ info, sourceLayer }: GetPickingInfoParams): any {
    const bucket = (sourceLayer?.props as { bucket?: GeneBucket } | undefined)?.bucket;
    if (bucket && info.index >= 0) {
      const hit = resolveGeneBucketIndex(bucket, info.index);
      if (hit) {
        const i = info.index;
        info.object = {
          position: [bucket.positions[2 * i], bucket.positions[2 * i + 1]],
          geneName: hit.chunk.geneName,
          cellId: String(hit.chunk.cellId[hit.localIndex])
        };
      }
    }
    return info;
  }

  renderLayers() {
    const state = this.state as unknown as State;
    const { pointSize, geneLookupTexture, geneLookupVersion, lookupIndexOf } = this.props;
    if (!geneLookupTexture) return [];
    // Chunks are merged into a few buckets (same object while membership is unchanged => no GPU re-upload)
    state.buckets = updateGeneBuckets(state.rendered.values(), state.buckets, lookupIndexOf);
    const layers: Layer[] = [];
    for (const bucket of state.buckets.values()) {
      layers.push(
        createPointLayer(
          this.context,
          this.getSubLayerProps({
            id: `gene-${bucket.key}`,
            data: bucket.data,
            bucket,
            pickBounds: bucket.bounds,
            getFillColor: WHITE,
            getRadius: pointSize,
            radiusUnits: 'pixels',
            pickable: true,
            extensions: GENE_LOOKUP_EXTENSIONS,
            geneLookupTexture,
            geneLookupVersion,
            geneLookupMode: 'visible'
          }) as any
        )
      );
    }
    return layers;
  }
}
