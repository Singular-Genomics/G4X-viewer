export type GraphOption = {
  id: string;
  label: string;
};

export type AddGraphButtonProps = {
  options: GraphOption[];
  onSelectGraph: (optionId: string) => void;
  buttonText?: string;
};
