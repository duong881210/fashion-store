import { VNPay, VnpLocale } from 'vnpay';

const tmnCode = process.env.VNPAY_TMN_CODE || '';
const secureSecret = process.env.VNPAY_HASH_SECRET || '';

// VNPay host is initialized based on the configured VNPAY_URL or defaults to sandbox.
// Note: vnpay package expects just the origin/domain of the host.
const vnpayUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnpayHost = new URL(vnpayUrl).origin;

export const vnpayClient = new VNPay({
  tmnCode,
  secureSecret,
  vnpayHost,
});

export interface CreatePaymentParams {
  orderId: string;       // maps to vnp_TxnRef (use order.orderCode)
  amount: number;        // in VND (raw amount, the library will multiply by 100 internally)
  orderInfo: string;     // payment description
  ipAddr: string;        // customer's IP address
  locale?: 'vn' | 'en';
  returnUrl: string;
}

/**
 * Generates the redirect URL for VNPAY payment
 */
export function createPaymentUrl(params: CreatePaymentParams): string {
  // Use date-fns formatting or let the library handle vnp_CreateDate and vnp_ExpireDate.
  // The 'vnpay' library automatically sets vnp_CreateDate and vnp_ExpireDate if not provided.
  return vnpayClient.buildPaymentUrl({
    vnp_Amount: params.amount,
    vnp_IpAddr: params.ipAddr,
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: params.orderInfo,
    vnp_ReturnUrl: params.returnUrl,
    vnp_Locale: params.locale === 'en' ? VnpLocale.EN : VnpLocale.VN,
  });
}

/**
 * Verifies the signature of the incoming query parameters from VNPAY callback (return or IPN)
 */
export function verifySignature(query: Record<string, string>): boolean {
  try {
    const verification = vnpayClient.verifyReturnUrl(query as any);
    // The library returns an object containing isVerified (boolean)
    return verification.isVerified;
  } catch (error) {
    console.error('[VNPay Signature Verification Error]', error);
    return false;
  }
}

/**
 * Map VNPAY response codes to Vietnamese message descriptions
 */
export function getTransactionMessage(responseCode: string): string {
  const codeMap: Record<string, string> = {
    '00': 'Thành công',
    '07': 'Giao dịch bị nghi ngờ lừa đảo',
    '09': 'Giao dịch không thành công do thẻ/tài khoản của khách hàng chưa đăng ký dịch vụ Internet Banking tại ngân hàng.',
    '10': 'Giao dịch không thành công do khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
    '11': 'Giao dịch không thành công do đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do thẻ/tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại.',
    '24': 'Giao dịch bị hủy bởi khách hàng.',
    '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do nhập sai mật khẩu thanh toán quá số lần quy định.',
    '99': 'Lỗi không xác định.'
  };

  return codeMap[responseCode] || `Lỗi không xác định (Mã: ${responseCode})`;
}
