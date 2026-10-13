import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTranscriptLayerStore } from '../../../stores/TranscriptLayerStore';
import { useDirectSeqLayerStore } from '../../../stores/DirectSeqLayerStore';
import { ColorMapEntry, useZarrDataStore } from '../../../stores/ZarrDataStore';

export type TranscriptSource = 'transcripts' | 'directSeq';

// Binds the section components to transcripts (default, outside a provider) or Direct-Seq
type TranscriptSourceBinding = {
  useLayerStore: typeof useTranscriptLayerStore;
  useColorMap: () => { colorMapConfig: ColorMapEntry[]; setColormapConfig: (colorMapConfig: ColorMapEntry[]) => void };
  useLayersCount: () => number;
  colormapExportFileName: string;
  nameColumnLabelKey: string;
};

const useTranscriptsColorMap: TranscriptSourceBinding['useColorMap'] = () =>
  useZarrDataStore(
    useShallow((store) => ({ colorMapConfig: store.colorMapConfig, setColormapConfig: store.setColormapConfig }))
  );

const useDirectSeqColorMap: TranscriptSourceBinding['useColorMap'] = () => {
  const colorMapConfig = useZarrDataStore((store) => store.directSeq.colorMapConfig);
  const setDirectSeqData = useZarrDataStore((store) => store.setDirectSeqData);
  const setColormapConfig = useCallback(
    (newColorMapConfig: ColorMapEntry[]) => setDirectSeqData({ colorMapConfig: newColorMapConfig }),
    [setDirectSeqData]
  );
  return { colorMapConfig, setColormapConfig };
};

const TRANSCRIPT_SOURCE_BINDINGS: Record<TranscriptSource, TranscriptSourceBinding> = {
  transcripts: {
    useLayerStore: useTranscriptLayerStore,
    useColorMap: useTranscriptsColorMap,
    useLayersCount: () => useZarrDataStore((store) => store.layerConfig.layers),
    colormapExportFileName: 'custom_transcripts-colormap',
    nameColumnLabelKey: 'transcript.geneName'
  },
  directSeq: {
    useLayerStore: useDirectSeqLayerStore,
    useColorMap: useDirectSeqColorMap,
    useLayersCount: () => useZarrDataStore((store) => store.directSeq.layerConfig.layers),
    colormapExportFileName: 'custom_direct-seq-colormap',
    nameColumnLabelKey: 'transcript.targetName'
  }
};

const TranscriptSourceContext = createContext<TranscriptSourceBinding>(TRANSCRIPT_SOURCE_BINDINGS.transcripts);

export const TranscriptSourceProvider = ({ source, children }: { source: TranscriptSource; children: ReactNode }) => (
  <TranscriptSourceContext.Provider value={TRANSCRIPT_SOURCE_BINDINGS[source]}>
    {children}
  </TranscriptSourceContext.Provider>
);

// eslint-disable-next-line react-refresh/only-export-components
export const useTranscriptSource = () => useContext(TranscriptSourceContext);
