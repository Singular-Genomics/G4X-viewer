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
  useDataStatus: () => { hasData: boolean; configLoaded: boolean };
  useLayersCount: () => number;
  colormapExportFileName: string;
  // Header of the only name column when the dataset has no metadata to build columns from
  fallbackNameLabelKey: string;
  hasPointOutline: boolean;
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
    useDataStatus: () =>
      useZarrDataStore(
        useShallow((store) => ({ hasData: store.hasTranscriptsData, configLoaded: store.transcriptConfigLoaded }))
      ),
    useLayersCount: () => useZarrDataStore((store) => store.layerConfig.layers),
    colormapExportFileName: 'custom_transcripts-colormap',
    fallbackNameLabelKey: 'transcript.geneName',
    hasPointOutline: false
  },
  directSeq: {
    useLayerStore: useDirectSeqLayerStore,
    useColorMap: useDirectSeqColorMap,
    useDataStatus: () =>
      useZarrDataStore(
        useShallow((store) => ({ hasData: store.directSeq.hasData, configLoaded: store.directSeq.configLoaded }))
      ),
    useLayersCount: () => useZarrDataStore((store) => store.directSeq.layerConfig.layers),
    colormapExportFileName: 'custom_direct-seq-colormap',
    fallbackNameLabelKey: 'transcript.targetName',
    hasPointOutline: true
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
