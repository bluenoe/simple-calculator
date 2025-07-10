# 🧮 Fancy Calculator

A beautiful, modern calculator with dark/light theme support, smooth animations, and responsive design inspired by iOS/Android calculators.

![Calculator Preview](https://img.shields.io/badge/Status-Complete-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## ✨ Features

### 🎨 Modern Design
- **Clean, minimalist interface** with flat design principles
- **Light blue gradient background** for a soothing visual experience
- **Soft shadows and subtle borders** instead of harsh 3D effects
- **Material Design inspired** color scheme

### 🌙 Theme Support
- **Dark/Light mode toggle** with smooth transitions
- **Persistent theme preference** saved in localStorage
- **Animated theme switching** with rotation effect

### 🔢 Calculator Functions
- **Basic arithmetic operations**: Addition (+), Subtraction (−), Multiplication (×), Division (÷)
- **Decimal number support** with proper validation
- **Clear all (AC)** and **delete last digit (⌫)** functions
- **Error handling** for division by zero and invalid operations
- **Floating point precision** handling to avoid calculation errors

### 📱 Enhanced UX
- **Operation display** showing current calculation (e.g., "25 +")
- **Complete calculation history** shown after pressing equals (e.g., "25 + 15 =")
- **Active operator highlighting** with visual feedback
- **Haptic feedback** on mobile devices
- **Smooth animations** for all interactions
- **Button press feedback** with scale and opacity effects

### ⌨️ Input Support
- **Full keyboard support** for all operations
- **Touch-friendly** interface for mobile devices
- **Responsive design** that works on all screen sizes
- **Prevent zoom on double-tap** for better mobile experience

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server)

### Installation

1. **Clone or download** the project files
2. **Navigate** to the project directory
3. **Start a local server**:
   ```bash
   python -m http.server 8000
   ```
4. **Open your browser** and go to `http://localhost:8000`

### Alternative Setup
You can also open `index.html` directly in your browser, but using a local server is recommended for the best experience.

## 📁 Project Structure

```
Calculator/
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── script.js           # Calculator logic and interactions
└── README.md           # Project documentation
```

## 🛠️ Technical Details

### HTML Structure
- **Semantic HTML5** with proper accessibility attributes
- **Grid layout** for button arrangement
- **Data attributes** for clean JavaScript interaction

### CSS Features
- **CSS Grid** for responsive button layout
- **CSS Custom Properties** for consistent theming
- **Flexbox** for display alignment
- **CSS Animations** and transitions for smooth UX
- **Media queries** for responsive design
- **Backdrop-filter** for glassmorphism effect

### JavaScript Architecture
- **ES6 Class-based** structure for clean code organization
- **Event delegation** for efficient event handling
- **State management** for calculator operations
- **Error handling** with user-friendly feedback
- **Local storage** for theme persistence

## 🎯 Key Components

### Calculator Class
```javascript
class Calculator {
    constructor()           // Initialize calculator
    inputNumber()          // Handle number input
    inputOperator()        // Handle operator selection
    calculate()            // Perform calculations
    updateDisplay()        // Update main display
    updateOperationDisplay() // Update operation history
    toggleTheme()          // Switch between themes
}
```

### Color Scheme

#### Light Mode
- Background: Light blue gradient (`#e3f2fd` to `#bbdefb`)
- Numbers: White buttons with subtle shadows
- Operators: Blue (`#2196f3`)
- Equals: Green (`#4caf50`)
- Clear: Orange (`#ff9800`)

#### Dark Mode
- Background: Dark gradient (`#1a1a2e` to `#16213e`)
- Numbers: Dark gray buttons
- Operators: Blue (consistent with light mode)
- Enhanced contrast for accessibility

## 📱 Responsive Design

- **Desktop**: Full-featured layout with hover effects
- **Tablet**: Optimized button sizes and spacing
- **Mobile**: Touch-friendly interface with haptic feedback
- **Small screens**: Compact layout with adjusted font sizes

## 🔧 Customization

### Adding New Features
1. **New operations**: Add to `performCalculation()` method
2. **UI elements**: Update HTML structure and CSS styling
3. **Themes**: Modify CSS custom properties

### Styling Modifications
- Colors can be easily changed in the CSS file
- Animation durations and effects are configurable
- Button layouts can be modified through CSS Grid properties

## 🐛 Known Issues & Limitations

- **Large numbers**: Display truncates very large numbers
- **Scientific notation**: Limited support for exponential notation
- **Memory functions**: M+, M-, MR not implemented
- **Advanced operations**: No support for square root, percentage, etc.

## 🚀 Future Enhancements

- [ ] **Scientific calculator mode** with advanced functions
- [ ] **Calculation history** with persistent storage
- [ ] **Memory functions** (M+, M-, MR, MC)
- [ ] **Keyboard shortcuts** display
- [ ] **Sound effects** for button presses
- [ ] **Multiple themes** beyond dark/light
- [ ] **Export calculations** to clipboard

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by iOS and Android calculator designs
- Material Design principles for color and interaction patterns
- Modern web development best practices

---

**Enjoy calculating! 🧮✨**