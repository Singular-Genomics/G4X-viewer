import ReactDOM from "react-dom/client";
import { useViewerStore } from "../../stores/ViewerStore";
import { TranscriptTooltip } from "./TranscriptTooltip";
import { PickingInfo } from "@deck.gl/core/typed";

const tooltipElement = document.createElement("div");
const root = ReactDOM.createRoot(tooltipElement);
tooltipElement.style.position = "absolute";
tooltipElement.style.zIndex = "10";
tooltipElement.style.pointerEvents = "none";
document.body.appendChild(tooltipElement);

export const getCustomTooltip = ({
  object,
  x: positionX,
  y: positionY,
}: PickingInfo) => {
  const state = useViewerStore.getState();
  const adjustedTooltipPositionX =
    positionX + 325 > state.viewportWidth ? positionX - 325 : positionX;
  const adjustedTooltipPositionY =
    positionY + 125 > state.viewportHeight ? positionY - 125 : positionY;
  tooltipElement.style.left = `${adjustedTooltipPositionX}px`;
  tooltipElement.style.top = `${adjustedTooltipPositionY}px`;

  root.render(<TranscriptTooltip data={object} />);
};
