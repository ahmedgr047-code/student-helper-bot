# Student Helper - AI Study Assistant

A modern, responsive educational web application designed to help students quickly access study materials, summaries, and explanations through an intuitive chat interface.

## Features

### 🎨 Modern UI Design
- Clean, minimalist interface with gradient backgrounds
- ChatGPT-style centered chat interface
- Light color scheme (white, blue, soft gray)
- Fully responsive design for mobile and desktop
- Smooth animations and transitions

### 💬 Chat Interface
- Real-time chat with AI assistant
- Message history with user and bot avatars
- Auto-resizing text input
- Character counter (1000 character limit)
- Keyboard shortcuts (Ctrl+Enter to send, Escape to clear)

### 🚀 Quick Actions
- **📘 Get PDF** - Quick access to study materials
- **📖 Summarize** - Request content summaries
- **🧠 Explain** - Get explanations of complex topics

### 📄 PDF Handling
- Automatic PDF link detection
- Download buttons for study materials
- Preview capabilities (when implemented with backend)

### ⚡ Interactive Features
- Loading indicators with animated dots
- Message fade-in animations
- Hover effects and micro-interactions
- Auto-scroll to latest messages
- Network status monitoring

## Technology Stack

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with animations
- **Vanilla JavaScript** - No frameworks required
- **Google Fonts** - Inter font family
- **Responsive Design** - Mobile-first approach

## File Structure

```
student-helper/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and animations
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Installation

1. **Download the files** or clone this repository to your local machine

2. **Open the application**:
   - Simply double-click `index.html` to open in your browser
   - Or use a local server for better development experience

### Using a Local Server (Optional)

For development, you can use a simple local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Configuration

### Webhook Integration

The app is configured to send messages to a webhook URL. To connect to your backend:

1. Open `script.js`
2. Find the `WEBHOOK_URL` constant (line 4)
3. Replace `'https://your-n8n-webhook-url.com'` with your actual webhook URL

```javascript
const WEBHOOK_URL = 'https://your-actual-webhook-url.com';
```

### Expected Webhook Response Format

Your webhook should accept POST requests with this format:

```json
{
  "message": "User's message text",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

And respond with:

```json
{
  "response": "AI response text",
  "pdfUrl": "https://example.com/study-material.pdf" // Optional
}
```

## Features in Detail

### Chat Functionality
- **Message Sending**: Type your question and click send or press Ctrl+Enter
- **Quick Actions**: Use the action buttons for common requests
- **PDF Detection**: Automatic detection and display of PDF links
- **Loading States**: Visual feedback while waiting for responses

### Responsive Design
- **Desktop**: Full-featured chat interface with side-by-side layout
- **Tablet**: Optimized for touch interactions
- **Mobile**: Compact design with vertical layout

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: Send message
- `Escape`: Clear input field
- `/`: Focus input field (when not typing)

## Customization

### Colors and Themes
Modify the CSS variables in `styles.css` to customize colors:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Adding New Quick Actions
1. Add button in `index.html`:
```html
<button class="quick-btn" data-action="new-action">
    <span class="quick-btn-icon">🆕</span>
    <span class="quick-btn-text">New Action</span>
</button>
```

2. Update `script.js` to handle the new action:
```javascript
case 'new-action':
    prompt = 'Your new prompt here';
    break;
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development Notes

### Code Structure
- **Modular JavaScript**: Functions are organized by purpose
- **Semantic HTML**: Proper use of HTML5 elements
- **CSS Architecture**: Organized with clear sections and comments
- **Error Handling**: Network error handling and user feedback

### Performance
- **Optimized Animations**: CSS transforms for smooth 60fps animations
- **Efficient DOM Manipulation**: Minimal reflows and repaints
- **Lazy Loading**: Images and content load as needed

## Future Enhancements

- [ ] Voice input/output support
- [ ] File upload for documents
- [ ] User authentication and profiles
- [ ] Study session history
- [ ] Collaborative study features
- [ ] Integration with educational platforms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or support, please open an issue in the repository.

---

**Made with ❤️ for students everywhere**
