// Blog functionality
class BlogManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupReadTime();
    this.setupSearchHighlight();
    this.setupShareButtons();
    this.setupTableOfContents();
  }

  setupReadTime() {
    const articles = document.querySelectorAll('.article-content');
    articles.forEach(article => {
      const text = article.textContent || article.innerText;
      const wordsPerMinute = 200;
      const wordCount = text.trim().split(/\s+/).length;
      const readTime = Math.ceil(wordCount / wordsPerMinute);
      
      const readTimeElement = document.createElement('span');
      readTimeElement.className = 'read-time';
      readTimeElement.textContent = `${readTime} min read`;
      
      const meta = document.querySelector('.article-meta');
      if (meta) {
        meta.appendChild(readTimeElement);
      }
    });
  }

  setupSearchHighlight() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('highlight');
    
    if (searchTerm) {
      this.highlightText(searchTerm);
    }
  }

  highlightText(term) {
    const content = document.querySelector('.article-content');
    if (!content) return;

    const regex = new RegExp(`(${term})`, 'gi');
    const walker = document.createTreeWalker(
      content,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;

    while (node = walker.nextNode()) {
      if (regex.test(node.textContent)) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(textNode => {
      const highlighted = textNode.textContent.replace(regex, '<mark>$1</mark>');
      const span = document.createElement('span');
      span.innerHTML = highlighted;
      textNode.parentNode.replaceChild(span, textNode);
    });
  }

  setupShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = button.dataset.platform;
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        
        let shareUrl;
        
        switch (platform) {
          case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
          case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
          case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
          default:
            return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
      });
    });
  }

  setupTableOfContents() {
    const headings = document.querySelectorAll('.article-content h2, .article-content h3');
    if (headings.length < 3) return;

    const toc = document.createElement('div');
    toc.className = 'table-of-contents';
    toc.innerHTML = '<h3>Table of Contents</h3>';

    const list = document.createElement('ul');
    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;

      const li = document.createElement('li');
      li.className = heading.tagName.toLowerCase();
      
      const link = document.createElement('a');
      link.href = `#${id}`;
      link.textContent = heading.textContent;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth' });
      });

      li.appendChild(link);
      list.appendChild(li);
    });

    toc.appendChild(list);

    const firstParagraph = document.querySelector('.article-content p');
    if (firstParagraph) {
      firstParagraph.parentNode.insertBefore(toc, firstParagraph);
    }
  }
}

// Initialize blog functionality
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.blog-container') || document.querySelector('.article-container')) {
    new BlogManager();
  }
});

// Blog search functionality (if search is implemented)
class BlogSearch {
  constructor() {
    this.searchInput = document.getElementById('blog-search');
    this.setupSearch();
  }

  setupSearch() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener('input', this.debounce((e) => {
      this.performSearch(e.target.value);
    }, 300));
  }

  performSearch(query) {
    const cards = document.querySelectorAll('.blog-card');
    
    if (!query.trim()) {
      cards.forEach(card => card.style.display = 'block');
      return;
    }

    cards.forEach(card => {
      const title = card.querySelector('.blog-title').textContent.toLowerCase();
      const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
      const searchText = (title + ' ' + excerpt).toLowerCase();
      
      if (searchText.includes(query.toLowerCase())) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  debounce(func, wait) {
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
}

// Initialize search if search input exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('blog-search')) {
    new BlogSearch();
  }
});
