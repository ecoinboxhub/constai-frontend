export interface UIEventPayload {
  [key: string]: unknown;
}

export interface UIEventEntry {
  timestamp: string;
  event: string;
  payload: UIEventPayload;
}

export function trackUIEvent(event: string, payload: UIEventPayload = {}): UIEventEntry {
  const entry: UIEventEntry = {
    timestamp: new Date().toISOString(),
    event,
    payload,
  };

  if (typeof window !== "undefined") {
    const globalWindow = window as Window & {
      __ui_validation_events__?: UIEventEntry[];
      trackUIEvent?: (event: string, payload?: UIEventPayload) => UIEventEntry;
    };
    globalWindow.__ui_validation_events__ = globalWindow.__ui_validation_events__ || [];
    globalWindow.__ui_validation_events__.push(entry);
    if (!globalWindow.trackUIEvent) {
      globalWindow.trackUIEvent = trackUIEvent;
    }
  }

  if (typeof console !== "undefined") {
    console.log("[UI_EVENT]", entry);
  }

  return entry;
}

export function getUIEventLog(): UIEventEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const globalWindow = window as Window & { __ui_validation_events__?: UIEventEntry[] };
  return globalWindow.__ui_validation_events__ || [];
}
