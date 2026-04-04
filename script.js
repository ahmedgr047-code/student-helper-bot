// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const inputForm = document.getElementById('inputForm');
const loadingIndicator = document.getElementById('loadingIndicator');
const characterCount = document.getElementById('characterCount');
const quickButtons = document.querySelectorAll('.quick-btn');
const pdfUploadInput = document.getElementById('pdfUploadInput');

// Menu Elements
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');
const userNameDisplay = document.getElementById('userNameDisplay');
const welcomeMessage = document.getElementById('welcomeMessage');
const botWelcomeMessage = document.getElementById('botWelcomeMessage');
const newChatBtn = document.getElementById('newChatBtn');
const settingsBtn = document.getElementById('settingsBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Settings Modal Elements
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const editUsername = document.getElementById('editUsername');
const editLanguage = document.getElementById('editLanguage');
const saveSettings = document.getElementById('saveSettings');

// Configuration - Backend URL
const WEBHOOK_URL = 'https://student-helper-bot.vercel.app/webhook-test/student-bot';
const MAX_CHARACTERS = 1000;

// State
let isLoading = false;
let currentFile = null;
let isProcessingFile = false;
let currentUser = null;
let chatHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    setupMenuListeners();
    setupSettingsModal();
    autoResizeTextarea();
    scrollToBottom();
});

// Check Authentication
function checkAuth() {
    const userData = localStorage.getItem('studentHelper_user');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    updateUserDisplay();
}

// Update User Display
function updateUserDisplay() {
    if (currentUser) {
        const displayName = currentUser.username || 'زائر';
        userNameDisplay.textContent = displayName;
        welcomeMessage.textContent = `مرحباً ${displayName}!`;
        
        // Update bot welcome message with username
        const lang = currentUser.language || 'ar';
        if (lang === 'ar') {
            botWelcomeMessage.textContent = `مرحباً ${displayName}! أنا مساعدك الدراسي الذكي. يمكنني مساعدتك في رفع ملفات PDF والإجابة على أسئلتك حول المحتوى. كيف يمكنني مساعدتك اليوم؟`;
            messageInput.placeholder = 'اسألني أي شيء عن دراستك...';
        } else {
            botWelcomeMessage.textContent = `Hello ${displayName}! I'm your AI study assistant. I can help you upload PDF files and answer questions about their content. How can I assist you today?`;
            messageInput.placeholder = 'Ask me anything about your studies...';
        }
        
        // Update settings form
        editUsername.value = currentUser.username || '';
        editLanguage.value = currentUser.language || 'ar';
    }
}

// Setup Menu Event Listeners
function setupMenuListeners() {
    // Hamburger menu toggle
    hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        sideMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });
    
    // Close menu when clicking overlay
    menuOverlay.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    });
    
    // New chat button
    newChatBtn.addEventListener('click', () => {
        startNewChat();
        closeMenu();
    });
    
    // Settings button
    settingsBtn.addEventListener('click', () => {
        openSettingsModal();
        closeMenu();
    });
    
    // Logout button
    logoutBtn.addEventListener('click', () => {
        logout();
    });
}

// Close Menu
function closeMenu() {
    hamburgerMenu.classList.remove('active');
    sideMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
}

// Setup Settings Modal
function setupSettingsModal() {
    closeSettings.addEventListener('click', closeSettingsModal);
    
    saveSettings.addEventListener('click', () => {
        const newUsername = editUsername.value.trim();
        const newLanguage = editLanguage.value;
        
        if (newUsername) {
            currentUser.username = newUsername;
            currentUser.language = newLanguage;
            localStorage.setItem('studentHelper_user', JSON.stringify(currentUser));
            updateUserDisplay();
            closeSettingsModal();
            
            // Show success message
            const lang = newLanguage;
            const message = lang === 'ar' 
                ? 'تم حفظ الإعدادات بنجاح!'
                : 'Settings saved successfully!';
            addMessage(message, 'bot');
        }
    });
    
    // Close modal on overlay click
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });
}

// Open Settings Modal
function openSettingsModal() {
    settingsModal.classList.add('active');
}

// Close Settings Modal
function closeSettingsModal() {
    settingsModal.classList.remove('active');
}

// Start New Chat
function startNewChat() {
    // Save current chat to history if has messages
    if (chatMessages.children.length > 1) {
        const chatTitle = chatHistory.length === 0 ? 'دردشة 1' : `دردشة ${chatHistory.length + 1}`;
        chatHistory.push({
            title: chatTitle,
            date: new Date().toLocaleDateString(),
            messages: chatMessages.innerHTML
        });
        updatePreviousChatsList();
    }
    
    // Clear chat messages except welcome
    chatMessages.innerHTML = `
        <div class="message bot-message fade-in">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-text" id="botWelcomeMessage">
                    ${botWelcomeMessage.textContent}
                </div>
            </div>
        </div>
    `;
    currentFile = null;
}

