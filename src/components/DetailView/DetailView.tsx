import { OVERVIEW_VIEW_ID, VivView } from '@hms-dbmi/viv';
import { getImageLayer } from '../../utils/utils';
import { DetailViewProps } from './DetailView.types';

export const DETAIL_VIEW_ID = 'detail';

export default class DetailView extends VivView {
  constructor({ id, x = 0, y = 0, height, width, snapScaleBar }: DetailViewProps) {
    super({ id, x, y, height, width } as any);

    // Add snapScaleBar property if provided
    if (snapScaleBar !== undefined) {
      (this as any).snapScaleBar = snapScaleBar;
    }
  }

  getLayers({ props }: any): any {
    const { id } = this;
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
