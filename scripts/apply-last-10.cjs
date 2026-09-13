const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '../src/data/generated/toeic-reading-questions.json');
const bank = JSON.parse(fs.readFileSync(p, 'utf8'));

const updates = {
  'toeic_2026_t03_p7_q148': 'Dẫn chứng: "The offer is valid through August 31." | Giải thích: Đoạn văn ghi rõ ưu đãi có giá trị đến hết ngày 31 tháng 8 ("through August 31"), đồng nghĩa với việc phiếu giảm giá phải được sử dụng trước khi kết thúc tháng 8 -> Chọn đáp án đúng. | Dịch nghĩa: Ưu đãi có hiệu lực đến hết ngày 31 tháng 8, nghĩa là phải sử dụng trước khi hết tháng 8.',
  'toeic_2026_t04_p7_q156': 'Dẫn chứng: "She served in that capacity for ten years, having joined Deavora Dynamix two years after it began operations." | Giải thích: Cụm từ "in that capacity" (với cương vị đó) liên kết trực tiếp với chức danh trưởng bộ phận phát triển vật liệu tại Deavora Dynamix của cô Masondo được giới thiệu ngay trước vị trí [2] -> Chọn đáp án B. | Dịch nghĩa: Vị trí [2] là vị trí phù hợp nhất để điền câu văn này.',
  'toeic_2026_t04_p7_q157': 'Dẫn chứng: "Luis: I am leaving the house now." | Giải thích: Khi Priya hỏi Luis có làm việc tại văn phòng hôm nay không, Luis trả lời "Tôi đang rời khỏi nhà ngay bây giờ", ngụ ý anh ấy đang trên đường đến văn phòng -> Chọn đáp án C. | Dịch nghĩa: Luis đang trên đường di chuyển đến văn phòng làm việc.',
  'toeic_2026_t04_p7_q158': 'Dẫn chứng: "Priya: The notes I need for the call are on my desk." | Giải thích: Priya làm việc tại nhà nhưng các tài liệu ghi chú cần thiết cho cuộc gọi lại để quên trên bàn làm việc tại công ty, nghĩa là cô ấy đã để quên thông tin quan trọng ở văn phòng -> Chọn đáp án B. | Dịch nghĩa: Priya đã để quên tài liệu quan trọng tại văn phòng làm việc.',
  'toeic_2026_t04_p7_q159': 'Dẫn chứng: "[S3] A permit is needed for adding to or expanding the size of a building." | Giải thích: Cần giấy phép đối với việc xây thêm hoặc mở rộng quy mô của tòa nhà, tương ứng với việc mở rộng một tòa nhà văn phòng (enlarging an office building) -> Chọn đáp án đúng. | Dịch nghĩa: Giấy phép xây dựng là bắt buộc khi muốn mở rộng diện tích tòa nhà.',
  'toeic_2026_t04_p7_q160': 'Dẫn chứng: "[S8] Please contact Ronald Abioye at the City Planning Office if you need assistance completing this application." | Giải thích: Người nộp đơn cần liên hệ với ông Ronald Abioye tại Văn phòng Quy hoạch Thành phố nếu cần trợ giúp hoàn thành đơn đăng ký -> Chọn đáp án đúng. | Dịch nghĩa: Liên hệ nhân viên quy hoạch nếu cần hỗ trợ điền đơn.',
  'toeic_2026_t04_p7_q161': 'Dẫn chứng: "[S10] Work may commence once the permit is received and then posted in an easily visible location..." | Giải thích: Sau khi nhận được giấy phép, người thực hiện phải dán công khai ở nơi dễ nhìn thấy (hiển thị tài liệu/giấy phép công khai) trước khi bắt đầu thi công -> Chọn đáp án đúng. | Dịch nghĩa: Giấy phép phải được dán công khai tại công trình trước khi khởi công.',
  'toeic_2026_t04_p7_q162': 'Dẫn chứng: "Children\'s Fun Fair with carnival rides, Outdoor Concert Series and Open-Air Art Studio." | Giải thích: Lễ hội bao gồm cả khu vui chơi thiếu nhi với các trò chơi lễ hội, cùng chuỗi hòa nhạc ngoài trời và xưởng nghệ thuật dành cho người lớn, chứng tỏ lễ hội có hoạt động dành cho mọi lứa tuổi -> Chọn đáp án đúng. | Dịch nghĩa: Lễ hội tổ chức nhiều hoạt động phong phú cho mọi lứa tuổi tham gia.',
  'toeic_2026_t04_p7_q163': 'Dẫn chứng: "[S9] Wood-fired pizza and other snacks will be available for purchase." | Giải thích: Tại khu vực hòa nhạc ngoài trời, pizza nướng củi và các món ăn nhẹ khác sẽ được bán cho khách tham quan -> Chọn đáp án đúng. | Dịch nghĩa: Đồ ăn nhẹ và pizza nướng củi sẽ được bày bán tại sự kiện.',
  'toeic_2026_t08_p7_q152': 'Dẫn chứng: "Stan: Should we also invite Maria Trujillo? ... Ms. Kim: Good idea." | Giải thích: Cô Kim phản hồi "Good idea" trước đề xuất mời Maria Trujillo của Stan, thể hiện sự đồng ý tán thành với đề xuất này -> Chọn đáp án đúng. | Dịch nghĩa: Cô Kim đồng ý với đề xuất mời bà Maria Trujillo tham gia.'
};

let count = 0;
for (const [id, expl] of Object.entries(updates)) {
  const q = bank.find((item) => item.id === id);
  if (q) {
    q.explanation = expl;
    count++;
  }
}

fs.writeFileSync(p, JSON.stringify(bank, null, 2), 'utf8');
console.log('Successfully updated', count, 'questions in real file!');
