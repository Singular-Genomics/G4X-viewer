import { createTranscriptLayerStore } from '../TranscriptLayerStore';

// Independent store with the same shape as TranscriptLayerStore
export const useDirectSeqLayerStore = createTranscriptLayerStore();
