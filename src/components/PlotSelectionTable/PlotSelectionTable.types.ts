export interface PlotSelectionTableRowEntry {
  id: string;
  name: string;
  visible: boolean;
}

export interface PlotSelectionTableProps {
  genes: string[];
  selectedGenes: string[];
  onGeneSelect: (genes: string[]) => void;
  onPlotClick: () => void;
  plotDisabled: boolean;
}

export interface PlotSelectionState {
  selectedGenes: string[];
}
