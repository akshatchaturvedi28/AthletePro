import { Router } from 'express';
import sgMail from '@sendgrid/mail';

const router = Router();

// In production, you would get this from environment variables
// sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Temporary store for verification codes (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expires: number; type: 'email' | 'phone' }>();

// Generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification code via email
router.post('/send-email-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const code = generateVerificationCode();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store the code
    verificationCodes.set(email, { code, expires, type: 'email' });
    
    // In a real app, you would send via SendGrid
    // const msg = {
    //   to: email,
    //   from: 'noreply@acrossfit.com',
    //   subject: 'ACrossFit - Verification Code',
    //   text: `Your verification code is: ${code}`,
    //   html: `<strong>Your verification code is: ${code}</strong>`,
    // };
    // await sgMail.send(msg);
    
    // For demo purposes, log the code
    console.log(`📧 Email verification code for ${email}: ${code}`);
    
    res.json({ success: true, message: 'Verification code sent to email' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Send verification code via SMS
router.post('/send-sms-code', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const code = generateVerificationCode();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store the code
    verificationCodes.set(phone, { code, expires, type: 'phone' });
    
    // In a real app, you would use Twilio or similar SMS service
    // For demo purposes, log the code
    console.log(`📱 SMS verification code for ${phone}: ${code}`);
    
    res.json({ success: true, message: 'Verification code sent to phone' });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify code
router.post('/verify-code', async (req, res) => {
  try {
    const { identifier, code, type } = req.body; // identifier is email or phone
    
    if (!identifier || !code || !type) {
      return res.status(400).json({ error: 'Identifier, code, and type are required' });
    }

    const storedData = verificationCodes.get(identifier);
    
    if (!storedData) {
      return res.status(400).json({ error: 'No verification code found' });
    }
    
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(identifier);
      return res.status(400).json({ error: 'Verification code has expired' });
    }
    
    if (storedData.code !== code || storedData.type !== type) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Clean up the used code
    verificationCodes.delete(identifier);
    
    res.json({ success: true, message: 'Verification successful' });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

export { router as verificationRouter };