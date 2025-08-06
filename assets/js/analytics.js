// Analytics and tracking with New Window Support
class AnalyticsManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupGoogleAnalytics();
    this.setupEventTracking();
    this.setupPerformanceTracking();
    this.setupErrorTracking();
    this.setupNewWindowTracking();
  }

  setupGoogleAnalytics() {
    // Load Google Analytics if not already loaded
    if (typeof gtag === 'undefined') {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID', {
        send_page_view: false // We'll send it manually
      });

      // Make gtag available globally
      window.gtag = gtag;
    }

    // Send initial page view
    this.trackPageView();
  }

  trackPageView() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }

  setupEventTracking() {
    // Track tool usage
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-track]');
      if (target) {
        const action = target.dataset.track;
        this.trackEvent('interaction', action, {
          element_type: target.tagName.toLowerCase(),
          element_text: target.textContent.trim()
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.tagName === 'FORM') {
        this.trackEvent('form_submit', form.id || 'unnamed_form');
      }
    });

    // Track external link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.hostname !== window.location.hostname) {
        this.trackEvent('external_link_click', link.href);
      }
    });

    // Track scroll depth
    this.setupScrollTracking();
  }

  setupNewWindowTracking() {
    // Track new window tool opens
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[target="_blank"]');
      if (link && link.href.includes('/tools/')) {
        const toolName = link.href.split('/tools/')[1]?.replace('/', '').replace(/-/g, ' ') || 'unknown';
        
        this.trackEvent('tool_open_new_window', toolName, {
          link_url: link.href,
          source_page: window.location.pathname,
          tool_category: link.closest('.tool-card')?.dataset.category || 'unknown'
        });

        // Track timing - how long after page load
        const loadTime = performance.now();
        this.trackEvent('tool_engagement_timing', toolName, {
          time_to_click: Math.round(loadTime / 1000),
          page_source: window.location.pathname
        });
      }
    });

    // Track new window link hover (engagement)
    document.querySelectorAll('.btn-tool.new-window').forEach(link => {
      let hoverStartTime;
      
      link.addEventListener('mouseenter', () => {
        hoverStartTime = Date.now();
      });

      link.addEventListener('mouseleave', () => {
        if (hoverStartTime) {
          const hoverDuration = Date.now() - hoverStartTime;
          if (hoverDuration > 1000) { // Only track hovers longer than 1 second
            const toolName = link.href.split('/tools/')[1]?.replace('/', '').replace(/-/g, ' ') || 'unknown';
            this.trackEvent('tool_hover_engagement', toolName, {
              hover_duration: Math.round(hoverDuration / 1000),
              element_type: 'tool_button'
            });
          }
        }
      });
    });

    // Track which tools users are most interested in (by filter usage)
    document.addEventListener('click', (e) => {
      const filterTag = e.target.closest('.filter-tag');
      if (filterTag) {
        const filterType = filterTag.dataset.filter;
        this.trackEvent('tool_filter_used', filterType, {
          total_tools_visible: document.querySelectorAll('.tool-card:not([style*="display: none"])').length
        });
      }
    });
  }

  setupScrollTracking() {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 90, 100];
    const reached = [];

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;

        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !reached.includes(milestone)) {
            reached.push(milestone);
            this.trackEvent('scroll_depth', `${milestone}%`);
          }
        });
      }
    };

    window.addEventListener('scroll', this.throttle(trackScroll, 1000));
  }

  setupPerformanceTracking() {
    // Track Core Web Vitals
    if ('performance' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackEvent('web_vitals', 'LCP', {
          value: Math.round(lastEntry.startTime)
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        this.trackEvent('web_vitals', 'FID', {
          value: Math.round(firstInput.processingStart - firstInput.startTime)
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.trackEvent('web_vitals', 'CLS', {
          value: Math.round(clsValue * 1000) / 1000
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  setupErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (e) => {
      this.trackEvent('javascript_error', e.message, {
        filename: e.filename,
        line: e.lineno,
        column: e.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackEvent('promise_rejection', e.reason);
    });

    // Track 404 errors
    if (window.location.pathname.includes('404') || document.title.includes('404')) {
      this.trackEvent('404_error', window.location.pathname);
    }
  }

  trackEvent(action, label, parameters = {}) {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_label: label,
        ...parameters
      });
    }

    // Also log to console in development
    if (window.location.hostname === 'localhost') {
      console.log('Analytics Event:', { action, label, parameters });
    }
  }

  // Custom tracking methods for specific features
  trackQuizStart(toolName) {
    this.trackEvent('quiz_start', toolName);
  }

  trackQuizComplete(toolName, score, timeSpent) {
    this.trackEvent('quiz_complete', toolName, {
      score: score,
      time_spent: timeSpent
    });
  }

  trackToolFilter(filterType) {
    this.trackEvent('tool_filter', filterType);
  }

  trackBlogRead(articleTitle, readTime) {
    this.trackEvent('blog_read', articleTitle, {
      read_time: readTime
    });
  }

  // New methods for new window tracking
  trackNewWindowOpen(toolName, sourceUrl) {
    this.trackEvent('new_window_opened', toolName, {
      source_url: sourceUrl,
      timestamp: Date.now()
    });
  }

  trackNewWindowEngagement(toolName, interactionType) {
    this.trackEvent('new_window_engagement', toolName, {
      interaction_type: interactionType
    });
  }

  // Utility functions
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
  window.analytics = new AnalyticsManager();
});

// Privacy-conscious analytics
class PrivacyManager {
  constructor() {
    this.setupConsentBanner();
  }

  setupConsentBanner() {
    // Check if user has already made a choice
    const consent = localStorage.getItem('analytics_consent');
    if (consent === null) {
      this.showConsentBanner();
    } else if (consent === 'accepted') {
      this.enableAnalytics();
    }
  }

  showConsentBanner() {
    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.innerHTML = `
      <div class="consent-content">
        <p>We use cookies to improve your experience and analyze site usage. Do you accept our use of analytics cookies?</p>
        <div class="consent-buttons">
          <button id="accept-cookies" class="btn-primary">Accept</button>
          <button id="decline-cookies" class="btn-secondary">Decline</button>
        </div>
      </div>
    `;

    // Add styles
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--bg-white);
      border-top: 1px solid var(--border-color);
      padding: 1rem;
      z-index: 10000;
      box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
    `;

    document.body.appendChild(banner);

    // Handle user choice
    document.getElementById('accept-cookies').addEventListener('click', () => {
      localStorage.setItem('analytics_consent', 'accepted');
      this.enableAnalytics();
      banner.remove();
    });

    document.getElementById('decline-cookies').addEventListener('click', () => {
      localStorage.setItem('analytics_consent', 'declined');
      banner.remove();
    });
  }

  enableAnalytics() {
    // Enable analytics only after consent
    if (window.analytics) {
      window.analytics.init();
    }
  }
}

// Initialize privacy manager
document.addEventListener('DOMContentLoaded', () => {
  new PrivacyManager();
});
