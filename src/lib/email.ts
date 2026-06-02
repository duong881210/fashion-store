import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummykey');

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

/**
 * Sends an email using Resend.
 * Wraps execution in a try-catch to ensure email delivery failures do not crash order processing flows.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  // Check if Resend API key is provided
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email Warning] RESEND_API_KEY is not defined. Email dispatch was skipped.');
    console.log(`[Mock Email Send] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Cửa hàng Fashion <noreply@resend.dev>', // Resend sandbox default sender
      to,
      subject,
      html,
    });
    console.log(`[Email Success] Sent to: ${to} | Subject: ${subject}`);
  } catch (error) {
    console.error('[Email Error in sendEmail]', error);
  }
}

/**
 * HTML Email template for order confirmation
 */
export function orderConfirmedTemplate(data: {
  customerName: string;
  orderCode: string;
  orderId: string;
  items: Array<{
    productName: string;
    productImage: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    ward: string;
    district: string;
    province: string;
  };
  paymentMethod: string;
}): string {
  const itemsTableRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; vertical-align: middle;">
        <img src="${item.productImage || 'https://via.placeholder.com/60x80'}" alt="${item.productName}" width="50" style="border-radius: 4px; display: block; object-fit: cover;" />
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
        <p style="margin: 0; font-weight: 600; color: #333333;">${item.productName}</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #666666;">Màu: ${item.color} | Size: ${item.size}</p>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: center; color: #555555;">x${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: 600; color: #333333;">${formatCurrency(item.price)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #334155;">
      <!-- Logo Header -->
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f1f5f9;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a;">FASHION STORE</h1>
      </div>
      
      <!-- Greeting -->
      <div style="padding: 30px 10px 10px 10px;">
        <h2 style="margin-top: 0; font-size: 20px; color: #0f172a;">Xác nhận đơn hàng thành công!</h2>
        <p style="line-height: 1.6; color: #475569;">Chào <strong>${data.customerName}</strong>,</p>
        <p style="line-height: 1.6; color: #475569;">Cảm ơn bạn đã mua sắm tại Fashion Store. Đơn hàng của bạn đã được ghi nhận thành công và đang chờ xác nhận.</p>
        <p style="line-height: 1.6; color: #475569;">Mã đơn hàng của bạn là: <strong style="font-family: monospace; font-size: 15px; color: #0f172a;">${data.orderCode}</strong></p>
      </div>

      <!-- Items Section -->
      <div style="margin-top: 24px;">
        <h3 style="font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; color: #0f172a; margin-bottom: 12px;">Chi tiết sản phẩm</h3>
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8fafc; color: #64748b;">
              <th style="padding: 8px 12px; font-weight: 600;">Ảnh</th>
              <th style="padding: 8px 12px; font-weight: 600;">Sản phẩm</th>
              <th style="padding: 8px 12px; font-weight: 600; text-align: center;">SL</th>
              <th style="padding: 8px 12px; font-weight: 600; text-align: right;">Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRows}
          </tbody>
        </table>
      </div>

      <!-- Financial Summary & Delivery Info Grid -->
      <table style="width: 100%; margin-top: 24px; border-collapse: collapse;">
        <tr>
          <!-- Shipping Address -->
          <td style="width: 50%; padding-right: 15px; vertical-align: top; font-size: 13px;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;">Thông tin giao hàng</h4>
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">${data.shippingAddress.fullName}</p>
            <p style="margin: 0 0 8px 0; color: #64748b;">SĐT: ${data.shippingAddress.phone}</p>
            <p style="margin: 0; color: #64748b; line-height: 1.4;">
              ${data.shippingAddress.street},<br/>
              ${data.shippingAddress.ward}, ${data.shippingAddress.district},<br/>
              ${data.shippingAddress.province}
            </p>
          </td>
          <!-- Price details -->
          <td style="width: 50%; padding-left: 15px; vertical-align: top; font-size: 13px;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;">Tổng kết chi phí</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Tạm tính:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 500;">${formatCurrency(data.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Phí vận chuyển:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 500;">${formatCurrency(data.shippingFee)}</td>
              </tr>
              ${
                data.discount > 0
                  ? `
              <tr>
                <td style="padding: 4px 0; color: #10b981;">Giảm giá:</td>
                <td style="padding: 4px 0; text-align: right; color: #10b981; font-weight: 500;">-${formatCurrency(data.discount)}</td>
              </tr>
              `
                  : ''
              }
              <tr style="border-top: 1px solid #e2e8f0;">
                <td style="padding: 8px 0 4px 0; font-weight: 700; color: #0f172a; font-size: 14px;">Tổng cộng:</td>
                <td style="padding: 8px 0 4px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 16px;">${formatCurrency(data.total)}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b; font-size: 11px;">Thanh toán:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 500; font-size: 11px; text-transform: uppercase;">${data.paymentMethod}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Tracking CTA -->
      <div style="text-align: center; margin-top: 35px; padding-top: 25px; border-top: 2px solid #f1f5f9;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" target="_blank" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 600; border-radius: 8px; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Theo dõi đơn hàng</a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        <p style="margin: 0;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ bộ phận hỗ trợ khách hàng của chúng tôi.</p>
        <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Fashion Store. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * HTML Email template for order shipping or delivery status updates
 */
