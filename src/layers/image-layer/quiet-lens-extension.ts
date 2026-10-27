import { LensExtension } from '@hms-dbmi/viv';

const NO_LENS = [0, 0, 0, 0];

// Same computation as viv's LensExtension mouse handler, but returns NO_LENS while the lens is off.
function getLensBounds(layer: any): number[] {
  const { viewportId, lensEnabled, lensRadius } = layer.props;
  const { mousePosition, deck } = layer.context;
  if (!lensEnabled || !viewportId || !mousePosition || !deck) return NO_LENS;
  const view = deck.viewManager.views.find((v: any) => v.id === viewportId);
  if (!view) return NO_LENS;
  const viewState = deck.viewManager.viewState[viewportId];
  const viewport = view.makeViewport({ ...viewState, viewState });
  if (!viewport.containsPixel(mousePosition)) return NO_LENS;
  const x = mousePosition.x - viewport.x;
  const y = mousePosition.y - viewport.y;
  const pixelBounds = [
    [x - lensRadius, y],
    [x, y + lensRadius],
    [x + lensRadius, y],
    [x, y - lensRadius]
  ];
  return pixelBounds.map((bounds, i) => viewport.unproject(bounds)[i % 2]);
}

function updateLensBounds(layer: any) {
  const current = layer.state.unprojectLensBounds ?? NO_LENS;
  const next = getLensBounds(layer);
  if (next.some((v, i) => v !== current[i])) layer.setState({ unprojectLensBounds: next });
}

/**
 * Viv's LensExtension calls setState with new lens bounds on every pointer move, even with the lens off,
 * and each setState redraws the whole scene (every transcript point). This one only updates changed bounds.
 * deck.gl calls extension lifecycle methods with `this` bound to the layer.
 */
export class QuietLensExtension extends LensExtension {
  static extensionName = 'QuietLensExtension';

  initializeState(this: any, ...args: any[]) {
    (LensExtension.prototype as any).initializeState.apply(this, args);
    const vivHandler = this.state?.onMouseMove;
    const eventManager = this.context.deck?.eventManager;
    if (!vivHandler || !eventManager) return;
    // Layer instances are replaced on prop updates; read props from the current one.
    const layer = this.getCurrentLayer();
    const onMouseMove = () => updateLensBounds(layer.getCurrentLayer());
    eventManager.off({ pointermove: vivHandler, pointerleave: vivHandler, wheel: vivHandler });
    eventManager.on({ pointermove: onMouseMove, pointerleave: onMouseMove, wheel: onMouseMove });
    // Viv's finalizeState unregisters state.onMouseMove.
    this.setState({ onMouseMove });
  }

  updateState(this: any, params: any) {
    // Lens switched on or off without a pointer move.
    if (params.props.lensEnabled !== params.oldProps.lensEnabled && this.state?.onMouseMove) updateLensBounds(this);
  }
}
