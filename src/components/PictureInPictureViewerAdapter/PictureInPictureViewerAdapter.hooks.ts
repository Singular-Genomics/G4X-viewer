import { useShallow } from "zustand/react/shallow";
import { DETAIL_VIEW_ID } from "@hms-dbmi/viv";
import { useBinaryFilesStore } from "../../stores/BinaryFilesStore";
import { useTranscriptLayerStore } from "../../stores/TranscriptLayerStore";
import { getVivId } from "../../utils/utils";
import { useCellSegmentationLayerStore } from "../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import CellMasksLayer from "../../layers/cell-masks-layer/cell-masks-layer";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTooltipStore } from "../../stores/TooltipStore";
import TranscriptLayer from "../../layers/transcript-layer/transcript-layer";

export const useResizableContainer = () => {
  const containerRef = useRef<HTMLDivElement>();
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  }, [containerRef]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("onControllerToggle", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("onControllerToggle", handleResize);
    };
  }, [handleResize]);

  return {
    containerRef,
    containerSize,
  };
};

export const useTranscriptLayer = () => {
  const [files, layerConfig] = useBinaryFilesStore(
    useShallow((store) => [store.files, store.layerConfig])
  );

  const [
    isTranscriptLayerOn,
    pointSize,
    showTilesBoundries,
    showTilesData,
    geneNameFilters,
    isGeneNameFilterActive,
    showFilteredPoints,
    disableTiledView,
    overrideLayers,
    maxVisibleLayers,
  ] = useTranscriptLayerStore(
    useShallow((store) => [
      store.isTranscriptLayerOn,
      store.pointSize,
      store.showTilesBoundries,
      store.showTilesData,
      store.geneNameFilters,
      store.isGeneNameFilterActive,
      store.showFilteredPoints,
      store.disableTiledView,
      store.overrideLayers,
      store.maxVisibleLayers,
    ])
  );

  const metadataLayer = new TranscriptLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-transcript-layer`,
    files,
    config: layerConfig,
    visible: !!files.length && isTranscriptLayerOn,
    geneFilters: isGeneNameFilterActive ? geneNameFilters : "all",
    pointSize,
    showTilesBoundries,
    showTilesData,
    showDiscardedPoints: showFilteredPoints,
    disabledTiledView: disableTiledView,
    overrideLayers: overrideLayers,
    maxVisibleLayers: maxVisibleLayers,
    onHover: (pickingInfo) =>
      useTooltipStore.setState({
        position: { x: pickingInfo.x, y: pickingInfo.y },
        object: pickingInfo.object,
        type: "Transcript",
      }),
  });

  return metadataLayer;
};

export const useCellSegmentationLayer = () => {
  const [
    cellMasksData,
    isCellLayerOn,
    isCellStrokeOn,
    isCellFillOn,
    isCellNameFilterOn,
    cellStrokeWidth,
    cellFillOpacity,
    showFilteredCells,
    cellNameFilters,
  ] = useCellSegmentationLayerStore(
    useShallow((store) => [
      store.cellMasksData,
      store.isCellLayerOn,
      store.isCellStrokeOn,
      store.isCellFillOn,
      store.isCellNameFilterOn,
      store.cellStrokeWidth,
      store.cellFillOpacity,
      store.showFilteredCells,
      store.cellNameFilters,
    ])
  );

  const cellMasksLayer = new CellMasksLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-cell-masks-layer`,
    masksData: cellMasksData || new Uint8Array(),
    visible: !!cellMasksData && isCellLayerOn,
    showCellStroke: isCellStrokeOn,
    showCellFill: isCellFillOn,
    showDiscardedPoints: showFilteredCells,
    cellFilters: isCellNameFilterOn ? cellNameFilters : "all",
    cellStrokeWidth,
    cellFillOpacity,
    onHover: (pickingInfo) =>
      useTooltipStore.setState({
        position: { x: pickingInfo.x, y: pickingInfo.y },
        object: pickingInfo.object,
        type: "CellMask",
      }),
  });

  return cellMasksLayer;
};
