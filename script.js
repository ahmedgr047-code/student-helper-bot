// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const inputForm = document.getElementById('inputForm');
const loadingIndicator = document.getElementById('loadingIndicator');
const characterCount = document.getElementById('characterCount');
const quickButtons = document.querySelectorAll('.quick-btn');

// Configuration
const WEBHOOK_URL = 'https://your-n8n-webhook-url.com';
const MAX_CHARACTERS = 1000;

// State
let isLoading = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    autoResizeTextarea();
    scrollToBottom();
});

// Setup Event Listeners
function setupEventListeners() {
    // Form submission
    inputForm.addEventListener('submit', handleSubmit);
    
    // Input events
    messageInput.addEventListener('input', handleInputChange);
    messageInput.addEventListener('keydown', handleKeyDown);
    
    // Quick action buttons
    quickButtons.forEach(button => {
        button.addEventListener('click', handleQuickAction);
    });
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (!message || isLoading) return;
    
    // Clear input and reset
    messageInput.value = '';
    updateCharacterCount();
    autoResizeTextarea();
    
    // Add user message
    addMessage(message, 'user');
    
    // Show loading and get response
    await getBotResponse(message);
}

// Handle input changes
function handleInputChange() {
    updateCharacterCount();
    autoResizeTextarea();
    toggleSendButton();
}

// Handle keyboard events
function handleKeyDown(e) {
    // Send message on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        inputForm.dispatchEvent(new Event('submit'));
    }
}

// Handle quick action buttons
function handleQuickAction(e) {
    const button = e.currentTarget;
    const action = button.dataset.action;
    
    let prompt = '';
    switch (action) {
        case 'pdf':
            prompt = 'I need a PDF for my studies. Can you help me find relevant study materials?';
            break;
        case 'summarize':
            prompt = 'Can you summarize a topic for me? Please specify what you\'d like me to summarize.';
            break;
        case 'explain':
            prompt = 'Can you explain a concept to me? Please tell me what you\'d like me to explain.';
            break;
    }
    
    messageInput.value = prompt;
    updateCharacterCount();
    autoResizeTextarea();
    messageInput.focus();
    toggleSendButton();
}

// Add message to chat
function addMessage(text, sender, additionalContent = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message fade-in`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = text;
    
    content.appendChild(messageText);
    
    // Add additional content (like PDF links)
    if (additionalContent) {
        content.appendChild(additionalContent);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    return messageDiv;
}

// Get bot response from webhook
async function getBotResponse(userMessage) {
    showLoading(true);
    
    try {
        // Simulate API call delay
        await simulateNetworkDelay();
        
        // Mock response for demonstration
        const mockResponse = generateMockResponse(userMessage);
        
        // Check if response contains PDF links
        const pdfContent = extractPDFLinks(mockResponse);
        
        // Add bot message
        addMessage(mockResponse, 'bot', pdfContent);
        
        // In a real implementation, you would make an actual API call:
        // const response = await fetch(WEBHOOK_URL, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         message: userMessage,
        //         timestamp: new Date().toISOString()
        //     })
        // });
        
        // if (!response.ok) throw new Error('Network response was not ok');
        // const data = await response.json();
        // const pdfContent = extractPDFLinks(data.response);
        // addMessage(data.response, 'bot', pdfContent);
        
    } catch (error) {
        console.error('Error getting bot response:', error);
        addMessage('Sorry, I encountered an error while processing your request. Please try again.', 'bot');
    } finally {
        showLoading(false);
    }
}

// Generate mock response for demonstration
function generateMockResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('pdf') || message.includes('study material')) {
        return 'I can help you find study materials! Based on your request, I\'ve found some relevant PDF resources for you. You can download them using the link below.';
    } else if (message.includes('summarize') || message.includes('summary')) {
        return 'I\'d be happy to help you summarize content! Please provide the text or topic you\'d like me to summarize, and I\'ll create a concise summary for you.';
    } else if (message.includes('explain') || message.includes('explanation')) {
        return 'I can explain complex concepts in simple terms! Please tell me what topic or concept you\'d like me to explain, and I\'ll break it down for you.';
    } else if (message.includes('math') || message.includes('calculus') || message.includes('integration')) {
        return 'Integration is a fundamental concept in calculus! It\'s essentially the reverse process of differentiation. Integration helps us find areas under curves, accumulated quantities, and solve many real-world problems. There are two main types: definite and indefinite integrals. Would you like me to explain a specific aspect of integration?';
    } else if (message.includes('physics') || message.includes('quantum')) {
        return 'Quantum physics is fascinating! It describes nature at the smallest scales of energy levels of atoms and subatomic particles. Key concepts include wave-particle duality, uncertainty principle, and quantum entanglement. What specific aspect of quantum physics interests you?';
    } else {
        return 'Thank you for your message! I\'m here to help you with your studies. I can assist with finding PDFs, summarizing topics, and explaining concepts. What specific subject or topic would you like help with?';
    }
}

// Extract PDF links from response and create download button
function extractPDFLinks(response) {
    // Check if response mentions PDFs or study materials
    if (response.toLowerCase().includes('pdf') || response.toLowerCase().includes('download')) {
        const pdfContainer = document.createElement('div');
        
        const pdfLink = document.createElement('a');
        pdfLink.href = '#'; // In real implementation, this would be actual PDF URL
        pdfLink.className = 'pdf-link';
        pdfLink.innerHTML = `
            <span class="pdf-icon">📄</span>
            <span>Download Study Material</span>
        `;
        
        // Add click handler for demo
        pdfLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('PDF download feature would be implemented here with actual file URLs from the API response.');
        });
        
        pdfContainer.appendChild(pdfLink);
        return pdfContainer;
    }
    
    return null;
}

// Show/hide loading indicator
function showLoading(show) {
    isLoading = show;
    loadingIndicator.classList.toggle('active', show);
    toggleSendButton();
    
    if (show) {
        scrollToBottom();
    }
}

// Simulate network delay for demonstration
function simulateNetworkDelay() {
    return new Promise(resolve => {
        const delay = 1000 + Math.random() * 2000; // 1-3 seconds
        setTimeout(resolve, delay);
    });
}

// Update character count
function updateCharacterCount() {
    const currentLength = messageInput.value.length;
    characterCount.textContent = `${currentLength} / ${MAX_CHARACTERS}`;
    
    // Change color when approaching limit
    if (currentLength > MAX_CHARACTERS * 0.9) {
        characterCount.style.color = '#e53e3e';
    } else if (currentLength > MAX_CHARACTERS * 0.7) {
        characterCount.style.color = '#ed8936';
    } else {
        characterCount.style.color = '#a0aec0';
    }
}

// Toggle send button state
function toggleSendButton() {
    const hasText = messageInput.value.trim().length > 0;
    sendButton.disabled = !hasText || isLoading;
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Utility function to format timestamps (for future use)
function formatTimestamp(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
}

// Add typing indicator animation
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="message-text">
                <span class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
    
    return typingDiv;
}

// Remove typing indicator
function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

// Error handling for network issues
window.addEventListener('online', () => {
    console.log('Connection restored');
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    addMessage('You appear to be offline. Please check your internet connection.', 'bot');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Focus input on '/' key (when not typing in input)
    if (e.key === '/' && document.activeElement !== messageInput) {
        e.preventDefault();
        messageInput.focus();
    }
    
    // Clear input on Escape
    if (e.key === 'Escape' && document.activeElement === messageInput) {
        messageInput.value = '';
        updateCharacterCount();
        autoResizeTextarea();
        toggleSendButton();
    }
});
