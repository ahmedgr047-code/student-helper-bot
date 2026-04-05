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

// Configuration - Backend URL and API Settings
const WEBHOOK_URL = 'https://student-helper-bot.vercel.app/webhook-test/student-bot';
const API_KEY = 'REPLACE_WITH_GROQ_API_KEY'; // Injected by GitHub Actions during deployment
const MODEL_NAME = 'llama-3.3-70b-versatile';
const MAX_CHARACTERS = 1000;

// GitHub Repository Configuration for Dynamic Folder Access
// IMPORTANT: Set these in GitHub Secrets or update manually
const GITHUB_OWNER = 'YOUR_GITHUB_USERNAME'; // Replace with your GitHub username
const GITHUB_REPO = 'YOUR_REPO_NAME';          // Replace with your repository name
const GITHUB_BRANCH = 'main';                  // Branch containing the folders

// Subject to Folder mapping for quick access
const SUBJECT_FOLDERS = {
    'شبكات': 'networks',
    'networks': 'networks',
    'الشبكات': 'networks',
    'برمجة': 'programming',
    'programming': 'programming',
    'البرمجة': 'programming',
    'قواعد بيانات': 'databases',
    'databases': 'databases',
    'قواعد البيانات': 'databases',
    'أمن': 'security',
    'security': 'security',
    'الأمن السيبراني': 'security',
    'ذكاء اصطناعي': 'ai',
    'ai': 'ai',
    'الذكاء الاصطناعي': 'ai',
    'هندسة': 'engineering',
    'engineering': 'engineering',
    'الهندسة': 'engineering'
};

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

// 2. إنشاء دردشة جديدة وتحزين السابقة
function createNewChat() {
    const currentMessages = chatMessages.innerHTML;
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    
    // Save current chat if it has messages (more than welcome message)
    if (chatMessages.children.length > 1) {
        chats.push({ 
            id: Date.now(), 
            messages: currentMessages,
            timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('chats', JSON.stringify(chats));
    }
    
    // Clear and start new chat
    chatMessages.innerHTML = `
        <div class="message bot-message fade-in">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-text" id="botWelcomeMessage">
                    مرحباً! هذه دردشة جديدة. كيف يمكنني مساعدتك اليوم؟
                </div>
            </div>
        </div>
    `;
    currentFile = null;
    
    const lang = currentUser?.language || 'ar';
    const message = lang === 'ar' 
        ? 'تم إنشاء دردشة جديدة!'
        : 'New chat created!';
    addMessage(message, 'bot');
}

// Start New Chat (alias for createNewChat)
function startNewChat() {
    createNewChat();
}

// 3. عرض الدردشات السابقة في modal
function showPreviousChats() {
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    
    if (chats.length === 0) {
        const lang = currentUser?.language || 'ar';
        const message = lang === 'ar' 
            ? 'لا توجد دردشات سابقة'
            : 'No previous chats';
        addMessage(message, 'bot');
        return;
    }
    
    // Create modal for previous chats
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'previousChatsModal';
    
    const lang = currentUser?.language || 'ar';
    const title = lang === 'ar' ? 'الدردشات السابقة' : 'Previous Chats';
    
    let chatListHtml = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-btn" id="closePreviousChats">&times;</button>
            </div>
            <div class="modal-body">
                <div class="previous-chats-list">
    `;
    
    chats.forEach((chat, index) => {
        const chatName = lang === 'ar' 
            ? `دردشة ${new Date(chat.id).toLocaleString()}`
            : `Chat ${new Date(chat.id).toLocaleString()}`;
        chatListHtml += `
            <div class="chat-item" data-index="${index}">
                <span class="menu-icon">💬</span>
                <span>${chatName}</span>
            </div>
        `;
    });
    
    chatListHtml += `
                </div>
            </div>
        </div>
    `;
    
    modal.innerHTML = chatListHtml;
    document.body.appendChild(modal);
    
    // Add click listeners
    modal.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            const chat = chats[index];
            if (chat) {
                chatMessages.innerHTML = chat.messages;
                document.body.removeChild(modal);
                closeMenu();
            }
        });
    });
    
    // Close button
    document.getElementById('closePreviousChats').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Update Previous Chats List
function updatePreviousChatsList() {
    const previousChats = document.getElementById('previousChats');
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    
    if (chats.length === 0) {
        previousChats.innerHTML = '<div class="no-chats">لا توجد دردشات سابقة</div>';
        return;
    }
    
    previousChats.innerHTML = chats.map((chat, index) => {
        const chatName = `دردشة ${new Date(chat.id).toLocaleString()}`;
        return `
            <div class="menu-item previous-chat" data-index="${index}">
                <span class="menu-icon">💬</span>
                <div>
                    <div>${chatName}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click listeners
    document.querySelectorAll('.previous-chat').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            const chat = chats[index];
            if (chat) {
                chatMessages.innerHTML = chat.messages;
                closeMenu();
            }
        });
    });
}

