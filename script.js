// Advanced Calculator Suite - Main JavaScript File

class AdvancedCalculator {
    constructor() {
        // Core elements
        this.expressionInput = document.getElementById('expressionInput');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.stepDisplay = document.getElementById('stepDisplay');
        this.copyBtn = document.getElementById('copyResult');
        this.stepMode = document.getElementById('stepMode');
        
        // Calculator mode elements
        this.modeToggle = document.getElementById('modeToggle');
        this.basicButtons = document.getElementById('basicButtons');
        this.scientificButtons = document.getElementById('scientificButtons');
        
        // History elements
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        
        // Theme elements
        this.themeSelector = document.getElementById('themeSelector');
        
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // State management
        this.isScientificMode = false;
        this.memory = 0;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        this.currentTheme = localStorage.getItem('calculatorTheme') || 'light';
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.loadHistory();
        this.setupConverters();
        this.setupKeyboardSupport();
    }
    
    setupEventListeners() {
        // Calculator buttons
        this.basicButtons.addEventListener('click', (e) => this.handleButtonClick(e));
        this.scientificButtons.addEventListener('click', (e) => this.handleButtonClick(e));
        
        // Mode toggle
        this.modeToggle.addEventListener('click', () => this.toggleMode());
        
        // Copy result
        this.copyBtn.addEventListener('click', () => this.copyResult());
        
        // Expression input
        this.expressionInput.addEventListener('input', () => this.handleExpressionInput());
        this.expressionInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Step mode toggle
        this.stepMode.addEventListener('change', () => this.updateStepDisplay());
        
        // Theme selector
        this.themeSelector.addEventListener('change', (e) => this.changeTheme(e.target.value));
        
        // History
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.historyList.addEventListener('click', (e) => this.handleHistoryClick(e));
        
        // Tab navigation
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }
    
