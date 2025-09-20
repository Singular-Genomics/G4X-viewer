export interface PlotSelectionTableRowEntry {
  id: string;
  name: string;
  visible: boolean;
}

export interface PlotSelectionTableProps {
  genes: { name: string; type: string; label: string }[];
  selectedGenes: string[];
  onGeneSelect: (genes: string[]) => void;
  onPlotClick: () => void;
  plotDisabled: boolean;
}

export interface PlotSelectionState {
  selectedGenes: string[];
}
