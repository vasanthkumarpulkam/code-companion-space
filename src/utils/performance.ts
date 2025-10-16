// Performance monitoring utility

class PerformanceMonitor {
  private enabled: boolean = true;

  // Track page load performance
  trackPageLoad() {
    if (!this.enabled || typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      console.log('[Performance] Page Load Metrics:', {
        totalLoadTime: `${pageLoadTime}ms`,
        connectionTime: `${connectTime}ms`,
        renderTime: `${renderTime}ms`,
      });

      // Track with analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'timing_complete', {
          name: 'load',
          value: pageLoadTime,
          event_category: 'Performance',
        });
      }
    });
  }

  // Measure component render time
  measureRender(componentName: string, callback: () => void) {
    if (!this.enabled) {
      callback();
      return;
    }

    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;

    if (duration > 16) { // More than one frame (60fps)
      console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);
    }
  }

  // Measure async operations
  async measureAsync<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
    if (!this.enabled) {
      return operation();
    }

    const start = performance.now();
    try {
      const result = await operation();
      const end = performance.now();
      const duration = end - start;

      console.log(`[Performance] ${operationName} completed in ${duration.toFixed(2)}ms`);

      if (duration > 1000) {
        console.warn(`[Performance] ${operationName} took longer than 1 second`);
      }

      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`[Performance] ${operationName} failed after ${(end - start).toFixed(2)}ms`);
      throw error;
    }
  }

  // Track First Contentful Paint
  trackFCP() {
    if (!this.enabled || typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log(`[Performance] First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });
  }

  // Track Largest Contentful Paint
  trackLCP() {
    if (!this.enabled || typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`[Performance] Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  // Track Cumulative Layout Shift
  trackCLS() {
    if (!this.enabled || typeof window === 'undefined') return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      console.log(`[Performance] Cumulative Layout Shift: ${clsValue.toFixed(4)}`);
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  // Track memory usage (Chrome only)
  trackMemory() {
    if (!this.enabled || typeof window === 'undefined') return;

    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('[Performance] Memory Usage:', {
        usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
      });
    }
  }

  // Initialize all tracking
  init() {
    if (typeof window === 'undefined') return;

    this.trackPageLoad();
    this.trackFCP();
    this.trackLCP();
    this.trackCLS();

    // Track memory every 30 seconds
    setInterval(() => {
      this.trackMemory();
    }, 30000);
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Initialize on app load
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  performanceMonitor.init();
}
