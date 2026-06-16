const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());

// Public folder ko static files serve karne ke liye set kiya
app.use(express.static(path.join(__dirname, 'public')));

// Default Route: Sabse pehle login page khulega
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dashboard Route: Login hone ke baad launcher khulega
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'launcher.html'));
});

// Bulk Email Sending API
app.post('/api/send-bulk', async (req, res) => {
    const { fromName, senderEmail, appPassword, to, subject, message } = req.body;

    if (!senderEmail || !appPassword || !to || !to.length || !subject || !message) {
        return res.status(400).json({ success: false, error: 'Sabhi fields bharna zaroori hai!' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderEmail,
            pass: appPassword
        }
    });

    const displayName = fromName ? `${fromName} <${senderEmail}>` : senderEmail;

    try {
        await transporter.sendMail({
            from: displayName,
            to: senderEmail, 
            bcc: to,        
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
    console.log(`Server running perfectly on port ${PORT}`);
});
