// TEMPORARY DEV-ONLY instrumentation (remove before merge). Read from the browser console:
//   window.__renderLog        -> { renders: {Component: count}, storeChanges: {"store.key": count}, loadingFlag: n }
//   window.__renderLogReset() -> zero all counters
import { useViewerStore } from '../stores/ViewerStore';
import { useZarrDataStore } from '../stores/ZarrDataStore';
import { useTranscriptLayerStore } from '../stores/TranscriptLayerStore';
import { useTooltipStore } from '../stores/TooltipStore';

type RenderLog = { renders: Record<string, number>; storeChanges: Record<string, number> };

const log: RenderLog = { renders: {}, storeChanges: {} };

export const logRender = (name: string) => {
  if (!import.meta.env.DEV) return;
  log.renders[name] = (log.renders[name] ?? 0) + 1;
};

const watch = (name: string, store: { subscribe: (l: (s: any, p: any) => void) => void }) => {
  store.subscribe((state, prev) => {
    for (const key of Object.keys(state)) {
      if (state[key] !== prev[key]) {
        const k = `${name}.${key}`;
        log.storeChanges[k] = (log.storeChanges[k] ?? 0) + 1;
      }
    }
  });
};

if (import.meta.env.DEV && typeof window !== 'undefined' && !(window as any).__renderLog) {
  (window as any).__renderLog = log;
  (window as any).__renderLogReset = () => {
    log.renders = {};
    log.storeChanges = {};
    (window as any).__renderLog = log;
  };
  watch('viewer', useViewerStore);
  watch('zarr', useZarrDataStore);
  watch('transcriptLayer', useTranscriptLayerStore);
  watch('tooltip', useTooltipStore);
}