// Load Previous Chat (legacy - now handled in updatePreviousChatsList)
function loadChat(index) {
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    const chat = chats[index];
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
    
    // 1. Send message on Enter (without Shift)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            inputForm.dispatchEvent(new Event('submit'));
        }
        handleKeyDown(e);
    });
    
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
                    model: MODEL_NAME,  // Model specification for Groq API
                    apiKey: API_KEY,    // Injected secret key for authentication
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

// =============================================================================
// GITHUB CONTENTS API - Dynamic Folder Fetching
// Engineering & Networks Implementation
// =============================================================================

/**
 * Detect subject from user message using keyword matching
 * Returns the folder name or null if no match found
 */
function detectSubjectFromMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check predefined subject mappings
    for (const [keyword, folder] of Object.entries(SUBJECT_FOLDERS)) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
            return folder;
        }
    }
    
    return null;
}

/**
 * Fetch files from GitHub repository Contents API
 * @param {string} folderName - Name of the folder to fetch (e.g., 'networks')
 * @returns {Promise<Array>} - Array of file objects with name and download_url
 */
async function fetchFilesFromGithub(folderName) {
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${folderName}?ref=${GITHUB_BRANCH}`;
    
    try {
        const response = await fetchWithTimeout(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Student-Helper-Bot'
            }
        }, 15000);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Folder '${folderName}' not found in repository`);
            }
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filter only PDF files
        const pdfFiles = data
            .filter(item => item.type === 'file' && item.name.toLowerCase().endsWith('.pdf'))
            .map(file => ({
                name: file.name,
                download_url: file.download_url,
                size: file.size,
                path: file.path
            }));
        
        return pdfFiles;
        
    } catch (error) {
        console.error('GitHub API Error:', error);
        throw error;
    }
}

/**
 * Format file list response for the user
 * @param {Array} files - Array of file objects
 * @param {string} subjectName - Name of the subject (for display)
 * @param {string} lang - Language code ('ar' or 'en')
 * @returns {string} - Formatted response message
 */
function formatFileListResponse(files, subjectName, lang) {
    if (files.length === 0) {
        return lang === 'ar' 
            ? `📂 لا توجد ملفات PDF متاحة في مادة ${subjectName} حالياً.`
            : `📂 No PDF files available for ${subjectName} at the moment.`;
    }
    
    const header = lang === 'ar'
        ? `📚 إليك كل ملفات مادة ${subjectName} المتاحة:`
        : `📚 Here are all available files for ${subjectName}:`;
    
    const fileList = files.map((file, index) => {
        const sizeKB = (file.size / 1024).toFixed(1);
        return `${index + 1}. [${file.name}](${file.download_url}) (${sizeKB} KB)`;
    }).join('\n');
    
    const footer = lang === 'ar'
        ? '\n\n💡 اضغط على أي رابط لتحميل الملف مباشرة.'
        : '\n\n💡 Click any link to download the file directly.';
    
    return `${header}\n\n${fileList}${footer}`;
}

/**
 * Handle subject/folder query from user
 * Main entry point for dynamic folder fetching
 */
async function handleSubjectQuery(userMessage) {
    const lang = currentUser?.language || 'ar';
    
    try {
        // Step 1: Detect subject from message
        const detectedFolder = detectSubjectFromMessage(userMessage);
        
        if (!detectedFolder) {
            // No subject detected - return null to let normal bot response handle it
            return null;
        }
        
        // Step 2: Show loading state
        showLoading(true);
        
        // Step 3: Fetch files from GitHub
        const files = await fetchFilesFromGithub(detectedFolder);
        
        // Step 4: Format and return response
        const subjectDisplayName = lang === 'ar' 
            ? Object.keys(SUBJECT_FOLDERS).find(k => SUBJECT_FOLDERS[k] === detectedFolder && k.length > 3) || detectedFolder
            : detectedFolder;
        
        const response = formatFileListResponse(files, subjectDisplayName, lang);
        
        return response;
        
    } catch (error) {
        console.error('Subject Query Error:', error);
        
        const errorMsg = lang === 'ar'
            ? `❌ عذراً، لم أتمكن من جلب الملفات: ${error.message}`
            : `❌ Sorry, couldn't fetch files: ${error.message}`;
        
        return errorMsg;
        
    } finally {
        showLoading(false);
    }
}

// =============================================================================

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
    
    // Step 1: Try to handle as subject query first (GitHub folder fetch)
    const subjectResponse = await handleSubjectQuery(message);
    
    if (subjectResponse) {
        // It's a subject query - display the file list response
        addMessage(subjectResponse, 'bot');
        return;
    }
    
    // Step 2: Not a subject query - proceed with normal bot response
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
