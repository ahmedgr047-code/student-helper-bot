from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
import PyPDF2
import os
import json

app = Flask(__name__)
CORS(app)

# Groq API Key from environment variable
client = Groq(api_key=os.getenv("GROQ_API_KEY", "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"))

# Create required folders in /tmp for Vercel compatibility
UPLOAD_FOLDER = '/tmp/uploads'
TEXT_FOLDER = '/tmp/text_files'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEXT_FOLDER, exist_ok=True)

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"
    return text

@app.route('/')
def home():
    return jsonify({
        "message": "Student Helper Bot API is running!",
        "endpoints": {
            "webhook": "/webhook-test/student-bot",
            "upload": "/upload"
        },
        "status": "online"
    })

@app.route('/upload', methods=['POST'])
def upload_pdf():
    """Endpoint to upload PDF files"""
    if 'file' not in request.files:
        return jsonify({"error": "No file selected"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file uploaded"}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "File must be PDF format"}), 400

    # Save file
    pdf_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(pdf_path)

    # Extract text and save
    text = extract_text_from_pdf(pdf_path)
    text_path = os.path.join(TEXT_FOLDER, file.filename.replace('.pdf', '.txt'))
    with open(text_path, 'w', encoding='utf-8') as f:
        f.write(text)
    
    return jsonify({
        "message": "تم رفع الملف وتحليله بنجاح",
        "filename": file.filename
    }), 200

@app.route('/webhook-test/student-bot', methods=['POST'])
def student_bot_webhook():
    """Main webhook endpoint for student bot"""
    
    # Check if file is uploaded
    if 'file' in request.files:
        file = request.files['file']
        question = request.form.get('question', '')
        
        if file and file.filename:
            # Save temporary file
            temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{file.filename}")
            file.save(temp_path)
            
            # Extract text
            context = extract_text_from_pdf(temp_path)
            os.remove(temp_path)  # Delete temp file
            
            # Send to Groq
            try:
                response = client.chat.completions.create(
                    model="llama-3.1-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": "أنت مساعد دراسي متخصص. استخدم المحتوى المرفق للإجابة على الأسئلة بدقة وباللغة نفسها التي سُئلت بها (عربي أو إنجليزي). إذا لم تجد الإجابة، قل: 'لم يتم العثور على معلومات كافية في الملف'."
                        },
                        {
                            "role": "user",
                            "content": f"السؤال: {question}\n\nمحتوى الملف:\n{context[:6000]}"
                        }
                    ],
                    temperature=0.7,
                    max_tokens=2048
                )
                return jsonify({"answer": response.choices[0].message.content})
            except Exception as e:
                return jsonify({"error": str(e)}), 500
    
    # No file - regular chat
    try:
        if request.is_json:
            data = request.get_json()
            message = data.get('message', '')
        else:
            message = request.form.get('message', '')
        
        if not message:
            return jsonify({"error": "No message provided"}), 400
        
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "أنت مساعد دراسي خبير. مهمتك مساعدة الطلاب في فهم المواد الدراسية وشرح المفاهيم بشكل واضح. رد بلغة المستخدم (عربي أو إنجليزي)."
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            temperature=0.7,
            max_tokens=2048
        )
        return jsonify({"answer": response.choices[0].message.content})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 10000))
    app.run(debug=True, host='0.0.0.0', port=port)
