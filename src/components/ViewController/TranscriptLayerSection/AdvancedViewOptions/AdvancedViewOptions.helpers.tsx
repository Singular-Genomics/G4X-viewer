import { useViewerStore } from "../../../../stores/ViewerStore";

export function triggerViewerRerender() {
  const oldViewState = useViewerStore.getState().viewState;
  useViewerStore.setState({
    viewState: {
      ...oldViewState,
      zoom: oldViewState.zoom + 0.0001,
    },
  });
}
