import { Router } from 'express';
import { MailService } from '@sendgrid/mail';

const router = Router();

// Initialize SendGrid only if API key is available
let mailService: MailService | null = null;
if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

router.post('/send-email', async (req, res) => {
  try {
    const { name, email, subject, message, type } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If SendGrid is not configured, return error to trigger fallback
    if (!mailService) {
      return res.status(503).json({ error: 'Email service not configured' });
    }

    const emailContent = {
      to: 'akshatchaturvedi17@gmail.com',
      from: 'noreply@acrossfit.com', // This should be a verified sender in SendGrid
      subject: type === 'feedback' ? `Anonymous Feedback: ${subject}` : `Contact Form: ${subject}`,
      text: type === 'feedback' 
        ? `Anonymous Feedback:\n\n${message}`
        : `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: type === 'feedback'
        ? `<h3>Anonymous Feedback</h3><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`
        : `<h3>Contact Form Submission</h3>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Subject:</strong> ${subject}</p>
           <p><strong>Message:</strong></p>
           <p>${message.replace(/\n/g, '<br>')}</p>`
    };

    await mailService.send(emailContent);
    
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('SendGrid email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;