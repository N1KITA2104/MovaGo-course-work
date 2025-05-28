import { Request, Response } from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { User, IUser } from '../models/user.model';
import dotenv from 'dotenv';
import path from 'path';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEMO_EMAIL = process.env.DEMO_EMAIL || 'herobrineset21@gmail.com';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

const validateEmailEnv = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env!');
    throw new Error('Email credentials are not configured');
  }
};

validateEmailEnv();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email transporter is ready');
  }
});

interface ResetCodeData {
  code: string;
  expires: number;
  attempts: number;
  resetToken?: string;
}

const resetCodes = new Map<string, ResetCodeData>();

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    if (DEMO_MODE && email !== DEMO_EMAIL) {
      res.status(200).json({ message: 'In demo mode, only specific email allowed', demoEmail: DEMO_EMAIL });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({ message: 'If email is registered, instructions will be sent' });
      return;
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(email, { code: resetCode, expires: Date.now() + 15 * 60 * 1000, attempts: 0 });

    if (DEMO_MODE) {
      console.log('Demo mode: Skipping email');
      res.status(200).json({ message: 'Password reset code sent', demoMode: true, resetCode });
      return;
    }

    const mailOptions = {
      from: process.env.MAIL_FROM || `"MovaGo Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'MovaGo Password Reset',
      html: `
        <h2>Password Reset</h2>
        <p>Hello, ${user.username}!</p>
        <p>Your reset code: <b>${resetCode}</b></p>
        <p>Valid for 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'If email is registered, instructions sent' });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ message: 'Error processing request', error: (err as Error).message });
  }
};

export const verifyResetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ message: 'Email and code are required' });
      return;
    }

    if (DEMO_MODE && email !== DEMO_EMAIL) {
      res.status(400).json({ message: 'Demo mode: only specific email allowed', demoEmail: DEMO_EMAIL });
      return;
    }

    const data = resetCodes.get(email);
    if (!data) {
      res.status(400).json({ message: 'Invalid code or expired' });
      return;
    }

    data.attempts++;
    if (data.attempts > 5) {
      resetCodes.delete(email);
      res.status(400).json({ message: 'Too many attempts' });
      return;
    }

    if (Date.now() > data.expires) {
      resetCodes.delete(email);
      res.status(400).json({ message: 'Code expired' });
      return;
    }

    if (data.code !== code) {
      res.status(400).json({ message: 'Invalid code' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    data.resetToken = resetToken;
    resetCodes.set(email, data);

    res.status(200).json({ message: 'Code verified', resetToken });
  } catch (err) {
    console.error('Code verification error:', err);
    res.status(500).json({ message: 'Verification error', error: (err as Error).message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (DEMO_MODE && email !== DEMO_EMAIL) {
      res.status(400).json({ message: 'Demo mode: only specific email allowed', demoEmail: DEMO_EMAIL });
      return;
    }

    const data = resetCodes.get(email);
    if (!data || data.resetToken !== resetToken) {
      res.status(400).json({ message: 'Invalid reset token' });
      return;
    }

    if (Date.now() > data.expires) {
      resetCodes.delete(email);
      res.status(400).json({ message: 'Token expired' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    resetCodes.delete(email);

    res.status(200).json({ message: 'Password successfully changed' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Error resetting password', error: (err as Error).message });
  }
};