// Update Previous Chats List
function updatePreviousChatsList() {
    const previousChats = document.getElementById('previousChats');
    if (chatHistory.length === 0) {
        previousChats.innerHTML = '<div class="no-chats">لا توجد دردشات سابقة</div>';
        return;
    }
    
    previousChats.innerHTML = chatHistory.map((chat, index) => `
        <div class="menu-item previous-chat" data-index="${index}">
            <span class="menu-icon">💬</span>
            <div>
                <div>${chat.title}</div>
                <small style="color: var(--text-secondary);">${chat.date}</small>
            </div>
        </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.previous-chat').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            loadChat(index);
        });
    });
}

// Load Previous Chat
function loadChat(index) {
    const chat = chatHistory[index];
    if (chat) {
        chatMessages.innerHTML = chat.messages;
        closeMenu();
    }
}

// Logout
function logout() {
    localStorage.removeItem('studentHelper_user');
    window.location.href = 'login.html';
}

// Offline handling
window.addEventListener('offline', () => {
    console.log('Connection lost');
    const lang = currentUser?.language || 'ar';
    const msg = lang === 'ar'
        ? 'يبدو أنك غير متصل بالإنترنت. يرجى التحقق من الاتصال.'
        : 'You appear to be offline. Please check your internet connection.';
    addMessage(msg, 'bot');
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
async function getBotResponse(userMessage, retryCount = 0) {
    if (isProcessingFile) return;
    
    showLoading(true);
    
    const MAX_RETRIES = 2;
    const lang = currentUser?.language || 'ar';
    
    try {
        // Prepare request based on whether there's a file
        let response;
        
        if (currentFile) {
            const formData = new FormData();
            formData.append('file', currentFile);
            formData.append('question', userMessage);
            formData.append('timestamp', new Date().toISOString());
            formData.append('username', currentUser?.username || '');
            
            response = await fetchWithTimeout(WEBHOOK_URL, {
                method: 'POST',
                body: formData
            }, 30000);
        } else {
            const personalizedMessage = currentUser?.username 
                ? `${userMessage} (مستخدم: ${currentUser.username})`
                : userMessage;
            
            response = await fetchWithTimeout(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: personalizedMessage,
                    username: currentUser?.username || '',
                    language: lang,
                    timestamp: new Date().toISOString()
                })
            }, 30000);
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }
        
        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.warn('Non-JSON response:', text.substring(0, 200));
            throw new Error('الخادم لم يرد بصيغة JSON. ربما يحتاج للتفعيل.');
        }
        
        const data = await response.json();
        const answer = data.answer || data.response || data.message || data.text || 'لم يتم استلام رد واضح';
        addMessage(answer, 'bot');
        
    } catch (error) {
        console.error('Fetch Error:', error);
        
        // Retry on network errors
        if (retryCount < MAX_RETRIES && (error.name === 'TypeError' || error.name === 'AbortError')) {
            console.log(`Retrying... attempt ${retryCount + 1}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return getBotResponse(userMessage, retryCount + 1);
        }
        
        // If all retries failed, use mock response for demo
        if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
            console.warn('Backend unavailable, using mock response');
            const mockResponse = generateMockResponse(userMessage, lang);
            addMessage(mockResponse, 'bot');
            return;
        }
        
        // Show error message
        const errorMsg = lang === 'ar' 
            ? `عذراً ${currentUser?.username || ''}، حدث خطأ في الاتصال: ${error.message}. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.`
            : `Sorry ${currentUser?.username || ''}, connection error: ${error.message}. Please check your internet connection and try again.`;
        addMessage(errorMsg, 'bot');
    } finally {
        showLoading(false);
    }
}

// Fetch with timeout
async function fetchWithTimeout(url, options, timeout = 30000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// Generate mock response for testing when backend is unavailable
function generateMockResponse(message, lang) {
    const username = currentUser?.username || '';
    
    if (lang === 'ar') {
        const responses = [
            `مرحباً ${username}! أنا هنا للمساعدة. سؤالك عن "${message.substring(0, 30)}..." مهم جداً. [وضع تجريبي - الخادم غير متصل]`,
            `شكراً على سؤالك يا ${username}! للأسف الخادم غير متصل حالياً، لكن يمكنك تجربة:
- رفع ملف PDF
- طرح أسئلة أخرى
- التحقق من الإعدادات`,
            `${username}، أقدر اهتمامك! الخادم يواجه مشكلة مؤقتة. حاول مرة أخرى بعد قليل أو تأكد من الرابط.`,
            `أهلاً ${username}! 📚 أنا مساعدك الدراسي. سؤالك واضح ولكني أحتاج الاتصال بالخادم للإجابة. [محاكاة وضع عدم الاتصال]`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    } else {
        const responses = [
            `Hello ${username}! I'm here to help. Your question about "${message.substring(0, 30)}..." is very important. [Demo mode - server offline]`,
            `Thanks for your question ${username}! Unfortunately the server is currently offline, but you can try:\n- Upload a PDF file\n- Ask other questions\n- Check settings`,
            `${username}, I appreciate your interest! The server is having temporary issues. Try again in a moment or check the URL.`,
            `Hi ${username}! 📚 I'm your study assistant. Your question is clear but I need server connection to answer. [Offline simulation mode]`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
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
    
    const lang = currentUser?.language || 'ar';
    let prompt = '';
    
    if (lang === 'ar') {
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
    } else {
        switch (action) {
            case 'pdf':
                prompt = 'I need help finding or creating PDF study materials';
                break;
            case 'summarize':
                prompt = 'Can you help me summarize a study topic?';
                break;
            case 'explain':
                prompt = 'Can you explain a study concept to me?';
                break;
        }
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
        const lang = currentUser?.language || 'ar';
        const msg = lang === 'ar' 
            ? 'يرجى اختيار ملف PDF صالح'
            : 'Please select a valid PDF file';
        addMessage(msg, 'bot');
        return;
    }
    
    currentFile = file;
    const lang = currentUser?.language || 'ar';
    const selectedMsg = lang === 'ar' 
        ? `تم اختيار الملف: ${file.name}`
        : `Selected file: ${file.name}`;
    const successMsg = lang === 'ar'
        ? 'تم رفع الملف بنجاح! يمكنك الآن طرح أسئلتك حول محتوى الملف.'
        : 'File uploaded successfully! You can now ask questions about the file content.';
    addMessage(selectedMsg, 'user');
    addMessage(successMsg, 'bot');
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
