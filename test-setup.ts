import '@testing-library/jest-dom';
import './artifacts/origin-app/src/i18n';

// jsdom does not implement window.matchMedia.
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// jsdom does not implement URL.createObjectURL / revokeObjectURL.
// Several media libraries (media-encoder-host, etc.) call these at import time.
if (typeof URL.createObjectURL !== 'function') {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: () => 'blob:mock',
  });
}
if (typeof URL.revokeObjectURL !== 'function') {
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: () => {},
  });
}

// jsdom lacks MediaStream; stub it so media-related imports don't crash.
if (typeof globalThis.MediaStream === 'undefined') {
  class MediaStreamStub {
    // minimal stub
  }
  (globalThis as unknown as { MediaStream: typeof MediaStreamStub }).MediaStream =
    MediaStreamStub;
}

// jsdom lacks Worker; stub it so media-encoder-host-broker doesn't crash at import.
if (typeof globalThis.Worker === 'undefined') {
  class WorkerStub {
    constructor() {}
    postMessage() {}
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
    onmessage: unknown = null;
    onerror: unknown = null;
  }
  (globalThis as unknown as { Worker: typeof WorkerStub }).Worker = WorkerStub;
}

// jsdom lacks ResizeObserver / IntersectionObserver; stub them.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver =
    ResizeObserverStub;
}
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserverStub }).IntersectionObserver =
    IntersectionObserverStub;
}
