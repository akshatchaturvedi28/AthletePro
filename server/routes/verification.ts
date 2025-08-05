import { Router } from 'express';
import sgMail from '@sendgrid/mail';

const router = Router();

// Configure SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid configured for email verification');
} else {
  console.log('⚠️  SendGrid API key not found - using demo mode for verification codes');
}

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
    
    // Try to send via SendGrid if configured
    if (SENDGRID_API_KEY) {
      try {
        const msg = {
          to: email,
          from: 'noreply@acrossfit.com', // In production, use a verified sender
          subject: 'ACrossFit - Verification Code',
          text: `Your verification code is: ${code}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #FF6B35;">ACrossFit Verification</h2>
              <p>Your verification code is:</p>
              <div style="font-size: 24px; font-weight: bold; background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                ${code}
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
            </div>
          `,
        };
        await sgMail.send(msg);
        console.log(`✅ Email verification code sent to ${email}`);
      } catch (error) {
        console.error('❌ SendGrid error:', error);
        // Fall back to demo mode
        console.log(`📧 [DEMO] Email verification code for ${email}: ${code}`);
      }
    } else {
      // Demo mode - log the code
      console.log(`📧 [DEMO] Email verification code for ${email}: ${code}`);
    }
    
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
    
    // For SMS, we'll use demo mode (in production, integrate Twilio)
    // This simulates sending an SMS verification code
    console.log(`📱 [DEMO] SMS verification code for ${phone}: ${code}`);
    
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