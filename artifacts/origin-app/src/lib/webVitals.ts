/**
 * Core Web Vitals reporting.
 *
 * In development mode, captures CLS, FCP, LCP, TTFB, and INP via the
 * `web-vitals` library and logs each metric to the console so developers
 * can spot regressions without a third-party analytics dashboard.
 *
 * In production this module is a no-op (the imports are tree-shaken out
 * when the dev-only call sites are stripped).
 */
import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from "web-vitals";

const isDev = import.meta.env.DEV;

function logMetric(metric: Metric): void {
  // eslint-disable-next-line no-console
  console.info(`[web-vitals] ${metric.name}: ${metric.value.toFixed(2)} (rating: ${metric.rating})`);
}

/**
 * Start listening for Core Web Vitals metrics.
 * Safe to call once at app boot; it is a no-op in production builds.
 */
export function reportWebVitals(): void {
  if (!isDev) return;
  onCLS(logMetric);
  onFCP(logMetric);
  onLCP(logMetric);
  onTTFB(logMetric);
  onINP(logMetric);
}
