// Symptom Checker Quiz Engine
class SymptomChecker {
  constructor() {
    this.currentQuestion = 0;
    this.answers = {};
    this.quizData = null;
    this.toolName = this.extractToolName();
    this.init();
  }

  extractToolName() {
    const path = window.location.pathname;
    const parts = path.split('/');
    return parts[parts.length - 2] || 'unknown';
  }

  async init() {
    try {
      await this.loadQuizData();
      this.setupEventListeners();
      this.renderQuestion();
    } catch (error) {
      console.error('Failed to initialize quiz:', error);
      this.showError();
    }
  }

  async loadQuizData() {
    try {
      const response = await fetch('./quiz-data.json');
      if (!response.ok) throw new Error('Failed to load quiz data');
      this.quizData = await response.json();
    } catch (error) {
      throw new Error('Quiz data could not be loaded');
    }
  }

  setupEventListeners() {
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const restartBtn = document.getElementById('restart-btn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextQuestion());
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevQuestion());
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restartQuiz());
    }

    // Handle option selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.option-card')) {
        this.selectOption(e.target.closest('.option-card'));
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        this.nextQuestion();
      } else if (e.key === 'ArrowLeft') {
        this.prevQuestion();
      } else if (e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1;
        const options = document.querySelectorAll('.option-card');
        if (options[optionIndex]) {
          this.selectOption(options[optionIndex]);
        }
      }
    });
  }

  renderQuestion() {
    const container = document.getElementById('quiz-container');
    if (!container || !this.quizData) return;

    const question = this.quizData.questions[this.currentQuestion];
    const isLastQuestion = this.currentQuestion === this.quizData.questions.length - 1;

    container.innerHTML = `
      <div class="quiz-progress">
        <div class="quiz-progress-bar" style="width: ${((this.currentQuestion + 1) / this.quizData.questions.length) * 100}%"></div>
      </div>
      
      <div class="question-card">
        <div class="question-number">Question ${this.currentQuestion + 1} of ${this.quizData.questions.length}</div>
        <div class="question-text">${question.question}</div>
        <div class="options-grid">
          ${question.options.map((option, index) => `
            <div class="option-card" data-value="${option.value}" data-index="${index}">
              <div class="option-radio"></div>
              <div class="option-text">${option.text}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="quiz-navigation">
        <button id="prev-btn" class="btn-nav btn-prev" ${this.currentQuestion === 0 ? 'disabled' : ''}>
          Previous
        </button>
        <button id="next-btn" class="btn-nav btn-next" disabled>
          ${isLastQuestion ? 'Get Results' : 'Next'}
        </button>
      </div>
    `;

    // Restore previous answer if exists
    const savedAnswer = this.answers[this.currentQuestion];
    if (savedAnswer !== undefined) {
      const option = document.querySelector(`[data-value="${savedAnswer}"]`);
      if (option) {
        this.selectOption(option, false);
      }
    }

    // Re-setup event listeners for new elements
    this.setupEventListeners();
  }

  selectOption(optionElement, updateAnswer = true) {
    // Remove selection from all options
    document.querySelectorAll('.option-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Select the clicked option
    optionElement.classList.add('selected');

    // Save the answer
    if (updateAnswer) {
      this.answers[this.currentQuestion] = parseInt(optionElement.dataset.value);
    }

    // Enable next button
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.disabled = false;
    }
  }

  nextQuestion() {
    const nextBtn = document.getElementById('next-btn');
    if (!nextBtn || nextBtn.disabled) return;

    if (this.currentQuestion < this.quizData.questions.length - 1) {
      this.currentQuestion++;
      this.renderQuestion();
    } else {
      this.showResults();
    }
  }

  prevQuestion() {
    if (this.currentQuestion > 0) {
      this.currentQuestion--;
      this.renderQuestion();
    }
  }

  calculateResults() {
    const totalScore = Object.values(this.answers).reduce((sum, value) => sum + value, 0);
    const maxScore = this.quizData.questions.length * Math.max(...this.quizData.questions[0].options.map(o => o.value));
    const percentage = Math.round((totalScore / maxScore) * 100);

    // Determine result category based on percentage
    let resultCategory;
    if (percentage >= 70) {
      resultCategory = 'high';
    } else if (percentage >= 40) {
      resultCategory = 'medium';
    } else {
      resultCategory = 'low';
    }

    return {
      score: totalScore,
      maxScore,
      percentage,
      category: resultCategory,
      result: this.quizData.results[resultCategory]
    };
  }

  showResults() {
    const results = this.calculateResults();
    const container = document.getElementById('quiz-container');

    container.innerHTML = `
      <div class="results-container">
        <div class="results-header">
          <div class="results-score">${results.percentage}%</div>
          <div class="results-title">${results.result.title}</div>
          <div class="results-description">${results.result.description}</div>
        </div>
        
        <div class="results-card">
          <h3>Recommendations</h3>
          <p>${results.result.recommendations}</p>
        </div>
        
        <div class="results-card">
          <h3>Next Steps</h3>
          <ul>
            ${results.result.nextSteps.map(step => `<li>${step}</li>`).join('')}
          </ul>
        </div>
        
        <div class="disclaimer">
          <strong>Important:</strong> This assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for proper medical evaluation.
        </div>
        
        <div class="results-actions">
          <button id="restart-btn" class="btn-retake">Retake Assessment</button>
          <a href="/" class="btn-home">Back to Home</a>
        </div>
      </div>
    `;

    // Track completion
    this.trackCompletion(results);
    
    // Setup restart functionality
    document.getElementById('restart-btn').addEventListener('click', () => {
      this.restartQuiz();
    });
  }

  restartQuiz() {
    this.currentQuestion = 0;
    this.answers = {};
    this.renderQuestion();
  }

  trackCompletion(results) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'quiz_completion', {
        'tool_name': this.toolName,
        'score_percentage': results.percentage,
        'result_category': results.category
      });
    }

    // Local storage for user history (optional)
    const history = JSON.parse(localStorage.getItem('fitscan_history') || '[]');
    history.push({
      tool: this.toolName,
      date: new Date().toISOString(),
      score: results.percentage,
      category: results.category
    });
    
    // Keep only last 10 results
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    localStorage.setItem('fitscan_history', JSON.stringify(history));
  }

  showError() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div class="error-message">
        <h3>Oops! Something went wrong</h3>
        <p>We're having trouble loading the assessment. Please try refreshing the page.</p>
        <button onclick="location.reload()" class="btn-primary">Refresh Page</button>
      </div>
    `;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('quiz-container')) {
    new SymptomChecker();
  }
});
