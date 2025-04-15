import { OVERVIEW_VIEW_ID, VivView } from '@hms-dbmi/viv';
import { getVivId, getImageLayer } from '../../utils/utils';

export const DETAIL_VIEW_ID = 'detail';

/**
 * This class generates a MultiscaleImageLayer and a view for use in the VivViewer as a detailed view.
 * It takes the same arguments for its constructor as its base class VivView plus the following:
 * @param {Object} args
 * @param {number=} args.x X (top-left) location on the screen for the current view
 * @param {number=} args.y Y (top-left) location on the screen for the current view
 * @param {number} args.height Width of the view.
 * @param {number} args.width Height of the view.
 * @param {string} args.id id of the View
 * */
export default class DetailView extends VivView {
  constructor({ id, x = 0, y = 0, height, width }) {
    super({ id, x, y, height, width });
  }

  getLayers({ props, viewStates }) {
    const { id } = this;
    const layers = [getImageLayer(id, props)];
    return layers;
  }

  filterViewState({ viewState, currentViewState }) {
    if (viewState.id === OVERVIEW_VIEW_ID) {
      const { target } = viewState;
      if (target) {
        return { ...currentViewState, target };
      }
    }
    return super.filterViewState({ viewState });
  }
}
