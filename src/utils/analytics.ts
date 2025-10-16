// Simple analytics tracking utility
class Analytics {
  private enabled: boolean = true;

  // Track page views
  trackPageView(path: string) {
    if (!this.enabled) return;
    
    console.log('[Analytics] Page View:', path);
    
    // You can integrate with Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: path,
      });
    }
  }

  // Track custom events
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.enabled) return;
    
    console.log('[Analytics] Event:', eventName, properties);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
  }

  // Track user actions
  trackUserAction(action: string, data?: Record<string, any>) {
    this.trackEvent('user_action', {
      action,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Track job-related events
  trackJobPosted(jobId: string, category: string) {
    this.trackEvent('job_posted', { job_id: jobId, category });
  }

  trackBidSubmitted(jobId: string, bidAmount: number) {
    this.trackEvent('bid_submitted', { job_id: jobId, bid_amount: bidAmount });
  }

  trackJobAwarded(jobId: string, providerId: string) {
    this.trackEvent('job_awarded', { job_id: jobId, provider_id: providerId });
  }

  trackJobCompleted(jobId: string) {
    this.trackEvent('job_completed', { job_id: jobId });
  }

  // Track messaging events
  trackMessageSent(conversationType: string) {
    this.trackEvent('message_sent', { conversation_type: conversationType });
  }

  // Track search events
  trackSearch(query: string, filters?: any) {
    this.trackEvent('search', { query, filters });
  }

  // Track performance metrics
  trackPerformance(metricName: string, value: number) {
    this.trackEvent('performance', { metric: metricName, value });
  }

  // Disable analytics (for privacy)
  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }
}

export const analytics = new Analytics();
