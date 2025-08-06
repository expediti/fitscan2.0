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
