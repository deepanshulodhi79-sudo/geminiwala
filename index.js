const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());

// Public folder ko static files serve karne ke liye set kiya
app.use(express.static(path.join(__dirname, 'public')));

// Default Route: Login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dashboard Route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'launcher.html'));
});

// Helper function to create delay between emails (Anti-Spam Feature)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Bulk Email Sending API (Optimized for Inbox Delivery)
app.post('/api/send-bulk', async (req, res) => {
    const { fromName, senderEmail, appPassword, to, subject, message } = req.body;

    if (!senderEmail || !appPassword || !to || !to.length || !subject || !message) {
        return res.status(400).json({ success: false, error: 'Sabhi fields bharna zaroori hai!' });
    }

    // SMTP Transporter Setup
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderEmail,
            pass: appPassword
        }
    });

    const displayName = fromName ? `${fromName} <${senderEmail}>` : senderEmail;
    
    let successCount = 0;
    let failureCount = 0;

    // Sabko ek saath bhejne ke bajaye, loop chala kar ek-ek karke bhejenge
    for (let i = 0; i < to.length; i++) {
        const currentEmail = to[i];
        
        try {
            await transporter.sendMail({
                from: displayName,
                to: currentEmail, // Alag se single recipient ko mail jayega
                subject: subject,
                text: message
            });
            successCount++;
            console.log(`Email sent successfully to: ${currentEmail}`);
        } catch (error) {
            console.error(`Failed to send to ${currentEmail}:`, error.message);
            failureCount++;
        }

        // Har mail ke beech mein 1.5 seconds ka gap (delay) rakhein taaki Gmail block na kare
        if (i < to.length - 1) {
            await delay(1500); 
        }
    }

    if (successCount > 0) {
        res.status(200).json({ 
            success: true, 
            message: `${successCount} Mails successfully bhej diye gaye hain! (Failed: ${failureCount})` 
        });
    } else {
        res.status(500).json({ 
            success: false, 
            error: 'Ek bhi email nahi bheja ja saka. Gmail App Password check karein.' 
        });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running perfectly on port ${PORT}`);
});
