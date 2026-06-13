import connectDB from '../db';
import { User } from '../db/models/User';
import { Order } from '../db/models/Order';
import { Product } from '../db/models/Product';
import { Settings } from '../db/models/Settings';
import { ChatMessage } from '../db/models/ChatMessage';

/**
 * Normalizes Vietnamese text by removing diacritics/accents
 */
function removeVietnameseTones(str: string): string {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|tilde|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  return str.toLowerCase();
}

/**
 * Queries Gemini API to get an AI customer assistant response
 */
export async function getAIResponse(userId: string, userMessage: string, sessionId: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined. AI Chatbot is disabled.');
    return null;
  }

  try {
    await connectDB();

    // 1. Fetch Store Information & settings
    const settings = await Settings.findOne().lean();
    const storeName = settings?.storeInfo?.name || 'Fashion Store';
    const storePhone = settings?.storeInfo?.phone || 'Chưa cập nhật';
    const storeEmail = settings?.storeInfo?.email || 'Chưa cập nhật';
    const storeDesc = settings?.storeInfo?.description || 'Cửa hàng thời trang cao cấp';
    const systemPromptCustom = settings?.chatbot?.systemPrompt || '';

    // 2. Fetch User Profile
    const user = await User.findById(userId).lean();
    const customerName = user?.name || 'Khách hàng';
    const customerEmail = user?.email || 'Chưa cung cấp';

    // 3. Fetch recent Orders
    const orders = await Order.find({ customer: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    let formattedOrders = 'Khách hàng chưa có đơn hàng nào.';
    if (orders && orders.length > 0) {
      formattedOrders = orders
        .map((o) => {
          const itemsStr = o.items
            .map((i: any) => `${i.productName} (Màu: ${i.color}, Size: ${i.size}, SL: ${i.quantity})`)
            .join(', ');
          const dateStr = (o as any).createdAt ? new Date((o as any).createdAt).toLocaleDateString('vi-VN') : 'Không rõ';
          return `- Đơn hàng ${o.orderCode}: Trạng thái ${o.status}, Ngày đặt ${dateStr}, Tổng tiền ${o.total.toLocaleString('vi-VN')}đ. Chi tiết: ${itemsStr}`;
        })
        .join('\n');
    }

    // 4. Find relevant products by keyword
    const stopwords = ['co', 'khong', 'bao', 'nhieu', 'chua', 'cho', 'hoi', 'cua', 'hang', 'ban', 'toi', 'minh', 'em', 'shop', 'loai', 'mau', 'size', 'cai', 'chiec'];
    const cleanText = removeVietnameseTones(userMessage);
    const words = cleanText.split(/\s+/).filter(w => w.length > 1 && !stopwords.includes(w));

    let products: any[] = [];
    if (words.length > 0) {
      const regexQueries = words.map(w => ({ name: { $regex: w, $options: 'i' } }));
      products = await Product.find({
        isPublished: true,
        $or: regexQueries
      })
        .limit(5)
        .select('name price salePrice slug')
        .lean();
    }

    // If no products matched, show featured products
    if (products.length === 0) {
      products = await Product.find({ isPublished: true, isFeatured: true })
        .limit(5)
        .select('name price salePrice slug')
        .lean();
    }

    const formattedProducts = products
      .map((p) => {
        const priceStr = p.salePrice 
          ? `${p.salePrice.toLocaleString('vi-VN')}đ (Giảm từ ${p.price.toLocaleString('vi-VN')}đ)` 
          : `${p.price.toLocaleString('vi-VN')}đ`;
        return `- ${p.name}: Giá ${priceStr}. Đường dẫn xem: /products/${p.slug}`;
      })
      .join('\n');

    // 5. Build system instructions
    const systemInstructionText = `Bạn là trợ lý AI (AI Chatbot) hỗ trợ khách hàng của cửa hàng thời trang "${storeName}".

Thông tin liên hệ cửa hàng:
- Điện thoại: ${storePhone}
- Email: ${storeEmail}
- Mô tả: ${storeDesc}

Hồ sơ khách hàng hiện tại:
- Tên khách hàng: ${customerName}
- Email: ${customerEmail}

Lịch sử 3 đơn hàng gần đây nhất của khách hàng này:
${formattedOrders}

Danh sách sản phẩm nổi bật hoặc phù hợp với tìm kiếm của khách hàng:
${formattedProducts}

Chỉ dẫn riêng từ quản trị viên cửa hàng:
${systemPromptCustom}

Nhiệm vụ của bạn:
1. Trả lời câu hỏi một cách lịch sự, thân thiện, xưng hô là "Cửa hàng" hoặc "Mình" và gọi khách hàng là "bạn" hoặc xưng theo tên "${customerName}".
2. Trả lời ngắn gọn, trực diện, không dài dòng lê thê (dưới 120 từ).
3. Nếu khách hàng hỏi về đơn hàng của họ, hãy dùng danh sách đơn hàng được cung cấp ở trên để trả lời chi tiết (mã đơn hàng, trạng thái, tổng tiền...).
4. Nếu khách hàng tìm quần áo, giày dép hoặc sản phẩm, hãy gợi ý các sản phẩm phù hợp ở trên kèm giá bán và đường dẫn của chúng.
5. Nếu câu hỏi vượt quá thông tin bạn có (ví dụ: yêu cầu hoàn tiền, phản ánh thái độ phục vụ, đổi trả hàng phức tạp), hãy lịch sự thông báo rằng: "Cửa hàng đã ghi nhận yêu cầu và sẽ có nhân viên hỗ trợ trực tiếp (Human Agent) nhắn tin lại cho bạn ngay."
6. Chỉ trả lời bằng Tiếng Việt.`;

    // 6. Fetch conversation history from DB
    const chatHistory = await ChatMessage.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    // Reconstruct history chronologically
    const history = chatHistory.reverse();

    // Map history to Gemini content structure
    const contents = history.map((msg) => {
      let text = msg.content;
      if (msg.type === 'order_link') {
        text = `[Liên kết đơn hàng: Mã ${msg.metadata?.orderCode}, Trạng thái: ${msg.metadata?.orderStatus}, Tổng: ${msg.metadata?.orderTotal?.toLocaleString('vi-VN')}đ]`;
      }
      return {
        role: msg.senderRole === 'customer' ? 'user' : 'model',
        parts: [{ text }]
      };
    });

    // If contents array is empty (which shouldn't happen as we already saved userMessage), add the current message
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
    }

    // 7. Make API request to Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstructionText }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API returned error status ${response.status}: ${errorText}`);
      return null;
    }

    const resJson = await response.json();
    const reply = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return reply ? reply.trim() : null;
  } catch (error) {
    console.error('Error invoking Gemini chatbot helper:', error);
    return null;
  }
}
