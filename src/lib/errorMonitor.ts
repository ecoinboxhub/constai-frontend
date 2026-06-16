export function initErrorMonitor() {
  if (typeof window === "undefined") return;

  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    logError({
      type: "unhandled_error",
      message: String(message),
      stack: error?.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
    originalOnError?.call(window, message, source, lineno, colno, error);
  };

  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    logError({
      type: "unhandled_promise_rejection",
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
    originalOnUnhandledRejection?.call(window, event);
  };
}

interface ErrorReport {
  type: string;
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
}

export function logError(report: ErrorReport) {
  try {
    const stored = JSON.parse(localStorage.getItem("constai_errors") || "[]");
    stored.push(report);
    localStorage.setItem("constai_errors", JSON.stringify(stored.slice(-50)));

    fetch("/api/v1/logs/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
      keepalive: true,
    }).catch(() => {});
  } catch {
  }
}
