const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// UI Route - Yeh aapko image_3fa7f6.jpg jaisa interface dikhayega
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mail Sender</title>
        <style>
            body {
                background-color: #0b0f19;
                color: #e2e8f0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .container {
                background-color: #111827;
                border: 1px solid #1f2937;
                border-radius: 12px;
                padding: 30px;
                width: 100%;
                max-width: 650px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #1f2937;
                padding-bottom: 15px;
                margin-bottom: 25px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                color: #ffffff;
            }
            .status {
                background-color: #065f46;
                color: #34d399;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
            }
            .section-title {
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #9ca3af;
                margin-top: 20px;
                margin-bottom: 15px;
                font-weight: 700;
            }
            .row {
                display: flex;
                gap: 15px;
                margin-bottom: 15px;
            }
            .form-group {
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            label {
                font-size: 14px;
                margin-bottom: 6px;
                color: #d1d5db;
            }
            input, textarea {
                background-color: #1f2937;
                border: 1px solid #374151;
                color: #ffffff;
                padding: 12px;
                border-radius: 6px;
                font-size: 14px;
                outline: none;
                transition: border 0.2s;
            }
            input:focus, textarea:focus {
                border-color: #3b82f6;
            }
            .hint {
                font-size: 12px;
                color: #6b7280;
                margin-top: 5px;
            }
            button {
                background-color: #2563eb;
                color: white;
                border: none;
                padding: 14px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                margin-top: 25px;
                transition: background 0.2s;
            }
            button:hover {
                background-color: #1d4ed8;
            }
            #responseMessage {
                margin-top: 15px;
                padding: 12px;
                border-radius: 6px;
                font-size: 14px;
                display: none;
            }
        </style>
    </head>
    <body>

    <div class="container">
        <div class="header">
            <div class="title">📩 MailSender</div>
            <div class="status">● Server Online ✓</div>
        </div>

        <form id="mailForm">
            <div class="section-title">👤 AAPKI DETAILS</div>
            <div class="row">
                <div class="form-group">
                    <label>Aapka Naam (optional)</label>
                    <input type="text" id="fromName" placeholder="Rahul Sharma">
                </div>
                <div class="form-group">
                    <label>Aapka Email</label>
                    <input type="email" id="senderEmail" placeholder="aap@gmail.com" required>
                </div>
            </div>

            <div class="form-group">
                <label>App Password / SMTP Password</label>
                <input type="password" id="appPassword" placeholder="Gmail App Password yahan daalo" required>
                <div class="hint">Gmail ke liye: Settings → 2FA → App Passwords se banao</div>
            </div>

            <div class="section-title">📁 BULK EMAIL DETAILS</div>
            <div class="form-group">
                <label>Recipients (ek line mein ek email, ya comma se alag karo)</label>
                <textarea id="recipients" rows="4" placeholder="email1@gmail.com&#10;email2@yahoo.com" required></textarea>
            </div>

            <div class="form-group" style="margin-top: 15px;">
                <label>Subject</label>
                <input type="text" id="subject" placeholder="Email ka topic" required>
            </div>

            <div class="form-group" style="margin-top: 15px;">
                <label>Message</label>
                <textarea id="message" rows="5" placeholder="Apna message yahan likhein..." required></textarea>
            </div>

            <button type="submit" id="submitBtn">Bulk Email Bhejo 🚀</button>
        </form>

        <div id="responseMessage"></div>
    </div>

    <script>
        document.getElementById('mailForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const resDiv = document.getElementById('responseMessage');
            
            btn.innerText = "Sending Emails... ⏳";
            btn.disabled = true;
            resDiv.style.display = "none";

            // Process recipients text into an array
            const recipientsText = document.getElementById('recipients').value;
            const toArray = recipientsText.split(/[\\n,]+/).map(e => e.trim()).filter(e => e.length > 0);

            const formData = {
                fromName: document.getElementById('fromName').value,
                senderEmail: document.getElementById('senderEmail').value,
                appPassword: document.getElementById('appPassword').value,
                to: toArray,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('/api/send-bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();

                if(result.success) {
                    resDiv.style.backgroundColor = "#065f46";
                    resDiv.style.color = "#34d399";
                    resDiv.innerText = "Success: " + result.message;
                } else {
                    resDiv.style.backgroundColor = "#7f1d1d";
                    resDiv.style.color = "#f87171";
                    resDiv.innerText = "Error: " + result.error;
                }
                resDiv.style.display = "block";
            } catch (err) {
                resDiv.style.backgroundColor = "#7f1d1d";
                resDiv.style.color = "#f87171";
                resDiv.innerText = "Error: Connection failed!";
                resDiv.style.display = "block";
            } finally {
                btn.innerText = "Bulk Email Bhejo 🚀";
                btn.disabled = false;
            }
        });
    </script>
    </body>
    </html>
    `);
});

// Backend API Endpoint for processing bulk emails
app.post('/api/send-bulk', async (req, res) => {
    const { fromName, senderEmail, appPassword, to, subject, message } = req.body;

    if (!senderEmail || !appPassword || !to || !to.length || !subject || !message) {
        return res.status(400).json({ success: false, error: 'Sabhi fields bharna zaroori hai!' });
    }

    // SMTP Transporter Setup using user's inputs dynamically
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderEmail,
            pass: appPassword
        }
    });

    const displayName = fromName ? `${fromName} <${senderEmail}>` : senderEmail;

    try {
        // Bulk delivery using BCC or join for multiple recipients safely
        await transporter.sendMail({
            from: displayName,
            to: senderEmail, // Sent to yourself
            bcc: to,        // All recipients added here so they don't see each other's email
            subject: subject,
            text: message
        });

        res.status(200).json({ success: true, message: `${to.length} Emails successfully bhej diye gaye hain!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 8080; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`UI Server running perfectly on port ${PORT}`);
});
