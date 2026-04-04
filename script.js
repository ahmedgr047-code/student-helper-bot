// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const inputForm = document.getElementById('inputForm');
const loadingIndicator = document.getElementById('loadingIndicator');
const characterCount = document.getElementById('characterCount');
const quickButtons = document.querySelectorAll('.quick-btn');
const pdfUploadInput = document.getElementById('pdfUploadInput');

// Configuration - Backend URL
const WEBHOOK_URL = 'https://aahmed.app.n8n.cloud/webhook-test/student-bot';
const MAX_CHARACTERS = 1000;

// State
let isLoading = false;
let currentFile = null;
let isProcessingFile = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    autoResizeTextarea();
    scrollToBottom();
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    addMessage('يبدو أنك غير متصل بالإنترنت. يرجى التحقق من الاتصال.', 'bot');
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

    // PDF Upload button
    const uploadPdfBtn = document.querySelector('[data-action="upload-pdf"]');
    if (uploadPdfBtn) {
        uploadPdfBtn.addEventListener('click', () => {
            pdfUploadInput.click();
        });
    }

    // File input change
    pdfUploadInput.addEventListener('change', handleFileUpload);
}

// Get bot response
async function getBotResponse(userMessage) {
    if (isProcessingFile) return;
    
    showLoading(true);
    
    try {
        // If there's a file uploaded, send it with the question
        if (currentFile) {
            const formData = new FormData();
            formData.append('file', currentFile);
            formData.append('question', userMessage);
            formData.append('timestamp', new Date().toISOString());
            
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`فشل في معالجة الطلب: ${errorText}`);
            }
            
            const data = await response.json();
            const answer = data.answer || data.response || data.message || 'لم يتم استلام رد واضح';
            addMessage(answer, 'bot');
            return;
        }
        
        // No file - regular message
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`فشل في الاتصال: ${errorText}`);
        }
        
        const data = await response.json();
        const answer = data.answer || data.response || data.message || 'لم يتم استلام رد واضح';
        addMessage(answer, 'bot');
        
    } catch (error) {
        console.error('Error:', error);
        addMessage(`عذراً، حدث خطأ: ${error.message}. يرجى المحاولة مرة أخرى.`, 'bot');
    } finally {
        showLoading(false);
    }
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

// Handle quick action buttons
function handleQuickAction(e) {
    const button = e.currentTarget;
    const action = button.dataset.action;
    
    if (action === 'upload-pdf') {
        // Handled separately
        return;
    }
    
    let prompt = '';
    switch (action) {
        case 'pdf':
            prompt = 'أحتاج مساعدة في إيجاد أو إنشاء مواد دراسية بصيغة PDF';
            break;
        case 'summarize':
            prompt = 'يمكنك مساعدتي في تلخيص موضوع دراسي؟';
            break;
        case 'explain':
            prompt = 'يمكنك شرح مفهوم دراسي لي؟';
            break;
    }
    
    if (prompt) {
        messageInput.value = prompt;
        updateCharacterCount();
        autoResizeTextarea();
        messageInput.focus();
        toggleSendButton();
    }
}

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        addMessage('يرجى اختيار ملف PDF صالح', 'bot');
        return;
    }
    
    currentFile = file;
    addMessage(`تم اختيار الملف: ${file.name}`, 'user');
    addMessage('تم رفع الملف بنجاح! يمكنك الآن طرح أسئلتك حول محتوى الملف.', 'bot');
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message fade-in`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    // Format text with markdown-style formatting
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    
    messageText.innerHTML = formattedText;
    content.appendChild(messageText);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
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

// Handle input changes
function handleInputChange() {
    updateCharacterCount();
    autoResizeTextarea();
    toggleSendButton();
}

// Handle keyboard events
function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        inputForm.dispatchEvent(new Event('submit'));
    }
}

// Update character count
function updateCharacterCount() {
    const currentLength = messageInput.value.length;
    characterCount.textContent = `${currentLength} / ${MAX_CHARACTERS}`;
    
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

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== messageInput) {
        e.preventDefault();
        messageInput.focus();
    }
    if (e.key === 'Escape' && document.activeElement === messageInput) {
        messageInput.value = '';
        updateCharacterCount();
        autoResizeTextarea();
        toggleSendButton();
    }
});
