import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/server/db';
import { User } from '@/server/db/models/User';
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

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Yêu cầu cung cấp đầy đủ mã và mật khẩu mới' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Hash the incoming token to match the database stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Query for user with matching token and unexpired window
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ' },
        { status: 400 }
      );
    }

    // 3. Update the password
    user.password = password; // pre-save hook in User model will automatically hash this
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({
      message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.',
    });
  } catch (error: any) {
    console.error('[Reset Password API Error]', error);
    return NextResponse.json(
      { message: 'Lỗi hệ thống khi đặt lại mật khẩu' },
      { status: 500 }
    );
  }
}
