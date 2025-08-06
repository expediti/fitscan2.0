// FitScan Main JavaScript with New Window Support
class FitScanApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupFilterTags();
    this.setupIntersectionObserver();
    this.setupNewWindowNotifications();
    this.registerServiceWorker();
  }

  setupNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        }
      });

      // Close menu when clicking on nav links
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        });
      });
    }
  }

  setupFilterTags() {
    const filterTags = document.querySelectorAll('.filter-tag');
    const toolCards = document.querySelectorAll('.tool-card');

    filterTags.forEach(tag => {
      tag.addEventListener('click', () => {
        // Remove active class from all tags
        filterTags.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tag
        tag.classList.add('active');

        const filter = tag.dataset.filter;

        toolCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe tool cards for animation
    document.querySelectorAll('.tool-card').forEach(card => {
      card.classList.add('fade-in');
      observer.observe(card);
    });
  }

  setupNewWindowNotifications() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'new-window-notification';
    notification.textContent = 'Assessment opening in new tab';
    document.body.appendChild(notification);

    // Track new window tool clicks
    document.addEventListener('click', (e) => {
      const toolLink = e.target.closest('.btn-tool.new-window');
      if (toolLink) {
        // Show notification
        this.showNewWindowNotification(notification);
        
        // Track analytics
        if (window.analytics) {
          const toolName = toolLink.href.split('/tools/')[1]?.replace('/', '').replace(/-/g, ' ');
          window.analytics.trackEvent('tool_open_new_window', toolName, {
            link_url: toolLink.href,
            source_page: window.location.pathname
          });
        }
      }
    });

    // Enhanced hover effects for new window links
    document.querySelectorAll('.btn-tool.new-window').forEach(link => {
      link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateY(-3px) scale(1.02)';
        link.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.3)';
      });

      link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateY(-2px)';
        link.style.boxShadow = 'none';
      });
    });
  }

  showNewWindowNotification(notification) {
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }

  // Utility functions
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FitScanApp();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Performance monitoring
window.addEventListener('load', () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
  }
});

// Accessibility enhancement for new window links
document.addEventListener('DOMContentLoaded', () => {
  const newWindowLinks = document.querySelectorAll('a[target="_blank"]');
  
  newWindowLinks.forEach(link => {
    // Add screen reader text
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = ' (opens in new tab)';
    link.appendChild(srText);

    // Add keyboard support
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.open(link.href, '_blank', 'noopener,noreferrer');
      }
    });
  });
});