export function orderStatusTemplate(data: {
  customerName: string;
  orderCode: string;
  orderId: string;
  status: 'shipping' | 'delivered' | string;
  message: string;
}): string {
  const isDelivered = data.status === 'delivered';
  const headerColor = isDelivered ? '#22C55E' : '#3B82F6';
  const ctaLabel = isDelivered ? 'Đánh giá sản phẩm' : 'Theo dõi đơn hàng';
  const ctaUrl = isDelivered 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/orders` 
    : `${process.env.NEXT_PUBLIC_APP_URL}/orders`;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #334155;">
      <!-- Status Header -->
      <div style="text-align: center; padding: 20px; border-radius: 12px; background-color: ${headerColor}; color: #ffffff; margin-bottom: 25px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Cập nhật đơn hàng #${data.orderCode}</h2>
      </div>

      <!-- Main Message -->
      <div style="padding: 10px;">
        <p style="line-height: 1.6; color: #475569;">Xin chào <strong>${data.customerName}</strong>,</p>
        <p style="line-height: 1.6; font-size: 16px; color: #0f172a; background-color: #f8fafc; border-left: 4px solid ${headerColor}; padding: 12px 16px; border-radius: 4px;">
          <strong>${data.message}</strong>
        </p>
        <p style="line-height: 1.6; color: #475569;">Đơn hàng của bạn hiện đang ở trạng thái: <strong style="text-transform: uppercase; color: ${headerColor};">${isDelivered ? 'Đã giao hàng thành công' : 'Đang được giao'}</strong></p>
      </div>

      <!-- Action CTA -->
      <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
        <a href="${ctaUrl}" target="_blank" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 600; border-radius: 8px; font-size: 14px; display: inline-block;">${ctaLabel}</a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0;">Cảm ơn bạn đã đồng hành cùng Fashion Store.</p>
        <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Fashion Store. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * HTML Email template for password reset
 */
export function passwordResetTemplate(data: {
  customerName: string;
  resetUrl: string;
}): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #334155;">
      <!-- Logo Header -->
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f1f5f9;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a;">FASHION STORE</h1>
      </div>

      <!-- Main Body -->
      <div style="padding: 25px 10px 10px 10px;">
        <h2 style="margin-top: 0; font-size: 20px; color: #0f172a;">Yêu cầu đặt lại mật khẩu</h2>
        <p style="line-height: 1.6; color: #475569;">Xin chào <strong>${data.customerName}</strong>,</p>
        <p style="line-height: 1.6; color: #475569;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Fashion Store của bạn. Vui lòng bấm vào nút bên dưới để đặt lại mật khẩu:</p>
        
        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" target="_blank" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 600; border-radius: 8px; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Đặt lại mật khẩu</a>
        </div>

        <p style="line-height: 1.6; color: #ef4444; font-size: 13px;"><strong>Lưu ý:</strong> Liên kết đặt lại mật khẩu này sẽ hết hạn trong vòng <strong>1 giờ</strong> vì lý do bảo mật.</p>
        <p style="line-height: 1.6; color: #64748b; font-size: 13px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ giữ nguyên không thay đổi.</p>
      </div>

      <!-- Footer Link Fallback -->
      <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; word-break: break-all;">
        <p style="margin: 0 0 5px 0;">Nếu nút ở trên không hoạt động, vui lòng sao chép và dán liên kết sau vào trình duyệt của bạn:</p>
        <a href="${data.resetUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">${data.resetUrl}</a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Fashion Store. All rights reserved.</p>
      </div>
    </div>
  `;
}
