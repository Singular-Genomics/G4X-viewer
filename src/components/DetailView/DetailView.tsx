import { OVERVIEW_VIEW_ID, VivView } from '@hms-dbmi/viv';
import { getImageLayer, getVivId } from '../../utils/utils';
import { createImageBackdropLayer } from '../../layers/image-layer';
import { DetailViewProps } from './DetailView.types';

export const DETAIL_VIEW_ID = 'detail';

export default class DetailView extends VivView {
  constructor({ id, x = 0, y = 0, height, width }: DetailViewProps) {
    super({ id, x, y, height, width } as any);
  }

  getLayers({ props }: any): any {
    const { id } = this;
    // A hidden image layer is omitted so it neither fetches nor caches tiles. Keep the opaque black
    // backdrop (with lens ring and hover coordinates) that viv drew with no visible channels.
    if (props.isImageLayerVisible === false) {
      return [
        createImageBackdropLayer(`ImageBackdrop${getVivId(id)}`, props.loader, {
          ...props,
          viewportId: id
        })
      ];
    }
    const layers = [getImageLayer(id, props)];
    return layers;
  }

  filterViewState({ viewState, currentViewState }: any): any {
    if (viewState.id === OVERVIEW_VIEW_ID) {
      const { target } = viewState;
      if (target) {
        return { ...currentViewState, target };
      }
    }
    return super.filterViewState({ viewState } as any);
  }
}
