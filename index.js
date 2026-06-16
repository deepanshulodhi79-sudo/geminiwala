const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Main route to check if server is working
app.get('/', (req, res) => {
    res.send('Gmail Sender Service is Live!');
});

// Real Email Sending Endpoint
app.post('/send-email', async (req, res) => {
    const { to, subject, text, html } = req.body;

    // Validation
    if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ error: 'Missing fields: to, subject, or message' });
    }

    // Gmail SMTP Configuration using Environment Variables
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Aapka Gmail ID
            pass: process.env.GMAIL_APP_PASS, // Aapka 16-digit App Password
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: to,
            subject: subject,
            text: text,
            html: html,
        });

        res.status(200).json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Northflank automatically provides PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
