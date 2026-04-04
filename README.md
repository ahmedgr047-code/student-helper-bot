# 🤖 Student Helper - AI Study Assistant

مساعد دراسي ذكي مدعوم بـ Groq AI و Flask Backend

## ✨ المميزات

- 📁 **رفع ملفات PDF** - ارفع ملفاتك واسأل عن محتواها
- 🤖 **ذكاء اصطناعي متقدم** - يستخدم Groq (Llama 3.1 70B)
- 🌐 **دعم العربية والإنجليزية** - يرد بلغة سؤالك
- ⚡ **ردود فورية** - عبر Webhook API

## 🚀 التشغيل السريع

### Frontend (HTML/CSS/JS)
1. افتح `index.html` في المتصفح
2. ابدأ المحادثة مباشرة!

### Backend (Flask)
```bash
# تثبيت المتطلبات
pip install -r requirements.txt

# تشغيل الخادم
python app.py
```

## 🔧 الإعدادات

### متغيرات البيئة (Environment Variables)
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=10000
```

### Webhook URL
```
https://aahmed.app.n8n.cloud/webhook-test/student-bot
```

## 📁 هيكل المشروع

```
.
├── index.html          # واجهة المستخدم
├── script.js           # منطق Frontend
├── app.py              # Backend Flask
├── requirements.txt    # المتطلبات
└── README.md          # هذا الملف
```

## 🌐 النشر على Render

1. أنشئ **Web Service** جديد
2. اربط مستودع GitHub
3. أضف متغير البيئة `GROQ_API_KEY`
4. **Build Command:**
   ```bash
   pip install -r requirements.txt
   ```
5. **Start Command:**
   ```bash
   gunicorn app:app
   ```

## 💡 كيفية الاستخدام

1. اضغط **Upload PDF** لرفع ملف
2. اكتب سؤالك في مربع النص
3. اضغط Enter أو زر الإرسال
4. احصل على الإجابة من AI! 🤖

## 🛠️ التقنيات المستخدمة

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Flask, Python
- **AI:** Groq API (Llama 3.1 70B)
- **PDF:** PyPDF2

## 🤝 المساهمة

نرحب بمساهماتكم! افتحوا Issue أو Pull Request.

## 📜 الترخيص

MIT License - استخدمه بحرية! 🎉

---

**Made with ❤️ for students everywhere**
