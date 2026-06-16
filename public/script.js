document.getElementById('mailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const resDiv = document.getElementById('responseMessage');
    
    btn.innerText = "Sending Emails... ⏳";
    btn.disabled = true;
    resDiv.style.display = "none";

    const recipientsText = document.getElementById('recipients').value;
    const toArray = recipientsText.split(/[\n,]+/).map(e => e.trim()).filter(e => e.length > 0);

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
