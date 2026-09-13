const fs = require('fs');

const { getGeminiApiKey } = require('./get-api-key.cjs');
const key = getGeminiApiKey();

async function test() {
  const prompt = `Bạn là chuyên gia luyện thi TOEIC hàng đầu. Hãy viết giải thích chi tiết cho câu hỏi TOEIC sau theo đúng định dạng:
Dẫn chứng: "[Trích dẫn chính xác câu văn tiếng Anh trong bài làm bằng chứng trực tiếp]" | Giải thích: [Giải thích logic chi tiết bằng tiếng Việt 100%, tuyệt đối KHÔNG có bất kỳ chữ tiếng Trung nào] | Dịch nghĩa: [Dịch câu hỏi và đáp án đúng sang tiếng Việt]

Câu hỏi:
- Đoạn văn: [S1] If you love the delicious cheese and crackers served at Truli Cafes, you can now enjoy this popular snack at home! [S2] Truli crackers and cheese are now available at major supermarkets. [S3] Save $2.00 on the purchase of ONE box of Truli crackers (any size) when you buy any TWO packages of Truli cheese. [S4] Limit one coupon per customer. [S5] This coupon may not be combined with other special offers. [S6] Expires July 31.
- Câu hỏi: What is indicated about the coupon?
- Các đáp án:
A. It can be used more than once.
B. It requires the purchase of another product.
C. It can be used for buying hot drinks.
D. It must be used before July 1.
- Đáp án đúng: B (It requires the purchase of another product.)

Yêu cầu: Trả về kết quả duy nhất trên 1 dòng theo định dạng "Dẫn chứng: ... | Giải thích: ... | Dịch nghĩa: ...". Tuyệt đối không sinh chữ tiếng Trung hay JSON.`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await res.json();
  console.log('Result:', data.candidates?.[0]?.content?.parts?.[0]?.text);
}

test();
