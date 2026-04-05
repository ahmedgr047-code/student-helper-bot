// Login functionality
// Engineered by Ahmed Qareez

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const language = document.getElementById('language').value;
        
        // Basic validation
        if (!username) {
            loginError.textContent = 'يرجى إدخال اسم المستخدم';
            loginError.style.display = 'block';
            return;
        }
        
        // Clear error
        loginError.style.display = 'none';
        
        // Save user data
        localStorage.setItem('studentHelper_user', JSON.stringify({
            username: username,
            language: language,
            loginTime: new Date().toISOString()
        }));
        
        // Redirect to main app
        window.location.href = 'index.html';
    });
    
    // Forgot Password Modal functionality
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotPassword = document.getElementById('closeForgotPassword');
    const sendResetCode = document.getElementById('sendResetCode');
    const verifyCode = document.getElementById('verifyCode');
    const resetCodeContainer = document.getElementById('resetCodeContainer');
    const resetError = document.getElementById('resetError');
    
    // Open forgot password modal
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordModal.style.display = 'block';
        resetCodeContainer.style.display = 'none';
        resetError.style.display = 'none';
        document.getElementById('resetEmail').value = '';
        document.getElementById('resetCode').value = '';
    });
    
    // Close forgot password modal
    closeForgotPassword.addEventListener('click', () => {
        forgotPasswordModal.style.display = 'none';
    });
    
    // Close on click outside
    forgotPasswordModal.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
    });
    
    // Send reset code
    sendResetCode.addEventListener('click', () => {
        const email = document.getElementById('resetEmail').value.trim();
        
        if (!email || !email.includes('@')) {
            resetError.textContent = 'البريد الإلكتروني غير صحيح';
            resetError.style.display = 'block';
            return;
        }
        
        // In real app: Send verification code to email
        // For demo: just show the code input
        resetError.style.display = 'none';
        resetCodeContainer.style.display = 'block';
        
        // Demo notification
        console.log(`Verification code sent to: ${email}`);
    });
    
    // Verify code
    verifyCode.addEventListener('click', () => {
        const code = document.getElementById('resetCode').value.trim();
        
        // Demo verification (code is '12345')
        if (code !== '12345') {
            resetError.textContent = 'الرمز غير صحيح';
            resetError.style.display = 'block';
            document.getElementById('resetCode').style.borderColor = 'red';
            return;
        }
        
        // Success - redirect to reset password page (or show new password form)
        resetError.style.display = 'none';
        forgotPasswordModal.style.display = 'none';
        
        // For demo, just alert success
        alert('تم التحقق بنجاح! يمكنك الآن تعيين كلمة مرور جديدة.');
        
        // In real app: redirect to reset-password.html
        // window.location.href = 'reset-password.html';
    });
});
