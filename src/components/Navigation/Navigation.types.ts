export type NavigationView = 'viewer' | 'dashboard';

export type NavigationProps = {
  currentView: NavigationView;
  isViewerUiHidden: boolean;
  onViewChange: (view: NavigationView) => void;
  onToggleViewerUi: () => void;
};
