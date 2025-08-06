// SEO and metadata management
class SEOManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupStructuredData();
    this.optimizeImages();
    this.setupLazyLoading();
    this.trackPageViews();
  }

  setupStructuredData() {
    // Add JSON-LD structured data based on page type
    const pageType = this.detectPageType();
    
    switch (pageType) {
      case 'tool':
        this.addToolStructuredData();
        break;
      case 'blog':
        this.addBlogStructuredData();
        break;
      case 'article':
        this.addArticleStructuredData();
        break;
      default:
        this.addWebsiteStructuredData();
    }
  }

  detectPageType() {
    const path = window.location.pathname;
    
    if (path.includes('/tools/')) return 'tool';
    if (path.includes('/blog/') && path !== '/blog/') return 'article';
    if (path === '/blog/') return 'blog';
    return 'website';
  }

  addWebsiteStructuredData() {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "FitScan",
      "description": "AI-powered health assessment and symptom checker tools",
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "FitScan",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/images/logo.png`
        }
      }
    };

    this.insertStructuredData(structuredData);
  }

  addToolStructuredData() {
    const toolName = this.extractToolName();
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "name": `${toolName} Symptom Checker`,
      "description": `Assess ${toolName} symptoms with our AI-powered health assessment tool`,
      "url": window.location.href,
      "mainEntity": {
        "@type": "MedicalRiskCalculator",
        "name": `${toolName} Assessment Tool`,
        "description": `Interactive assessment for ${toolName} symptoms`
      },
      "author": {
        "@type": "Organization",
        "name": "FitScan"
      },
      "publisher": {
        "@type": "Organization",
        "name": "FitScan",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/images/logo.png`
        }
      }
    };

    this.insertStructuredData(structuredData);
  }

  addBlogStructuredData() {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "FitScan Health Blog",
      "description": "Expert health insights and medical information",
      "url": window.location.href,
      "publisher": {
        "@type": "Organization",
        "name": "FitScan",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/images/logo.png`
        }
      }
    };

    this.insertStructuredData(structuredData);
  }

  addArticleStructuredData() {
    const title = document.querySelector('h1')?.textContent || document.title;
    const description = document.querySelector('meta[name="description"]')?.content || '';
    const datePublished = document.querySelector('.article-date')?.textContent || new Date().toISOString();

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "url": window.location.href,
      "datePublished": datePublished,
      "dateModified": datePublished,
      "author": {
        "@type": "Organization",
        "name": "FitScan Medical Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "FitScan",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/images/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    };

    this.insertStructuredData(structuredData);
  }

  insertStructuredData(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  extractToolName() {
    const path = window.location.pathname;
    const parts = path.split('/');
    const toolSlug = parts[parts.length - 2] || '';
    return toolSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading="lazy" if not already present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }

      // Add proper alt text if missing
      if (!img.alt && img.src.includes('logo')) {
        img.alt = 'FitScan Logo';
      }

      // Add width and height to prevent layout shift
      if (!img.width && !img.height) {
        img.addEventListener('load', function() {
          this.style.width = this.naturalWidth + 'px';
          this.style.height = this.naturalHeight + 'px';
        });
      }
    });
  }

  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyElements = document.querySelectorAll('.lazy');
      
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            element.classList.add('loaded');
            lazyObserver.unobserve(element);
          }
        });
      });

      lazyElements.forEach(element => {
        lazyObserver.observe(element);
      });
    }
  }

  trackPageViews() {
    // Track page view for analytics
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href
      });
    }

    // Track time on page
    this.startTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - this.startTime;
      if (typeof gtag !== 'undefined') {
        gtag('event', 'timing_complete', {
          name: 'time_on_page',
          value: Math.round(timeOnPage / 1000)
        });
      }
    });
  }

  // Update page metadata dynamically
  updateMetadata(options) {
    if (options.title) {
      document.title = options.title;
    }

    if (options.description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', options.description);
    }

    if (options.canonical) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', options.canonical);
    }

    // Update Open Graph tags
    if (options.ogTitle) {
      this.updateOGTag('og:title', options.ogTitle);
    }

    if (options.ogDescription) {
      this.updateOGTag('og:description', options.ogDescription);
    }

    if (options.ogImage) {
      this.updateOGTag('og:image', options.ogImage);
    }
  }

  updateOGTag(property, content) {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }
}

// Initialize SEO manager
document.addEventListener('DOMContentLoaded', () => {
  new SEOManager();
});
