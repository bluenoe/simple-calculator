class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.operationDisplay = document.getElementById('operationDisplay');
        this.themeToggle = document.getElementById('themeToggle');
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.isDarkTheme = false;
        this.activeOperatorButton = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Button clicks
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => this.handleButtonClick(e));
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleButtonClick(e) {
        const button = e.target;
        
        // Add haptic feedback for mobile devices
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
        
        // Add visual feedback
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 150);
        
        if (button.dataset.number) {
            this.inputNumber(button.dataset.number);
        } else if (button.dataset.action) {
            this.handleAction(button.dataset.action);
        }
    }
    
    handleKeyPress(e) {
        e.preventDefault();
        
        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
        } else if (e.key === '.') {
            this.handleAction('decimal');
        } else if (e.key === '+') {
            this.handleAction('add');
        } else if (e.key === '-') {
            this.handleAction('subtract');
        } else if (e.key === '*') {
            this.handleAction('multiply');
        } else if (e.key === '/') {
            this.handleAction('divide');
        } else if (e.key === 'Enter' || e.key === '=') {
            this.handleAction('equals');
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
            this.handleAction('clear');
        } else if (e.key === 'Backspace') {
            this.handleAction('delete');
        }
    }
    
    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        
        // Clear active operator when user starts typing new number
        if (this.operator && !this.waitingForOperand) {
            this.clearActiveOperator();
        }
        
        this.updateDisplay();
        this.updateOperationDisplay();
        this.animateDisplay();
    }
    
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.inputOperator(action);
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }
    
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.clearActiveOperator();
        this.updateDisplay();
        this.updateOperationDisplay();
        this.animateDisplay();
    }
    
    delete() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
        this.updateOperationDisplay();
        this.animateDisplay();
    }
    
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
        
        // Clear active operator when user starts typing
        if (this.operator && !this.waitingForOperand) {
            this.clearActiveOperator();
        }
        
        this.updateDisplay();
        this.updateOperationDisplay();
        this.animateDisplay();
    }
    
    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation(currentValue, inputValue, this.operator);
            
            if (newValue === null) return;
            
            this.currentInput = String(newValue);
            this.previousInput = newValue;
            this.updateDisplay();
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.setActiveOperator(nextOperator);
        this.updateOperationDisplay();
    }
    
    calculate() {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput !== '' && this.operator) {
            const newValue = this.performCalculation(this.previousInput, inputValue, this.operator);
            
            if (newValue === null) return;
            
            // Show the complete calculation in operation display
            this.showCalculationResult(this.previousInput, inputValue, this.operator, newValue);
            
            this.currentInput = String(newValue);
            this.previousInput = '';
            this.operator = null;
            this.waitingForOperand = true;
            this.clearActiveOperator();
            this.updateDisplay();
            this.animateDisplay();
        }
    }
    
    performCalculation(firstOperand, secondOperand, operator) {
        let result;
        
        switch (operator) {
            case 'add':
                result = firstOperand + secondOperand;
                break;
            case 'subtract':
                result = firstOperand - secondOperand;
                break;
            case 'multiply':
                result = firstOperand * secondOperand;
                break;
            case 'divide':
                if (secondOperand === 0) {
                    this.showError('Cannot divide by zero');
                    return null;
                }
                result = firstOperand / secondOperand;
                break;
            default:
                return null;
        }
        
        // Round to avoid floating point precision issues
        return Math.round((result + Number.EPSILON) * 100000000) / 100000000;
    }
    
    updateDisplay() {
        const value = this.currentInput;
        
        // Format large numbers
        if (value.length > 12) {
            const num = parseFloat(value);
            if (num > 999999999999) {
                this.display.textContent = num.toExponential(6);
            } else {
                this.display.textContent = value.substring(0, 12);
            }
        } else {
            this.display.textContent = value;
        }
    }
    
    animateDisplay() {
        this.display.classList.add('animate');
        setTimeout(() => {
            this.display.classList.remove('animate');
        }, 200);
    }
    
    showError(message) {
        this.display.textContent = 'Error';
        this.display.classList.add('error');
        this.operationDisplay.textContent = message;
        
        setTimeout(() => {
            this.display.classList.remove('error');
            this.clear();
        }, 1500);
    }
    
    updateOperationDisplay() {
        if (this.previousInput !== '' && this.operator) {
            const operatorSymbol = this.getOperatorSymbol(this.operator);
            this.operationDisplay.textContent = `${this.previousInput} ${operatorSymbol}`;
        } else {
            this.operationDisplay.textContent = '';
        }
    }
    
    getOperatorSymbol(operator) {
        const symbols = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷'
        };
        return symbols[operator] || '';
    }
    
    setActiveOperator(operator) {
        this.clearActiveOperator();
        const operatorButton = document.querySelector(`[data-action="${operator}"]`);
        if (operatorButton) {
            operatorButton.classList.add('active');
            this.activeOperatorButton = operatorButton;
        }
    }
    
    clearActiveOperator() {
        if (this.activeOperatorButton) {
            this.activeOperatorButton.classList.remove('active');
            this.activeOperatorButton = null;
        }
    }
    
    showCalculationResult(firstOperand, secondOperand, operator, result) {
        const operatorSymbol = this.getOperatorSymbol(operator);
        this.operationDisplay.textContent = `${firstOperand} ${operatorSymbol} ${secondOperand} =`;
        
        // Clear the operation display after 3 seconds
        setTimeout(() => {
            if (this.operationDisplay.textContent.includes('=')) {
                this.operationDisplay.textContent = '';
            }
        }, 3000);
    }
    
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle('dark', this.isDarkTheme);
        
        // Update theme icon
        const themeIcon = this.themeToggle.querySelector('.theme-icon');
        themeIcon.textContent = this.isDarkTheme ? '☀️' : '🌙';
        
        // Save theme preference
        localStorage.setItem('calculatorTheme', this.isDarkTheme ? 'dark' : 'light');
        
        // Add animation to theme button
        this.themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.themeToggle.style.transform = '';
        }, 300);
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('calculatorTheme');
        if (savedTheme === 'dark') {
            this.isDarkTheme = true;
            document.body.classList.add('dark');
            const themeIcon = this.themeToggle.querySelector('.theme-icon');
            themeIcon.textContent = '☀️';
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Add some visual feedback for touch devices
if ('ontouchstart' in window) {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
}

// Prevent zoom on double tap for mobile
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

let lastTouchEnd = 0;