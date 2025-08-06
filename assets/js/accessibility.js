// Accessibility enhancements
class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupColorContrastToggle();
    this.setupReducedMotionSupport();
  }

  setupKeyboardNavigation() {
    // Skip to main content link
    this.addSkipLink();

    // Enhanced keyboard navigation for quiz
    document.addEventListener('keydown', (e) => {
      // Navigate quiz with arrow keys
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        this.navigateQuizOptions(e);
      }

      // Navigate tools with arrow keys
      if (e.target.closest('.tools-grid')) {
        this.navigateToolsGrid(e);
      }

      // Escape key to close modals/menus
      if (e.key === 'Escape') {
        this.closeActiveElements();
      }
    });

    // Tab trap for mobile menu
    this.setupTabTrap();
  }

  addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    
    // Add styles
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--primary-color);
      color: white;
      padding: 8px;
      text-decoration: none;
      z-index: 100000;
      border-radius: 4px;
      transition: top 0.3s;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content id if not exists
    const main = document.querySelector('main') || document.querySelector('.hero');
    if (main && !main.id) {
      main.id = 'main-content';
    }
  }

  navigateQuizOptions(e) {
    const options = document.querySelectorAll('.option-card');
    if (options.length === 0) return;

    const focused = document.activeElement;
    const currentIndex = Array.from(options).indexOf(focused);
    
    let nextIndex;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    }

    if (nextIndex !== undefined) {
      options[nextIndex].focus();
    }
  }

  navigateToolsGrid(e) {
    const tools = document.querySelectorAll('.tool-card .btn-tool');
    if (tools.length === 0) return;

    const focused = document.activeElement;
    if (!focused.classList.contains('btn-tool')) return;

    const currentIndex = Array.from(tools).indexOf(focused);
    let nextIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex < tools.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tools.length - 1;
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = Math.min(currentIndex + 3, tools.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = Math.max(currentIndex - 3, 0);
        break;
    }

    if (nextIndex !== undefined) {
      tools[nextIndex].focus();
    }
  }

  closeActiveElements() {
    // Close mobile menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (hamburger && navMenu) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }

    // Close any modals (if implemented)
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => modal.classList.remove('active'));
  }

  setupTabTrap() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;

    navMenu.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusableElements = navMenu.querySelectorAll('a[href]');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  setupFocusManagement() {
    // Add focus indicators
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-focus');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-focus');
    });

    // Manage focus for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.querySelector) {
              this.enhanceFocusableElements(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  enhanceFocusableElements(container) {
    const focusableElements = container.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    
    focusableElements.forEach(element => {
      if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
        const text = element.textContent.trim() || element.alt || element.title;
        if (text) {
          element.setAttribute('aria-label', text);
        }
      }
    });
  }

  setupScreenReaderSupport() {
    // Add live regions for dynamic content
    this.createLiveRegion();

    // Enhanced quiz announcements
    document.addEventListener('click', (e) => {
      if (e.target.closest('.option-card')) {
        const option = e.target.closest('.option-card');
        const text = option.querySelector('.option-text').textContent;
        this.announce(`Selected: ${text}`);
      }
    });

    // Progress announcements
    const progressObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.classList.contains('quiz-progress-bar')) {
          const progress = mutation.target.style.width;
          this.announce(`Progress: ${progress}`);
        }
      });
    });

    const progressBar = document.querySelector('.quiz-progress-bar');
    if (progressBar) {
      progressObserver.observe(progressBar, { attributes: true, attributeFilter: ['style'] });
    }
  }

  createLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    
    document.body.appendChild(liveRegion);
    this.liveRegion = liveRegion;
  }

  announce(message) {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
    }
  }

  setupColorContrastToggle() {
    const contrastToggle = document.createElement('button');
    contrastToggle.textContent = 'High Contrast';
    contrastToggle.className = 'contrast-toggle';
    contrastToggle.setAttribute('aria-label', 'Toggle high contrast mode');
    
    contrastToggle.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 10px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 1000;
      font-size: 12px;
    `;

    contrastToggle.addEventListener('click', () => {
      document.body.classList.toggle('high-contrast');
      const isHighContrast = document.body.classList.contains('high-contrast');
      contrastToggle.textContent = isHighContrast ? 'Normal' : 'High Contrast';
      localStorage.setItem('high-contrast', isHighContrast);
    });

    // Restore preference
    if (localStorage.getItem('high-contrast') === 'true') {
      document.body.classList.add('high-contrast');
      contrastToggle.textContent = 'Normal';
    }

    document.body.appendChild(contrastToggle);
  }

  setupReducedMotionSupport() {
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
    }

    // Motion toggle
    const motionToggle = document.createElement('button');
    motionToggle.textContent = '🎭';
    motionToggle.className = 'motion-toggle';
    motionToggle.setAttribute('aria-label', 'Toggle animations');
    
    motionToggle.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: var(--secondary-color);
      color: white;
      border: none;
      padding: 10px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 1000;
      font-size: 16px;
    `;

    motionToggle.addEventListener('click', () => {
      document.body.classList.toggle('reduced-motion');
      const isReduced = document.body.classList.contains('reduced-motion');
      localStorage.setItem('reduced-motion', isReduced);
    });

    // Restore preference
    if (localStorage.getItem('reduced-motion') === 'true') {
      document.body.classList.add('reduced-motion');
    }

    document.body.appendChild(motionToggle);
  }
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', () => {
  new AccessibilityManager();
});

// Add CSS for accessibility features
const accessibilityCSS = `
  .keyboard-focus *:focus {
    outline: 3px solid var(--primary-color) !important;
    outline-offset: 2px !important;
  }

  .high-contrast {
    filter: contrast(150%) brightness(110%);
  }

  .reduced-motion *,
  .reduced-motion *::before,
  .reduced-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
`;

const style = document.createElement('style');
style.textContent = accessibilityCSS;
document.head.appendChild(style);

