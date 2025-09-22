export type NavigationView = 'viewer' | 'dashboard';

export type NavigationProps = {
  currentView: NavigationView;
  onViewChange: (view: NavigationView) => void;
};