    handleButtonClick(e) {
        const btn = e.target.closest('.btn');
        if (!btn) return;
        
        // Add press animation
        this.addPressAnimation(btn);
        
        // Haptic feedback for mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        const action = btn.dataset.action;
        const value = btn.dataset.value;
        
        if (action) {
            this.handleAction(action);
        } else if (value) {
            this.insertValue(value);
        }
    }
    
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'equals':
                this.calculate();
                break;
            case 'mc':
                this.memory = 0;
                break;
            case 'mr':
                this.insertValue(this.memory.toString());
                break;
            case 'mplus':
                try {
                    const result = this.evaluateExpression(this.expressionInput.value);
                    this.memory += parseFloat(result) || 0;
                } catch (e) {
                    // Ignore errors for memory operations
                }
                break;
        }
    }
    
    insertValue(value) {
        const input = this.expressionInput;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const currentValue = input.value;
        
        // Handle special values and functions
        let processedValue = value;
        if (value === 'pi') processedValue = 'π';
        if (value === 'e') processedValue = 'e';
        if (value === '^2') processedValue = '^2';
        
        // Add multiplication operator before constants if needed
        const beforeCursor = currentValue.slice(0, start);
        const afterCursor = currentValue.slice(end);
        
        // Check if we need to add multiplication before constants
        if ((value === 'pi' || value === 'e') && beforeCursor.length > 0) {
            const lastChar = beforeCursor[beforeCursor.length - 1];
            if (/[0-9)]/.test(lastChar)) {
                processedValue = '*' + processedValue;
            }
        }
        
        // Check if we need to add multiplication after constants
        if ((value === 'pi' || value === 'e') && afterCursor.length > 0) {
            const nextChar = afterCursor[0];
            if (/[0-9(]/.test(nextChar)) {
                processedValue = processedValue + '*';
            }
        }
        
        // Insert value at cursor position
        const newValue = beforeCursor + processedValue + afterCursor;
        input.value = newValue;
        
        // Update cursor position
        const newPosition = start + processedValue.length;
        input.setSelectionRange(newPosition, newPosition);
        
        // Update display
        this.handleExpressionInput();
        input.focus();
    }
    
    clear() {
        this.expressionInput.value = '';
        this.resultDisplay.textContent = '0';
        this.stepDisplay.textContent = '';
    }
    
    delete() {
        const input = this.expressionInput;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        
        if (start !== end) {
            // Delete selection
            input.value = input.value.slice(0, start) + input.value.slice(end);
            input.setSelectionRange(start, start);
        } else if (start > 0) {
            // Delete character before cursor
            input.value = input.value.slice(0, start - 1) + input.value.slice(start);
            input.setSelectionRange(start - 1, start - 1);
        }
        
        this.handleExpressionInput();
        input.focus();
    }
    
    handleExpressionInput() {
        const expression = this.expressionInput.value;
        
        if (!expression.trim()) {
            this.resultDisplay.textContent = '0';
            this.stepDisplay.textContent = '';
            return;
        }
        
        try {
            const result = this.evaluateExpression(expression);
            this.resultDisplay.textContent = this.formatResult(result);
            
            if (this.stepMode.checked) {
                this.updateStepDisplay();
            }
        } catch (error) {
            this.resultDisplay.textContent = 'Error';
            this.stepDisplay.textContent = error.message;
        }
    }
    
    evaluateExpression(expression) {
        // Preprocess expression for math.js
        let processedExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/\^2/g, '^2')
            .replace(/sqrt\(/g, 'sqrt(')
            .replace(/ln\(/g, 'log(')
            .replace(/log\(/g, 'log10(')
            .replace(/π/g, 'pi')
            .replace(/pi/g, 'pi')
            .replace(/e(?![a-zA-Z])/g, 'e'); // Match 'e' only when not part of a word
        
        // Validate expression before evaluation
        if (!processedExpression.trim()) {
            throw new Error('Empty expression');
        }
        
        // Check for undefined functions or variables
        const invalidPatterns = [
            /[a-zA-Z]+\s*\(/g, // Functions not properly closed
            /\)\s*\(/g, // Missing operator between parentheses
            /\d+[a-zA-Z]/g, // Numbers directly followed by letters
            /[+\-*/^]\s*[+\-*/^]/g // Consecutive operators
        ];
        
        for (const pattern of invalidPatterns) {
            if (pattern.test(processedExpression.replace(/sqrt|log10|log|sin|cos|tan|pi|e/g, ''))) {
                throw new Error('Invalid expression syntax');
            }
        }
        
        try {
            // Use math.js for evaluation
            const result = math.evaluate(processedExpression);
            
            // Check for mathematical errors
            if (result === undefined || result === null) {
                throw new Error('Undefined result');
            }
            
            if (typeof result === 'number' && (isNaN(result) || !isFinite(result))) {
                throw new Error('Mathematical error: Result is not a finite number');
            }
            
            return result;
        } catch (error) {
            if (error.message.includes('Undefined symbol')) {
                throw new Error('Unknown function or variable');
            } else if (error.message.includes('Unexpected')) {
                throw new Error('Syntax error in expression');
            } else {
                throw new Error(error.message || 'Mathematical error');
            }
        }
    }
    
    formatResult(result) {
        if (typeof result === 'number') {
            // Handle special cases
            if (isNaN(result)) {
                return 'NaN';
            }
            if (!isFinite(result)) {
                return result > 0 ? 'Infinity' : '-Infinity';
            }
            
            // Format very large or very small numbers
            if (Math.abs(result) > 1e10 || (Math.abs(result) < 1e-6 && result !== 0)) {
                return result.toExponential(6);
            }
            
            // Round to avoid floating point precision issues
            const rounded = Math.round((result + Number.EPSILON) * 1e10) / 1e10;
            return rounded.toString();
        }
        
        // Handle complex numbers or other math.js types
        if (result && typeof result === 'object' && result.toString) {
            return result.toString();
        }
        
        return String(result);
    }
    
    calculate() {
        const expression = this.expressionInput.value.trim();
        if (!expression) return;
        
        try {
            const result = this.evaluateExpression(expression);
            const formattedResult = this.formatResult(result);
            
            // Add to history
            this.addToHistory(expression, formattedResult);
            
            // Update display
            this.resultDisplay.textContent = formattedResult;
            
            // Show step-by-step if enabled
            if (this.stepMode.checked) {
                this.showStepByStep(expression, result);
            }
            
            // Clear input for next calculation
            this.expressionInput.value = '';
            
        } catch (error) {
            this.resultDisplay.textContent = 'Error';
            this.stepDisplay.textContent = error.message;
        }
    }
    
    showStepByStep(expression, result) {
        let steps = [];
        steps.push(`📝 Input: ${expression}`);
        steps.push(''); // Empty line for spacing
        
        try {
            // Handle parentheses first
            if (expression.includes('(') && expression.includes(')')) {
                let currentExpr = expression;
                let stepNum = 1;
                
                // Process nested parentheses from innermost to outermost
                while (currentExpr.includes('(') && currentExpr.includes(')')) {
                    const innerMatch = currentExpr.match(/\(([^()]+)\)/);
                    if (innerMatch) {
                        const innerExpr = innerMatch[1];
                        const innerResult = this.evaluateExpression(innerExpr);
                        const formattedInnerResult = this.formatResult(innerResult);
                        
                        steps.push(`🔹 Step ${stepNum}: Evaluate (${innerExpr})`);
                        steps.push(`   = ${formattedInnerResult}`);
                        steps.push('');
                        
                        currentExpr = currentExpr.replace(innerMatch[0], formattedInnerResult);
                        stepNum++;
                        
                        if (currentExpr !== expression) {
                            steps.push(`🔹 Step ${stepNum}: Substitute result`);
                            steps.push(`   = ${currentExpr}`);
                            steps.push('');
                            stepNum++;
                        }
                    } else {
                        break;
                    }
                }
                
                // Final calculation if there are remaining operations
                if (currentExpr.includes('+') || currentExpr.includes('-') || 
                    currentExpr.includes('*') || currentExpr.includes('/')) {
                    steps.push(`🔹 Step ${stepNum}: Final calculation`);
                    steps.push(`   = ${this.formatResult(result)}`);
                }
            } else {
                // Simple expression without parentheses
                const operators = ['+', '-', '*', '/', '^'];
                const hasOperator = operators.some(op => expression.includes(op));
                
                if (hasOperator) {
                    steps.push(`🔹 Step 1: Calculate ${expression}`);
                    steps.push(`   = ${this.formatResult(result)}`);
                } else {
                    steps.push(`🔹 Direct evaluation`);
                    steps.push(`   = ${this.formatResult(result)}`);
                }
            }
            
            steps.push('');
            steps.push(`✅ Final Result: ${this.formatResult(result)}`);
            
        } catch (e) {
            steps.push(`❌ Error in step calculation`);
            steps.push(`✅ Final Result: ${this.formatResult(result)}`);
        }
        
        this.stepDisplay.textContent = steps.join('\n');
    }
    
    updateStepDisplay() {
        if (this.stepMode.checked && this.expressionInput.value.trim()) {
            try {
                const expression = this.expressionInput.value;
                const result = this.evaluateExpression(expression);
                this.showStepByStep(expression, result);
            } catch (e) {
                this.stepDisplay.textContent = 'Invalid expression';
            }
        } else {
            this.stepDisplay.textContent = '';
        }
    }
    
    addToHistory(expression, result) {
        const historyItem = {
            id: Date.now(),
            expression,
            result,
            timestamp: new Date().toLocaleString()
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 50 items
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.saveHistory();
        this.renderHistory();
    }
    
    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }
    
    loadHistory() {
        this.renderHistory();
    }
    
    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
            return;
        }
        
        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">${item.result}</div>
                <button class="history-delete" data-id="${item.id}">×</button>
            </div>
        `).join('');
    }
    
    handleHistoryClick(e) {
        if (e.target.classList.contains('history-delete')) {
            const id = parseInt(e.target.dataset.id);
            this.deleteHistoryItem(id);
        } else if (e.target.closest('.history-item')) {
            const item = e.target.closest('.history-item');
            const id = parseInt(item.dataset.id);
            const historyItem = this.history.find(h => h.id === id);
            if (historyItem) {
                this.expressionInput.value = historyItem.expression;
                this.handleExpressionInput();
                this.expressionInput.focus();
            }
        }
    }
    
    deleteHistoryItem(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.saveHistory();
        this.renderHistory();
    }
    
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }
    
    copyResult() {
        const result = this.resultDisplay.textContent;
        if (result && result !== '0' && result !== 'Error') {
            navigator.clipboard.writeText(result).then(() => {
                // Visual feedback
                const originalText = this.copyBtn.textContent;
                this.copyBtn.textContent = '✓';
                setTimeout(() => {
                    this.copyBtn.textContent = originalText;
                }, 1000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = result;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            });
        }
    }
    
    toggleMode() {
        this.isScientificMode = !this.isScientificMode;
        
        if (this.isScientificMode) {
            this.basicButtons.classList.add('hidden');
            this.scientificButtons.classList.remove('hidden');
            this.modeToggle.textContent = 'Basic';
        } else {
            this.scientificButtons.classList.add('hidden');
            this.basicButtons.classList.remove('hidden');
            this.modeToggle.textContent = 'Scientific';
        }
    }
    
    changeTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('calculatorTheme', theme);
    }
    
    loadTheme() {
        this.themeSelector.value = this.currentTheme;
        this.changeTheme(this.currentTheme);
    }
    
    switchTab(tabName) {
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab contents
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
    }
    
    addPressAnimation(btn) {
        btn.classList.add('pressed');
        setTimeout(() => {
            btn.classList.remove('pressed');
        }, 150);
    }
    
    setupKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard events when calculator tab is active
            if (!document.getElementById('calculator').classList.contains('active')) return;
            
            // Prevent default for calculator keys
            if ('0123456789+-*/().='.includes(e.key) || e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace') {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.calculate();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.clear();
                }
                // Other keys are handled by the input field naturally
            }
        });
    }
    
    handleKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.calculate();
        }
    }
    
    setupConverters() {
        this.setupUnitConverter();
        this.setupCurrencyConverter();
        this.setupAgeCalculator();
    }
    
    setupUnitConverter() {
        const categorySelect = document.getElementById('unitCategory');
        const fromUnit = document.getElementById('fromUnit');
        const toUnit = document.getElementById('toUnit');
        const fromValue = document.getElementById('fromValue');
        const toValue = document.getElementById('toValue');
        
        const units = {
            length: {
                'm': { name: 'Meters', factor: 1 },
                'cm': { name: 'Centimeters', factor: 100 },
                'mm': { name: 'Millimeters', factor: 1000 },
                'km': { name: 'Kilometers', factor: 0.001 },
                'in': { name: 'Inches', factor: 39.3701 },
                'ft': { name: 'Feet', factor: 3.28084 },
                'yd': { name: 'Yards', factor: 1.09361 },
                'mi': { name: 'Miles', factor: 0.000621371 }
            },
            weight: {
                'kg': { name: 'Kilograms', factor: 1 },
                'g': { name: 'Grams', factor: 1000 },
                'lb': { name: 'Pounds', factor: 2.20462 },
                'oz': { name: 'Ounces', factor: 35.274 },
                'ton': { name: 'Metric Tons', factor: 0.001 }
            },
            temperature: {
                'c': { name: 'Celsius', factor: 1 },
                'f': { name: 'Fahrenheit', factor: 1 },
                'k': { name: 'Kelvin', factor: 1 }
            }
        };
        
        function updateUnitOptions() {
            const category = categorySelect.value;
            const unitList = units[category];
            
            fromUnit.innerHTML = '';
            toUnit.innerHTML = '';
            
            Object.keys(unitList).forEach(key => {
                const option1 = new Option(unitList[key].name, key);
                const option2 = new Option(unitList[key].name, key);
                fromUnit.appendChild(option1);
                toUnit.appendChild(option2);
            });
            
            // Set default selections
            if (category === 'length') {
                fromUnit.value = 'm';
                toUnit.value = 'cm';
            } else if (category === 'weight') {
                fromUnit.value = 'kg';
                toUnit.value = 'lb';
            } else if (category === 'temperature') {
                fromUnit.value = 'c';
                toUnit.value = 'f';
            }
            
            convertUnits();
        }
        
        function convertUnits() {
            const value = parseFloat(fromValue.value);
            if (isNaN(value)) {
                toValue.value = '';
                return;
            }
            
            const category = categorySelect.value;
            const from = fromUnit.value;
            const to = toUnit.value;
            
            let result;
            
            if (category === 'temperature') {
                // Special handling for temperature
                if (from === 'c' && to === 'f') {
                    result = (value * 9/5) + 32;
                } else if (from === 'f' && to === 'c') {
                    result = (value - 32) * 5/9;
                } else if (from === 'c' && to === 'k') {
                    result = value + 273.15;
                } else if (from === 'k' && to === 'c') {
                    result = value - 273.15;
                } else if (from === 'f' && to === 'k') {
                    result = (value - 32) * 5/9 + 273.15;
                } else if (from === 'k' && to === 'f') {
                    result = (value - 273.15) * 9/5 + 32;
                } else {
                    result = value; // Same unit
                }
            } else {
                // Standard conversion using factors
                const fromFactor = units[category][from].factor;
                const toFactor = units[category][to].factor;
                result = value * (toFactor / fromFactor);
            }
            
            toValue.value = result.toFixed(6).replace(/\.?0+$/, '');
        }
        
        categorySelect.addEventListener('change', updateUnitOptions);
        fromUnit.addEventListener('change', convertUnits);
        toUnit.addEventListener('change', convertUnits);
        fromValue.addEventListener('input', convertUnits);
        
        // Initialize
        updateUnitOptions();
    }
    
    setupCurrencyConverter() {
        const fromValue = document.getElementById('currencyFromValue');
        const toValue = document.getElementById('currencyToValue');
        const fromCurrency = document.getElementById('currencyFrom');
        const toCurrency = document.getElementById('currencyTo');
        
        // Mock exchange rates (in real app, you'd fetch from API)
        const exchangeRates = {
            'USD': { 'VND': 24000, 'EUR': 0.85 },
            'VND': { 'USD': 1/24000, 'EUR': 0.85/24000 },
            'EUR': { 'USD': 1/0.85, 'VND': 24000/0.85 }
        };
        
        function convertCurrency() {
            const value = parseFloat(fromValue.value);
            if (isNaN(value)) {
                toValue.value = '';
                return;
            }
            
            const from = fromCurrency.value;
            const to = toCurrency.value;
            
            if (from === to) {
                toValue.value = value;
                return;
            }
            
            const rate = exchangeRates[from][to];
            const result = value * rate;
            
            toValue.value = result.toFixed(2);
        }
        
        fromValue.addEventListener('input', convertCurrency);
        fromCurrency.addEventListener('change', convertCurrency);
        toCurrency.addEventListener('change', convertCurrency);
    }
    
    setupAgeCalculator() {
        const birthDateInput = document.getElementById('birthDate');
        const calculateBtn = document.getElementById('calculateAge');
        const resultDiv = document.getElementById('ageResult');
        
        function calculateAge() {
            const birthDate = new Date(birthDateInput.value);
            if (!birthDateInput.value) {
                resultDiv.textContent = 'Please select a birth date';
                return;
            }
            
            const today = new Date();
            const ageInMs = today - birthDate;
            
            if (ageInMs < 0) {
                resultDiv.textContent = 'Birth date cannot be in the future';
                return;
            }
            
            const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
            const years = Math.floor(ageInDays / 365.25);
            const months = Math.floor((ageInDays % 365.25) / 30.44);
            const days = Math.floor((ageInDays % 365.25) % 30.44);
            
            resultDiv.innerHTML = `
                <div><strong>Age:</strong> ${years} years, ${months} months, ${days} days</div>
                <div><strong>Total Days:</strong> ${ageInDays.toLocaleString()} days</div>
                <div><strong>Total Hours:</strong> ${(ageInDays * 24).toLocaleString()} hours</div>
            `;
        }
        
        calculateBtn.addEventListener('click', calculateAge);
        birthDateInput.addEventListener('change', calculateAge);
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedCalculator();
});