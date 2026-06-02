import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/server/db';
import { User } from '@/server/db/models/User';
import { sendEmail, passwordResetTemplate } from '@/lib/email';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (isRateLimited(ip, 5, 60 * 1000)) {
      return NextResponse.json(
        { message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: 'Vui lòng cung cấp email' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    // Secure design: Do not disclose whether email exists or not to prevent enumeration
    if (!user) {
      return NextResponse.json({
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu.',
      });
    }

    // 1. Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // 2. Hash token and set expiry (1 hour)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();

    // 3. Construct reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // 4. Send email
    await sendEmail(
      user.email,
      'Yêu cầu đặt lại mật khẩu | Fashion Store',
      passwordResetTemplate({
        customerName: user.name,
        resetUrl,
      })
    );

    return NextResponse.json({
      message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu.',
    });
  } catch (error: any) {
    console.error('[Forgot Password API Error]', error);
    return NextResponse.json({ message: 'Lỗi hệ thống khi xử lý yêu cầu' }, { status: 500 });
  }
}
