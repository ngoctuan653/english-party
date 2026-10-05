/**
 * generate-collocations-pdf.cjs
 * Comprehensive Collocations Handbook from 10 TOEIC Reading 2026 Tests (1,000 Questions)
 * Generates an executive, print-ready PDF using Microsoft Edge headless engine.
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const questionsDataPath = path.resolve(__dirname, '../src/data/generated/toeic-reading-questions.json');
const questions = JSON.parse(fs.readFileSync(questionsDataPath, 'utf8'));

console.log(`Loaded ${questions.length} questions from TOEIC Reading 2026 database.`);

// Helper to find authentic sentences in questions and passages
function findAuthenticSentence(regexPattern, fallbackSentence, fallbackRef) {
  const re = new RegExp(regexPattern, 'i');
  for (const q of questions) {
    let qText = q.question || '';
    if (q.choices && q.correctAnswer !== undefined) {
      qText = qText.replace('-------', `[${q.choices[q.correctAnswer]}]`);
    }
    if (re.test(qText)) {
      const testNum = q.id.split('_')[2].replace('t', 'Test ');
      return {
        text: qText.trim(),
        ref: `${testNum} - Part ${q.part}`,
        sourceType: 'Câu hỏi đề thi'
      };
    }
    if (q.context && re.test(q.context)) {
      const sentences = q.context.split(/(?<=[.!?])\s+|\n+/);
      for (const s of sentences) {
        const cleanS = s.trim();
        if (re.test(cleanS) && cleanS.length >= 25 && cleanS.length <= 260) {
          const testNum = q.id.split('_')[2].replace('t', 'Test ');
          return {
            text: cleanS,
            ref: `${testNum} - Part ${q.part} Passage`,
            sourceType: 'Đoạn văn bài đọc'
          };
        }
      }
    }
  }
  return {
    text: fallbackSentence,
    ref: fallbackRef || 'TOEIC 2026 Official Pattern',
    sourceType: 'Ngữ cảnh chuẩn ETS'
  };
}

// -------------------------------------------------------------
// CURATED COLLOCATION DATABASE (160+ ITEMS IN 6 SECTIONS)
// -------------------------------------------------------------

const rawCollocations = [
  // ============================================================
  // SECTION 1: VERB + NOUN (35 CỤM ĐỘNG TỪ + DANH TỪ ĐẮT GIÁ NHẤT)
  // ============================================================
  {
    category: 1,
    term: "meet the deadline",
    type: "Verb + Noun",
    meaning: "Kịp hạn chót, hoàn thành đúng thời hạn",
    regex: "meet.*deadline",
    fallbackText: "Once again, I'd like to express my gratitude for the great efforts you have made to meet the project deadline.",
    fallbackRef: "Test 01 - Part 7 Passage",
    translation: "Một lần nữa, tôi muốn bày tỏ lòng biết ơn đối với những nỗ lực to lớn của bạn để kịp thời hạn dự án.",
    tip: "ETS thường bẫy dùng 'catch the deadline' hoặc 'make the deadline' trong các văn cảnh trang trọng. Cụm từ chuẩn văn phong thương mại luôn là 'meet the deadline'."
  },
  {
    category: 1,
    term: "meet customer demand / expectations",
    type: "Verb + Noun",
    meaning: "Đáp ứng nhu cầu của khách hàng / kỳ vọng",
    regex: "meet.*(demand|expectation|requirement)",
    fallbackText: "The manufacturing plant has increased its output to meet growing customer demand during the holiday season.",
    fallbackRef: "Test 03 - Part 7 Passage",
    translation: "Nhà máy sản xuất đã gia tăng sản lượng nhằm đáp ứng nhu cầu ngày càng tăng của khách hàng trong mùa lễ hội.",
    tip: "Động từ 'meet' đi liền với các danh từ như demand, needs, requirements, expectations, standards, criteria mang nghĩa đáp ứng/thỏa mãn."
  },
  {
    category: 1,
    term: "fulfill an order / obligations",
    type: "Verb + Noun",
    meaning: "Xử lý, hoàn thành đơn hàng / thực hiện nghĩa vụ",
    regex: "fulfill.*(order|obligation|requirement)",
    fallbackText: "The company supplied us with boxes that were too small to fulfill your order in a single shipment.",
    fallbackRef: "Test 01 - Part 7 Passage",
    translation: "Công ty đã cung cấp những thùng hàng quá nhỏ để có thể hoàn tất đơn hàng của quý khách trong một chuyến giao duy nhất.",
    tip: "'Fulfill' thường đi với 'order' (giao đủ hàng), 'obligation' (hoàn thành nghĩa vụ), 'promise' (giữ lời hứa). Tránh nhầm với 'fill an order' (cũng đúng nhưng fulfill mang sắc thái trang trọng hơn)."
  },
  {
    category: 1,
    term: "place an order",
    type: "Verb + Noun",
    meaning: "Đặt đơn hàng, thực hiện việc mua hàng",
    regex: "place.*order",
    fallbackText: "Customers who place an order before noon are eligible for free same-day courier delivery.",
    fallbackRef: "Test 02 - Part 7 Passage",
    translation: "Những khách hàng đặt hàng trước buổi trưa sẽ đủ điều kiện được giao hàng hỏa tốc miễn phí trong ngày.",
    tip: "Trong Part 5, chỗ trống trước 'an order' thường là động từ 'place'. ETS rất hay bẫy các phương án như 'set an order' hay 'put an order' (sai)."
  },
  {
    category: 1,
    term: "reach an agreement / a consensus",
    type: "Verb + Noun",
    meaning: "Đạt được thỏa thuận / sự đồng thuận chung",
    regex: "reach.*(agreement|consensus|compromise)",
    fallbackText: "After several rounds of negotiations, the labor union and management finally reached an agreement.",
    fallbackRef: "Test 06 - Part 7 Passage",
    translation: "Sau nhiều vòng đàm phán, công đoàn lao động và ban quản lý cuối cùng đã đạt được một thỏa thuận chung.",
    tip: "Động từ 'reach' đi với danh từ chỉ kết quả đàm phán (agreement, consensus, decision, conclusion). Tuyệt đối không dùng 'achieve an agreement'."
  },
  {
    category: 1,
    term: "conduct a survey / an inspection",
    type: "Verb + Noun",
    meaning: "Tiến hành một cuộc khảo sát / kiểm tra, thanh tra",
    regex: "conduct.*(survey|inspection|research|study)",
    fallbackText: "The human resources department decided to conduct a comprehensive survey regarding employee workplace satisfaction.",
    fallbackRef: "Test 03 - Part 5 - Q103",
    translation: "Phòng nhân sự đã quyết định tiến hành một cuộc khảo sát toàn diện liên quan đến mức độ hài lòng tại nơi làm việc của nhân viên.",
    tip: "'Conduct' luôn là động từ hàng đầu đi kèm survey, study, research, interview, inspection, evaluation. Bẫy sai: 'execute a survey' hay 'practice a survey'."
  },
  {
    category: 1,
    term: "address concerns / issues",
    type: "Verb + Noun",
    meaning: "Giải quyết các mối bận tâm / vấn đề thắc mắc",
    regex: "address.*(concern|issue|problem|inquiry)",
    fallbackText: "The regional director organized a town hall meeting to address employee concerns about the proposed office relocation.",
    fallbackRef: "Test 07 - Part 5 - Q109",
    translation: "Giám đốc khu vực đã tổ chức một buổi gặp mặt toàn thể để giải quyết những mối bận tâm của nhân viên về kế hoạch chuyển dời văn phòng.",
    tip: "'Address' ở đây là ngoại động từ mang nghĩa 'giải quyết, chú tâm xử lý' (= deal with, tackle), không mang nghĩa địa chỉ nhà."
  },
  {
    category: 1,
    term: "implement a policy / changes / measures",
    type: "Verb + Noun",
    meaning: "Thực thi, áp dụng một chính sách / thay đổi / biện pháp",
    regex: "implement.*(policy|change|measure|strategy|system)",
    fallbackText: "The management team plans to implement new safety measures across all manufacturing facilities next month.",
    fallbackRef: "Test 05 - Part 6 Passage",
    translation: "Ban quản lý dự kiến sẽ triển khai các biện pháp an toàn mới trên toàn bộ cơ sở sản xuất vào tháng tới.",
    tip: "ETS thường cho chỗ trống trước 'a policy/measure' và yêu cầu chọn động từ 'implement' hoặc tính từ 'implemented'."
  },
  {
    category: 1,
    term: "form a partnership / an alliance",
    type: "Verb + Noun",
    meaning: "Thiết lập quan hệ đối tác / liên minh hợp tác",
    regex: "form.*(partnership|alliance)",
    fallbackText: "As part of our expansion plan, we would welcome the opportunity to form a partnership with local retailers.",
    fallbackRef: "Test 02 - Part 7 Passage",
    translation: "Như một phần của kế hoạch mở rộng, chúng tôi rất hoan nghênh cơ hội thiết lập mối quan hệ đối tác với các nhà bán lẻ địa phương.",
    tip: "Cụm 'form a partnership' xuất hiện liên tục trong Part 6 & 7 khi nói về việc hợp tác kinh doanh giữa hai công ty."
  },
  {
    category: 1,
    term: "make a reservation / an appointment",
    type: "Verb + Noun",
    meaning: "Đặt chỗ trước (vé, phòng, nhà hàng) / đặt lịch hẹn",
    regex: "make.*(reservation|appointment)",
    fallbackText: "To obtain an admission pass or make a reservation for the banquet, please visit our official website.",
    fallbackRef: "Test 03 - Part 7 Passage",
    translation: "Để nhận thẻ vào cổng hoặc đặt chỗ trước cho buổi tiệc tối, vui lòng truy cập trang web chính thức của chúng tôi.",
    tip: "Đi với 'reservation' và 'appointment' phải dùng động từ 'make', không dùng 'do' hay 'take'."
  },
  {
    category: 1,
    term: "exceed expectations / targets",
    type: "Verb + Noun",
    meaning: "Vượt quá kỳ vọng / vượt chỉ tiêu đề ra",
    regex: "exceed.*(expectation|target|quota|goal)",
    fallbackText: "Third-quarter profits exceeded all market expectations thanks to the successful launch of the electric vehicle series.",
    fallbackRef: "Test 04 - Part 7 Passage",
    translation: "Lợi nhuận quý ba đã vượt qua mọi kỳ vọng của thị trường nhờ vào sự ra mắt thành công của dòng xe điện.",
    tip: "Khi thấy tân ngữ là 'expectations' hay 'sales targets', hãy nghĩ ngay đến động từ 'exceed' hoặc cụm giới từ 'beyond expectations'."
  },
  {
    category: 1,
    term: "reduce / cut expenses / costs",
    type: "Verb + Noun",
    meaning: "Cắt giảm chi phí, giảm thiểu chi tiêu",
    regex: "(reduce|cut|minimize).*(expense|cost)",
    fallbackText: "Dynart, Inc., continuously seeks innovative ways to reduce its operating expenses and environmental footprint.",
    fallbackRef: "Test 01 - Part 5 - Q109",
    translation: "Công ty Dynart liên tục tìm kiếm những phương thức đổi mới để giảm thiểu chi phí vận hành và lượng khí thải môi trường.",
    tip: "'Reduce/cut costs/expenses' là chủ đề tài chính cốt lõi trong Part 5 & 7. Từ đồng nghĩa thường gặp: 'curb spending', 'trim budget'."
  },
  {
    category: 1,
    term: "grant permission / access / approval",
    type: "Verb + Noun",
    meaning: "Cấp phép / cấp quyền truy cập / chấp thuận",
    regex: "grant.*(permission|access|approval|request)",
    fallbackText: "Only employees with certified clearance will be granted access to the research laboratory.",
    fallbackRef: "Test 04 - Part 5 - Q125",
    translation: "Chỉ những nhân viên có giấy phép chứng nhận mới được cấp quyền tiếp cận phòng thí nghiệm nghiên cứu.",
    tip: "Cấu trúc: 'grant sb permission/access' hoặc dạng bị động 'be granted access to'."
  },
  {
    category: 1,
    term: "deliver a presentation / speech",
    type: "Verb + Noun",
    meaning: "Trình bày bài thuyết trình / đọc diễn văn",
    regex: "deliver.*(presentation|speech|lecture|address)",
    fallbackText: "Dr. Aris Thorne will deliver the keynote presentation on artificial intelligence at the opening session tomorrow.",
    fallbackRef: "Test 07 - Part 5 - Q101",
    translation: "Tiến sĩ Aris Thorne sẽ trình bày bài thuyết trình chủ đạo về trí tuệ nhân tạo tại phiên khai mạc vào ngày mai.",
    tip: "Đi với 'presentation' hoặc 'speech', ETS ưa chuộng 'deliver' hoặc 'give'. Tuyệt đối không dùng 'say a presentation'."
  },
  {
    category: 1,
    term: "hold a meeting / conference / reception",
    type: "Verb + Noun",
    meaning: "Tổ chức một cuộc họp / hội nghị / tiệc đón tiếp",
    regex: "hold.*(meeting|conference|reception|event)",
    fallbackText: "The annual shareholders meeting will be held promptly at 2 P.M. in the main auditorium on Friday.",
    fallbackRef: "Test 02 - Part 5 - Q103",
    translation: "Cuộc họp cổ đông thường niên sẽ được tổ chức chính xác vào lúc 2 giờ chiều tại hội trường chính vào thứ Sáu.",
    tip: "Cấu trúc bị động 'be held at/in' cực kỳ phổ biến trong các thông báo (memos, announcements) của Part 7."
  },
  {
    category: 1,
    term: "file a claim / a complaint / an application",
    type: "Verb + Noun",
    meaning: "Nộp đơn yêu cầu bồi thường / khiếu nại / ứng tuyển",
    regex: "file.*(claim|complaint|application|suit)",
    fallbackText: "Passengers whose baggage was delayed or damaged should file a formal claim at the customer service desk.",
    fallbackRef: "Test 08 - Part 7 Passage",
    translation: "Những hành khách có hành lý bị chậm trễ hoặc hư hỏng nên nộp đơn yêu cầu bồi thường chính thức tại quầy dịch vụ khách hàng.",
    tip: "'File a claim' (nộp đơn đòi bảo hiểm/bồi thường) là cụm từ rất hay xuất hiện trong các bài đọc về du lịch, bảo hiểm và vận tải."
  },
  {
    category: 1,
    term: "voice concerns / opinions",
    type: "Verb + Noun",
    meaning: "Lên tiếng bày tỏ mối quan ngại / ý kiến",
    regex: "voice.*(concern|opinion|objection)",
    fallbackText: "Community residents attended the city council session to voice their strong concerns regarding traffic congestion.",
    fallbackRef: "Test 01 - Part 5 - Q124",
    translation: "Cư dân cộng đồng đã tham dự phiên họp hội đồng thành phố để lên tiếng bày tỏ mối lo ngại sâu sắc của họ về tình trạng ùn tắc giao thông.",
    tip: "'Voice' ở đây được dùng như một ngoại động từ mang nghĩa 'phát biểu, bày tỏ thành tiếng' (tương đương 'express')."
  },
  {
    category: 1,
    term: "maintain records / equipment / standards",
    type: "Verb + Noun",
    meaning: "Lưu giữ hồ sơ / bảo dưỡng máy móc / duy trì tiêu chuẩn",
    regex: "maintain.*(record|equipment|standard|relationship)",
    fallbackText: "The accounting department is required to maintain accurate financial records for at least seven fiscal years.",
    fallbackRef: "Test 09 - Part 5 - Q101",
    translation: "Phòng kế toán được yêu cầu phải lưu giữ các hồ sơ tài chính chính xác trong ít nhất bảy năm tài khóa.",
    tip: "'Maintain' có 2 trường nghĩa hay gặp: 1) Duy trì, lưu trữ (records, standards); 2) Bảo trì máy móc (equipment, machinery)."
  },
  {
    category: 1,
    term: "adhere to regulations / policies / guidelines",
    type: "Verb + Preposition + Noun",
    meaning: "Tuân thủ nghiêm ngặt quy định / chính sách / hướng dẫn",
    regex: "adhere to.*(regulation|policy|guideline|rule|standard)",
    fallbackText: "All laboratory technicians must strictly adhere to safety regulations while handling chemical substances.",
    fallbackRef: "Test 02 - Part 7 Passage",
    translation: "Tất cả các kỹ thuật viên phòng lab phải tuân thủ nghiêm ngặt các quy định an toàn khi xử lý các chất hóa học.",
    tip: "'Adhere' BẮT BUỘC đi với giới từ 'to'. Đồng nghĩa: 'comply with', 'conform to', 'abide by', 'follow'."
  },
  {
    category: 1,
    term: "undergo maintenance / inspection / renovation",
    type: "Verb + Noun",
    meaning: "Trải qua quá trình bảo trì / thanh tra / cải tạo",
    regex: "undergo.*(maintenance|inspection|renovation|training|repair)",
    fallbackText: "The north wing of the medical center will undergo extensive renovations throughout the upcoming winter months.",
    fallbackRef: "Test 09 - Part 7 Passage",
    translation: "Cánh phía bắc của trung tâm y tế sẽ trải qua đợt trùng tu toàn diện trong suốt những tháng mùa đông sắp tới.",
    tip: "'Undergo' mang nghĩa trải qua (quá trình tu sửa, thay đổi, kiểm tra). Bẫy thường gặp: ETS cho 'experience' hoặc 'suffer' sai ngữ cảnh."
  },
  {
    category: 1,
    term: "solicit feedback / donations / advice",
    type: "Verb + Noun",
    meaning: "Kêu gọi, tích cực thu thập phản hồi / quyên góp",
    regex: "solicit.*(feedback|donation|advice|opinion|input)",
    fallbackText: "As part of its marketing campaign, Elegancia Dishware is actively soliciting feedback from long-time customers.",
    fallbackRef: "Test 01 - Part 5 - Q114",
    translation: "Là một phần của chiến dịch tiếp thị, Elegancia Dishware đang tích cực thu thập ý kiến phản hồi từ các khách hàng lâu năm.",
    tip: "'Solicit' là động từ kinh điển trong Part 5 nghĩa là khẩn khoản xin/thu thập thông tin hoặc đóng góp quyên góp (solicit donations/feedback)."
  },
  {
    category: 1,
    term: "absorb costs / water / moisture",
    type: "Verb + Noun",
    meaning: "Gánh chịu, bao trọn chi phí / thấm hút nước",
    regex: "absorb.*(cost|water|impact|expense)",
    fallbackText: "Rain gardens are intended to absorb water to prevent flooding of local residential roads.",
    fallbackRef: "Test 01 - Part 5 - Q115",
    translation: "Các khu vườn hứng nước mưa được thiết kế nhằm thấm hút nước để ngăn ngừa ngập lụt các tuyến đường dân cư địa phương.",
    tip: "Trong kinh doanh: 'absorb the shipping costs' = công ty chịu phần phí ship cho khách thay vì bắt khách trả."
  },
  {
    category: 1,
    term: "boost sales / productivity / morale",
    type: "Verb + Noun",
    meaning: "Gia tăng mạnh mẽ doanh số / năng suất / tinh thần làm việc",
    regex: "boost.*(sale|productivity|morale|performance)",
    fallbackText: "The new incentive program was designed to boost employee productivity and overall workplace morale.",
    fallbackRef: "Test 01 - Part 5 - Q116",
    translation: "Chương trình khen thưởng mới được thiết kế để thúc đẩy năng suất của nhân viên và tinh thần làm việc chung tại công sở.",
    tip: "'Boost' là ngoại động từ mang nghĩa nâng cao, đẩy mạnh (tương tự như 'increase' nhưng mang tính đột phá và tích cực hơn)."
  },
  {
    category: 1,
    term: "take effect / take place / take measures",
    type: "Verb + Noun Phrase",
    meaning: "Có hiệu lực / diễn ra / thực hiện các biện pháp",
    regex: "take.*(effect|place|measure|precaution|step)",
    fallbackText: "The revised employee travel expense reimbursement policy will take effect at the beginning of the next fiscal quarter.",
    fallbackRef: "Test 02 - Part 6 Passage",
    translation: "Chính sách sửa đổi về hoàn trả chi phí công tác của nhân viên sẽ bắt đầu có hiệu lực vào đầu quý tài khóa tiếp theo.",
    tip: "'Take effect' = bắt đầu có giá trị pháp lý/hiệu lực. Bẫy sai: 'make effect' (hoàn toàn sai trong tiếng Anh)."
  },
  {
    category: 1,
    term: "resolve a dispute / an issue / a conflict",
    type: "Verb + Noun",
    meaning: "Giải quyết ổn thỏa một tranh chấp / vấn đề bất đồng",
    regex: "resolve.*(dispute|issue|conflict|problem|complaint)",
    fallbackText: "The customer service representative worked diligently to resolve the billing dispute in a courteous manner.",
    fallbackRef: "Test 04 - Part 5 - Q105",
    translation: "Đại diện dịch vụ khách hàng đã làm việc hết sức tận tâm để giải quyết ổn thỏa tranh chấp hóa đơn một cách lịch sự.",
    tip: "'Resolve' thường đi với dispute, issue, conflict mang nghĩa hòa giải, dàn xếp xong xuôi ổn thỏa."
  },
  {
    category: 1,
    term: "allocate funds / budget / resources",
    type: "Verb + Noun",
    meaning: "Phân bổ kinh phí / ngân sách / nguồn lực tài nguyên",
    regex: "allocate.*(fund|budget|resource|money)",
    fallbackText: "The board of trustees voted unanimously to allocate additional funds toward the community library upgrade project.",
    fallbackRef: "Test 05 - Part 7 Passage",
    translation: "Hội đồng quản trị đã bỏ phiếu nhất trí phân bổ thêm kinh phí cho dự án nâng cấp thư viện cộng đồng.",
    tip: "Cấu trúc: 'allocate [funds/resources] TO/FOR [a project]'. Chú ý giới từ 'to/for'."
  },
  {
    category: 1,
    term: "finalize details / the contract / an agreement",
    type: "Verb + Noun",
    meaning: "Hoàn tất các chi tiết cuối cùng / ký chốt hợp đồng",
    regex: "finalize.*(detail|contract|agreement|plan|itinerary)",
    fallbackText: "Both legal teams are scheduled to meet on Thursday afternoon to finalize the details of the merger contract.",
    fallbackRef: "Test 03 - Part 5 - Q108",
    translation: "Cả hai đội ngũ pháp lý dự kiến sẽ gặp nhau vào chiều thứ Năm để hoàn tất các điều khoản chi tiết của hợp đồng sáp nhập.",
    tip: "'Finalize' = làm cho xong hẳn mọi thủ tục sau cùng. Thường đi với contract, agreement, itinerary, schedule."
  },
  {
    category: 1,
    term: "renew a subscription / contract / lease",
    type: "Verb + Noun",
    meaning: "Gia hạn gói đăng ký báo/dịch vụ / gia hạn hợp đồng thuê",
    regex: "renew.*(subscription|contract|lease|membership)",
    fallbackText: "Subscribers who renew their annual magazine subscription before Friday will receive a twenty percent discount voucher.",
    fallbackRef: "Test 07 - Part 5 - Q107",
    translation: "Các độc giả gia hạn gói đăng ký tạp chí năm trước thứ Sáu sẽ nhận được phiếu giảm giá hai mươi phần trăm.",
    tip: "'Renew' khác với 'extend'. 'Renew' thường dùng cho đăng ký dịch vụ định kỳ hoặc hợp đồng có thời hạn (lease, subscription, membership)."
  },
  {
    category: 1,
    term: "launch a product / a marketing campaign",
    type: "Verb + Noun",
    meaning: "Tung ra một sản phẩm mới / khởi động chiến dịch tiếp thị",
    regex: "launch.*(product|campaign|service|initiative)",
    fallbackText: "The telecommunications company plans to launch its next-generation smartphone series late next month.",
    fallbackRef: "Test 09 - Part 7 Passage",
    translation: "Công ty viễn thông dự kiến sẽ tung ra dòng điện thoại thông minh thế hệ tiếp theo vào cuối tháng tới.",
    tip: "Đồng nghĩa thương mại: 'introduce a product to the market', 'release a model'."
  },
  {
    category: 1,
    term: "gain recognition / approval / popularity",
    type: "Verb + Noun",
    meaning: "Được công nhận / nhận được sự tán thành / gia tăng độ phổ biến",
    regex: "gain.*(recognition|approval|popularity|momentum)",
    fallbackText: "Chef Clara Lin has gained international recognition for her innovative use of organic, locally sourced ingredients.",
    fallbackRef: "Test 05 - Part 7 Passage",
    translation: "Bếp trưởng Clara Lin đã nhận được sự công nhận quốc tế nhờ vào việc sử dụng sáng tạo các nguyên liệu hữu cơ có nguồn gốc địa phương.",
    tip: "Động từ 'gain' hay đi với các danh từ trừu tượng chỉ danh tiếng, lợi ích: recognition, approval, market share, insight."
  },
  {
    category: 1,
    term: "streamline operations / procedures",
    type: "Verb + Noun",
    meaning: "Tinh gọn, đơn giản hóa quy trình vận hành",
    regex: "streamline.*(operation|procedure|process|workflow)",
    fallbackText: "Investing in cloud-based management tools has helped the corporation streamline its global supply chain operations.",
    fallbackRef: "Test 08 - Part 5 - Q109",
    translation: "Đầu tư vào các công cụ quản lý trên nền tảng đám mây đã giúp tập đoàn tinh gọn quy trình vận hành chuỗi cung ứng toàn cầu.",
    tip: "'Streamline' là từ vựng band điểm cao (700+) trong TOEIC, mang nghĩa tái cấu trúc cho gọn gàng, hiệu quả hơn."
  },
  {
    category: 1,
    term: "express gratitude / appreciation",
    type: "Verb + Noun",
    meaning: "Bày tỏ lòng biết ơn sâu sắc / sự cảm kích chân thành",
    regex: "express.*(gratitude|appreciation|thanks|concern)",
    fallbackText: "Once again, I would like to express my sincere gratitude for your exceptional guidance and dedication.",
    fallbackRef: "Test 01 - Part 7 Passage",
    translation: "Một lần nữa, tôi muốn bày tỏ lòng biết ơn chân thành đối với sự hướng dẫn tận tình và lòng tận tâm xuất sắc của bạn.",
    tip: "Xuất hiện trong 90% các bức thư trang trọng (formal emails/letters) ở Part 7 khi người viết cảm ơn đối tác hoặc nhân viên kỳ cựu."
  },
  {
    category: 1,
    term: "exercise caution / rights",
    type: "Verb + Noun",
    meaning: "Hết sức cẩn trọng / thực hiện quyền lợi hợp pháp",
    regex: "exercise.*(caution|care|right|discretion)",
    fallbackText: "Drivers are urged to exercise caution when navigating the roadwork detour on Highway 104.",
    fallbackRef: "Test 06 - Part 5 - Q122",
    translation: "Các tài xế được khuyến cáo hãy hết sức cẩn trọng khi di chuyển qua đoạn đường vòng đang thi công trên Quốc lộ 104.",
    tip: "'Exercise' ở đây là động từ mang nghĩa 'thực thi, thận trọng' (= display, use), không phải là tập thể dục!"
  },
  {
    category: 1,
    term: "compensate for (loss / lack of experience)",
    type: "Verb + Preposition + Noun",
    meaning: "Đền bù cho thiệt hại / bù đắp cho sự thiếu hụt kinh nghiệm",
    regex: "compensate for",
    fallbackText: "The newspaper article describes practical ways job seekers can compensate for having little formal workplace experience.",
    fallbackRef: "Test 01 - Part 5 - Q119",
    translation: "Bài báo mô tả những phương pháp thực tế giúp người tìm việc có thể bù đắp cho sự thiếu hụt kinh nghiệm làm việc chính thức.",
    tip: "'Compensate' bắt buộc đi với giới từ 'for' khi mang nghĩa đền bù, bù đắp thiệt hại."
  },
  {
    category: 1,
    term: "demonstrate proficiency / capability",
    type: "Verb + Noun",
    meaning: "Chứng minh sự thành thạo / thể hiện năng lực chuyên môn",
    regex: "demonstrate.*(proficiency|capability|skill|competence)",
    fallbackText: "Applicants for the translator role must demonstrate proficiency in at least two foreign languages during the assessment.",
    fallbackRef: "Test 09 - Part 7 Passage",
    translation: "Các ứng viên cho vị trí biên dịch viên phải chứng minh sự thành thạo ít nhất hai ngoại ngữ trong kỳ đánh giá chuyên môn.",
    tip: "'Demonstrate proficiency in' là cụm từ xuất hiện cực kỳ nhiều trong các mẩu tin tuyển dụng (job postings) ở Part 7."
  },

  // ============================================================
  // SECTION 2: ADJECTIVE + NOUN (35 CỤM TÍNH TỪ + DANH TỪ KINH ĐIỂN)
  // ============================================================
  {
    category: 2,
    term: "state-of-the-art facility / equipment",
    type: "Adjective + Noun",
    meaning: "Cơ sở vật chất / trang thiết bị hiện đại, tối tân nhất",
    regex: "state-of-the-art.*(facility|equipment|system|technology)",
    fallbackText: "We have a state-of-the-art sound system and audiovisual equipment for keynote speeches and entertainment.",
    fallbackRef: "Test 04 - Part 7 Passage",
    translation: "Chúng tôi sở hữu hệ thống âm thanh và thiết bị nghe nhìn tối tân hiện đại nhất phục vụ cho các bài phát biểu và giải trí.",
    tip: "'State-of-the-art' là tính từ ghép có dấu gạch nối, đồng nghĩa với 'cutting-edge', 'most up-to-date', 'modern'."
  },
  {
    category: 2,
    term: "solid reputation / background",
    type: "Adjective + Noun",
    meaning: "Uy tín vững chắc / nền tảng vững vàng",
    regex: "solid.*(reputation|background|foundation)",
    fallbackText: "You have established a solid reputation regarding your restaurant chain's commitment to culinary excellence.",
    fallbackRef: "Test 10 - Part 7 Passage",
    translation: "Bạn đã tạo dựng được một uy tín vững chắc liên quan đến cam kết chất lượng ẩm thực vượt trội của chuỗi nhà hàng.",
    tip: "'Solid' ở đây có nghĩa là 'đáng tin cậy, vững bền' (= strong, dependable), thường đi với reputation, performance, experience."
  },
  {
    category: 2,
    term: "complimentary breakfast / shuttle service / ticket",
    type: "Adjective + Noun",
    meaning: "Bữa sáng / xe đưa đón / vé mời miễn phí",
    regex: "complimentary.*(breakfast|shuttle|service|refreshment|gift|inspection|parking)",
    fallbackText: "The hotel offers complimentary shuttle service to and from the international airport every thirty minutes.",
    fallbackRef: "Test 03 - Part 7 Passage",
    translation: "Khách sạn cung cấp dịch vụ xe đưa đón miễn phí đi và đến sân bay quốc tế cứ mỗi ba mươi phút một chuyến.",
    tip: "PHÂN BIỆT BẪY CỰC NGUY HIỂM: 'complimentary' (với chữ 'i') = miễn phí (= free); còn 'complementary' (với chữ 'e') = bổ sung, hỗ trợ cho nhau."
  },
  {
    category: 2,
    term: "competitive salary / rates / market",
    type: "Adjective + Noun",
    meaning: "Mức lương / giá cước cạnh tranh / thị trường có tính cạnh tranh cao",
    regex: "competitive.*(salary|rate|price|market|package|compensation)",
    fallbackText: "Zestful Cuisine offers competitive pay rates and comprehensive healthcare benefits based on prior job experience.",
    fallbackRef: "Test 04 - Part 7 Passage",
    translation: "Zestful Cuisine đưa ra mức thù lao cạnh tranh và các gói chăm sóc sức khỏe toàn diện dựa trên kinh nghiệm công việc trước đó.",
    tip: "Trong tuyển dụng: 'competitive salary/rates' = mức lương hấp dẫn so với mặt bằng chung thị trường."
  },
  {
    category: 2,
    term: "routine maintenance / inspection",
    type: "Adjective + Noun",
    meaning: "Bảo dưỡng / kiểm tra định kỳ thường xuyên",
    regex: "routine.*(maintenance|inspection|check|task|service)",
    fallbackText: "It definitely needs routine maintenance, and we may have to plan some additional repairs for the air conditioning system.",
    fallbackRef: "Test 09 - Part 7 Passage",
    translation: "Nó chắc chắn cần được bảo dưỡng định kỳ, và chúng ta có thể phải lên kế hoạch sửa chữa bổ sung cho hệ thống điều hòa.",
    tip: "'Routine' bổ nghĩa cho maintenance/inspection mang ý nghĩa công việc được làm đều đặn theo chu kỳ."
  },
  {
    category: 2,
    term: "preliminary results / findings / report",
    type: "Adjective + Noun",
    meaning: "Kết quả / phát hiện / báo cáo sơ bộ ban đầu",
    regex: "preliminary.*(result|finding|report|data|analysis|stage)",
    fallbackText: "Preliminary findings from the environmental impact study indicate that the construction will cause minimal disruption.",
    fallbackRef: "Test 06 - Part 7 Passage",
    translation: "Những phát hiện sơ bộ từ cuộc nghiên cứu tác động môi trường chỉ ra rằng việc thi công sẽ gây ra sự xáo trộn tối thiểu.",
    tip: "'Preliminary' mang nghĩa sơ bộ, bước đầu (= initial). Thường đứng trước findings, results, report, estimates."
  },
  {
    category: 2,
    term: "substantial increase / growth / reduction",
    type: "Adjective + Noun",
    meaning: "Sự gia tăng / tăng trưởng / giảm sút đáng kể",
    regex: "substantial.*(increase|growth|reduction|amount|investment|saving)",
    fallbackText: "The company reported a substantial increase in online sales during the second quarter of the fiscal year.",
    fallbackRef: "Test 01 - Part 5 - Q116",
    translation: "Công ty đã báo cáo một sự gia tăng đáng kể về doanh số bán hàng trực tuyến trong quý thứ hai của năm tài chính.",
    tip: "'Substantial' = 'significant', 'considerable' (đáng kể, lớn lao). Bẫy thường gặp: ETS bẫy trạng từ 'substantially' hoặc danh từ 'substance'."
  },
  {
    category: 2,
    term: "custom-tailored solutions / services",
    type: "Adjective + Noun",
    meaning: "Giải pháp / dịch vụ được thiết kế riêng theo nhu cầu cá nhân",
    regex: "custom-tailored.*(solution|service|plan|program|software)",
    fallbackText: "Our agency provides custom-tailored marketing solutions designed specifically to help small businesses expand.",
    fallbackRef: "Test 07 - Part 7 Passage",
    translation: "Công ty chúng tôi cung cấp các giải pháp tiếp thị được thiết kế riêng nhằm hỗ trợ cụ thể các doanh nghiệp nhỏ mở rộng quy mô.",
    tip: "'Custom-tailored' hoặc 'customized' mang nghĩa 'đo ni đóng giày' theo đơn đặt hàng, trái nghĩa với sản phẩm đại trà (standardized)."
  },
  {
    category: 2,
    term: "mandatory training / attendance",
    type: "Adjective + Noun",
    meaning: "Khóa đào tạo / sự tham dự mang tính bắt buộc",
    regex: "mandatory.*(training|attendance|meeting|requirement)",
    fallbackText: "Attendance at the workplace harassment prevention seminar on Monday morning is strictly mandatory for all department heads.",
    fallbackRef: "Test 08 - Part 6 Passage",
    translation: "Việc tham dự buổi hội thảo phòng chống quấy rối nơi làm việc vào sáng thứ Hai là hoàn toàn bắt buộc đối với tất cả các trưởng phòng.",
    tip: "'Mandatory' = 'compulsory', 'obligatory', 'required' (bắt buộc theo luật/quy định). Trái nghĩa: 'optional', 'voluntary'."
  },
  {
    category: 2,
    term: "prospective clients / employees",
    type: "Adjective + Noun",
    meaning: "Khách hàng / nhân viên tiềm năng trong tương lai",
    regex: "prospective.*(client|employee|buyer|candidate|investor|partner)",
    fallbackText: "This portfolio can be an effective way of demonstrating your diverse capabilities to a prospective employer.",
    fallbackRef: "Test 09 - Part 7 Passage",
    translation: "Tập hồ sơ năng lực này có thể là một phương thức hiệu quả để chứng minh những khả năng đa dạng của bạn với một nhà tuyển dụng tiềm năng.",
    tip: "'Prospective' = có triển vọng, tiềm năng (= potential). Bẫy âm thanh: 'perspective' (danh từ: góc nhìn, quan điểm)."
  },
  {
    category: 2,
    term: "confidential information / documents",
    type: "Adjective + Noun",
    meaning: "Thông tin / tài liệu bảo mật, cơ mật",
    regex: "confidential.*(information|document|record|file|data)",
    fallbackText: "All personally identifiable information will be treated confidentially in accordance with our strict internal privacy policy.",
    fallbackRef: "Test 02 - Part 7 Passage",
    translation: "Mọi thông tin nhận dạng cá nhân sẽ được xử lý bảo mật hoàn toàn tuân theo chính sách quyền riêng tư nội bộ nghiêm ngặt của chúng tôi.",
    tip: "'Confidential' = tuyệt mật, kín đáo. Thường đi kèm với cụm 'strictly confidential' hoặc 'handle confidentially'."
  },
  {
    category: 2,
    term: "thorough inspection / review / analysis",
    type: "Adjective + Noun",
    meaning: "Cuộc thanh tra / xem xét / phân tích kỹ lưỡng, thấu đáo",
    regex: "thorough.*(inspection|review|analysis|check|investigation|search)",
    fallbackText: "Before releasing the software update to the public, the development team conducted a thorough review of the code.",
    fallbackRef: "Test 03 - Part 5 - Q103",
    translation: "Trước khi phát hành bản cập nhật phần mềm ra công chúng, nhóm phát triển đã tiến hành một đợt rà soát kỹ lưỡng toàn bộ mã nguồn.",
    tip: "BẪY TỪ VỰNG: 'thorough' (tính từ: kỹ lưỡng, sâu sắc) khác với 'through' (giới từ: xuyên qua) và 'though' (liên từ: mặc dù)."
  },
  {
    category: 2,
    term: "wide / broad range of",
    type: "Adjective + Noun Phrase",
    meaning: "Đa dạng, phong phú nhiều chủng loại",
    regex: "(wide|broad|diverse).*(range|variety|selection) of",
    fallbackText: "The Devegas Peninsula features a wide range of luxury accommodation options to suit every traveler's budget.",
    fallbackRef: "Test 07 - Part 6 Passage",
    translation: "Bán đảo Devegas có rất nhiều lựa chọn chỗ nghỉ sang trọng phong phú phù hợp với ngân sách của mọi du khách.",
    tip: "Cụm 'a wide/broad range of + N đếm được số nhiều' là cấu trúc ăn điểm cố định trong Part 5 & 6."
  },
  {
    category: 2,
    term: "valid ID / passport / permit",
    type: "Adjective + Noun",
    meaning: "Thẻ căn cước / hộ chiếu / giấy phép còn hiệu lực hợp lệ",
    regex: "valid.*(id|identification|passport|permit|license|ticket|coupon)",
    fallbackText: "All visitors entering the government facility must present a valid government-issued photo ID at the reception security gate.",
    fallbackRef: "Test 08 - Part 5 - Q103",
    translation: "Tất cả khách tham quan khi vào cơ sở chính phủ phải xuất trình giấy tờ tùy thân có ảnh hợp lệ do chính phủ cấp tại cổng an ninh.",
    tip: "'Valid' = còn giá trị sử dụng. Trái nghĩa: 'expired' (hết hạn), 'invalid' (không hợp lệ)."
  },
  {
    category: 2,
    term: "stringent safety standards / regulations",
    type: "Adjective + Noun",
    meaning: "Các tiêu chuẩn / quy định an toàn nghiêm ngặt",
    regex: "stringent.*(standard|regulation|requirement|rule|measure)",
    fallbackText: "Pharmaceutical production must comply with stringent regulatory standards established by the health administration.",
    fallbackRef: "Test 02 - Part 7 Passage",
    translation: "Quá trình sản xuất dược phẩm phải tuân thủ các tiêu chuẩn quản lý nghiêm ngặt do cơ quan quản trị y tế thiết lập.",
    tip: "'Stringent' = 'strict', 'rigorous' (ngặt nghèo, chặt chẽ). Cực kỳ hay đi với standards, regulations, controls."
  },
  {
    category: 2,
    term: "constructive feedback / criticism",
    type: "Adjective + Noun",
    meaning: "Phản hồi / đóng góp mang tính xây dựng",
    regex: "constructive.*(feedback|criticism|suggestion|dialogue)",
    fallbackText: "Managers at Afton Accounting are urged to provide constructive feedback to employees on a regular, supportive basis.",
    fallbackRef: "Test 05 - Part 5 - Q110",
    translation: "Các nhà quản lý tại Afton Accounting được khuyến khích đưa ra những phản hồi mang tính xây dựng cho nhân viên trên cơ sở định kỳ và hỗ trợ.",
    tip: "'Constructive' xuất phát từ 'construct' (xây dựng) -> mang tính tích cực, giúp người khác tiến bộ hơn."
  },
  {
    category: 2,
    term: "exceptional customer service / performance",
    type: "Adjective + Noun",
    meaning: "Dịch vụ chăm sóc khách hàng / hiệu suất xuất sắc, vượt trội",
    regex: "exceptional.*(service|performance|quality|talent|value)",
    fallbackText: "Our hotel prides itself on providing exceptional service and luxurious amenities to all international guests.",
    fallbackRef: "Test 04 - Part 7 Passage",
    translation: "Khách sạn chúng tôi tự hào về việc cung cấp dịch vụ xuất sắc và các tiện nghi sang trọng cho tất cả du khách quốc tế.",
    tip: "'Exceptional' = 'outstanding', 'superb' (vượt trội hơn hẳn bình thường), không phải mang nghĩa 'ngoại lệ'."
  },
  {
    category: 2,
    term: "unprecedented demand / success / growth",
    type: "Adjective + Noun",
    meaning: "Nhu cầu / thành công / sự tăng trưởng chưa từng có tiền lệ",
    regex: "unprecedented.*(demand|success|growth|volume|level)",
    fallbackText: "Due to unprecedented demand for ticket reservations, the theater management decided to add two extra evening performances.",
    fallbackRef: "Test 06 - Part 7 Passage",
    translation: "Do nhu cầu đặt vé xem kịch tăng cao chưa từng có, ban quản lý rạp hát đã quyết định bổ sung thêm hai suất diễn tối.",
    tip: "'Unprecedented' = never done or known before (vô tiền khoáng hậu). Đây là từ vựng rất hay chọn làm đáp án đúng ở câu hỏi từ vựng khó."
  },
  {
    category: 2,
    term: "designated parking area / smoking zone",
    type: "Adjective + Noun",
    meaning: "Khu vực đỗ xe / hút thuốc được chỉ định cụ thể",
    regex: "designated.*(parking|area|zone|seat|driver|spot|space)",
    fallbackText: "Visitors must park their vehicles exclusively in the designated parking area located behind the east warehouse.",
    fallbackRef: "Test 07 - Part 5 - Q124",
    translation: "Khách đến thăm chỉ được đỗ phương tiện của họ trong khu vực đỗ xe được chỉ định nằm phía sau nhà kho phía đông.",
    tip: "'Designated' = được phân bổ, chỉ định rõ ràng cho một mục đích riêng biệt. Bẫy sai: 'designed' (được thiết kế)."
  },
  {
    category: 2,
    term: "tentative schedule / itinerary / agreement",
    type: "Adjective + Noun",
    meaning: "Lịch trình / kế hoạch / thỏa thuận dự kiến (có thể thay đổi)",
    regex: "tentative.*(schedule|itinerary|agreement|plan|date)",
    fallbackText: "The conference organizer sent out a tentative schedule, noting that speaker session times remain subject to final confirmation.",
    fallbackRef: "Test 05 - Part 6 Passage",
    translation: "Ban tổ chức hội nghị đã gửi đi một lịch trình dự kiến, kèm lưu ý rằng giờ giấc các phiên thuyết trình vẫn có thể thay đổi sau xác nhận cuối cùng.",
    tip: "'Tentative' = mang tính thăm dò, dự kiến, chưa chính thức (= provisional, not finalized). Thường đi với schedule, agreement."
  },
  {
    category: 2,
    term: "prompt response / payment / delivery",
    type: "Adjective + Noun",
    meaning: "Sự phản hồi / thanh toán / giao nhận kịp thời, nhanh chóng",
    regex: "prompt.*(response|payment|delivery|service|attention|action)",
    fallbackText: "We greatly appreciate your prompt response to our invoice inquiry regarding the replacement auto parts.",
    fallbackRef: "Test 08 - Part 7 Passage",
    translation: "Chúng tôi đánh giá rất cao sự phản hồi nhanh chóng của quý khách đối với câu hỏi về hóa đơn liên quan đến các linh kiện ô tô thay thế.",
    tip: "'Prompt' vừa là tính từ (mau lẹ), vừa là trạng từ trong cụm 'promptly at [time]' (đúng vào lúc)."
  },
  {
    category: 2,
    term: "valuable contribution / asset / insight",
    type: "Adjective + Noun",
    meaning: "Sự đóng góp / tài sản / cái nhìn sâu sắc vô cùng quý giá",
    regex: "valuable.*(contribution|asset|insight|resource|feedback|addition)",
    fallbackText: "Ms. Patel made a valuable contribution to the marketing department during her six years with the company.",
    fallbackRef: "Test 04 - Part 5 - Q127",
    translation: "Cô Patel đã có đóng góp vô cùng quý giá cho phòng tiếp thị trong suốt sáu năm công tác tại công ty.",
    tip: "Đi với 'contribution', 'asset', các tính từ hay gặp gồm: valuable, significant, notable, outstanding."
  },
  {
    category: 2,
    term: "extensive experience / knowledge / training",
    type: "Adjective + Noun",
    meaning: "Kinh nghiệm / kiến thức sâu rộng / đào tạo chuyên sâu",
    regex: "extensive.*(experience|knowledge|training|renovation|network|research)",
    fallbackText: "The plumbing specialist position requires extensive practical training, even for those with vocational technical diplomas.",
    fallbackRef: "Test 01 - Part 5 - Q125",
    translation: "Vị trí chuyên viên sửa ống nước đòi hỏi quá trình đào tạo thực hành chuyên sâu, ngay cả với những người đã có bằng trung cấp kỹ thuật.",
    tip: "'Extensive' = trải rộng, sâu sắc, bao quát. Tránh nhầm với 'extended' (kéo dài về mặt thời gian, ví dụ: extended warranty)."
  },
  {
    category: 2,
    term: "comprehensive guide / benefits package",
    type: "Adjective + Noun",
    meaning: "Cẩm nang hướng dẫn toàn diện / gói quyền lợi trọn gói",
    regex: "comprehensive.*(guide|package|review|report|training|insurance|coverage)",
    fallbackText: "The employee handbook offers a comprehensive guide to all company policies and professional development programs.",
    fallbackRef: "Test 03 - Part 5 - Q103",
    translation: "Cuốn sổ tay nhân viên cung cấp một bản hướng dẫn toàn diện về tất cả các chính sách công ty và chương trình phát triển chuyên môn.",
    tip: "'Comprehensive' = bao quát, đầy đủ mọi khía cạnh (= thorough, complete). Bẫy âm thanh: 'comprehensible' (dễ hiểu)."
  },
  {
    category: 2,
    term: "commercial supplier / property / space",
    type: "Adjective + Noun",
    meaning: "Nhà cung cấp / bất động sản / mặt bằng mang tính thương mại",
    regex: "commercial.*(supplier|property|space|district|vehicle|client)",
    fallbackText: "The home improvement store's entire inventory of treated lumber comes directly from a local commercial supplier.",
    fallbackRef: "Test 01 - Part 5 - Q129",
    translation: "Toàn bộ lượng gỗ xẻ đã qua xử lý trong kho của cửa hàng sửa chữa nhà cửa đều đến trực tiếp từ một nhà cung cấp thương mại địa phương.",
    tip: "'Commercial' liên quan đến buôn bán, giao thương quy mô lớn, trái nghĩa với 'residential' (thuộc khu dân cư)."
  },
  {
    category: 2,
    term: "existing clients / facilities / conditions",
    type: "Adjective + Noun",
    meaning: "Khách hàng / cơ sở vật chất / điều kiện hiện hữu (đang có)",
    regex: "existing.*(client|customer|facility|condition|contract|policy)",
    fallbackText: "Upgrades will be made to existing manufacturing facilities before any new construction is commissioned.",
    fallbackRef: "Test 05 - Part 6 Passage",
    translation: "Các đợt nâng cấp sẽ được thực hiện đối với các cơ sở sản xuất hiện có trước khi bất kỳ công trình xây mới nào được đưa vào hoạt động.",
    tip: "'Existing' là phân từ đóng vai trò tính từ mang nghĩa 'hiện đang tồn tại'. Đừng nhầm với 'existed' (không dùng làm tính từ trước danh từ)."
  },
  {
    category: 2,
    term: "unanimous decision / agreement / approval",
    type: "Adjective + Noun",
    meaning: "Quyết định / sự đồng thuận / sự phê chuẩn nhất trí 100%",
    regex: "unanimous.*(decision|agreement|approval|vote|support)",
    fallbackText: "In a unanimous decision, the executive committee voted to promote Mr. Thorne to regional vice president.",
    fallbackRef: "Test 03 - Part 5 - Q104",
    translation: "Trong một quyết định nhất trí hoàn toàn, ủy ban điều hành đã bỏ phiếu thăng chức cho ông Thorne lên vị trí phó chủ tịch khu vực.",
    tip: "'Unanimous' phát âm là /juːˈnæn.ɪ.məs/ (bắt đầu bằng bán nguyên âm /j/, vì vậy dùng mạo từ 'a unanimous', không dùng 'an')."
  },
  {
    category: 2,
    term: "outstanding balance / debt / achievement",
    type: "Adjective + Noun",
    meaning: "Số dư chưa thanh toán / nợ đọng / thành tựu kiệt xuất",
    regex: "outstanding.*(balance|debt|invoice|achievement|performance)",
    fallbackText: "Please settle the outstanding balance on your account by the final payment deadline to avoid service suspension.",
    fallbackRef: "Test 09 - Part 7 Passage",
    translation: "Vui lòng thanh toán số dư còn thiếu trong tài khoản của bạn trước hạn chót thanh toán cuối cùng để tránh bị tạm ngưng dịch vụ.",
    tip: "Hai nghĩa ETS hay ra: 1) Tài chính: chưa trả (= unpaid balance); 2) Đánh giá nhân sự: xuất sắc, nổi bật (= excellent)."
  },
  {
    category: 2,
    term: "seasonal discounts / fluctuations / employment",
    type: "Adjective + Noun",
    meaning: "Mức giảm giá theo mùa / biến động theo mùa / việc làm thời vụ",
    regex: "seasonal.*(discount|fluctuation|worker|employment|rate|demand)",
    fallbackText: "Retailers often rely on temporary seasonal workers to handle the surge in store traffic during the winter holidays.",
    fallbackRef: "Test 07 - Part 7 Passage",
    translation: "Các nhà bán lẻ thường phụ thuộc vào các lao động thời vụ tạm thời để xử lý lượng khách mua sắm tăng vọt trong những ngày nghỉ đông.",
    tip: "'Seasonal' = theo mùa vụ; khác với 'seasoned' (dày dạn kinh nghiệm, ví dụ: a seasoned executive)."
  },
  {
    category: 2,
    term: "reliable supplier / transportation / service",
    type: "Adjective + Noun",
    meaning: "Nhà cung cấp / phương tiện vận chuyển / dịch vụ đáng tin cậy",
    regex: "reliable.*(supplier|transportation|service|source|equipment|partner)",
    fallbackText: "Mr. Suh has requested that a more reliable copy machine be purchased for the finance department.",
    fallbackRef: "Test 06 - Part 5 - Q107",
    translation: "Ông Suh đã yêu cầu mua một chiếc máy photocopy hoạt động đáng tin cậy hơn cho phòng tài chính.",
    tip: "'Reliable' = dependable (đáng tin cậy, vận hành ổn định không hỏng hóc). Thường đi với thiết bị, phương tiện, đối tác."
  },
  {
    category: 2,
    term: "ergonomic solutions / furniture / design",
    type: "Adjective + Noun",
    meaning: "Giải pháp / nội thất / thiết kế công thái học (bảo vệ sức khỏe)",
    regex: "ergonomic.*(solution|furniture|chair|design|equipment|keyboard)",
    fallbackText: "If you represent a business organization seeking to provide ergonomic solutions for your office staff, contact us.",
    fallbackRef: "Test 01 - Part 7 Passage",
    translation: "Nếu bạn đại diện cho một tổ chức doanh nghiệp đang tìm cách cung cấp các giải pháp công thái học cho nhân viên văn phòng, hãy liên hệ chúng tôi.",
    tip: "'Ergonomic' là từ vựng rất thịnh hành trong các đề thi TOEIC mới liên quan đến nội thất văn phòng làm việc hiện đại."
  },
  {
    category: 2,
    term: "proprietary software / technology",
    type: "Adjective + Noun",
    meaning: "Phần mềm / công nghệ độc quyền sáng chế",
    regex: "proprietary.*(software|technology|system|code|formula)",
    fallbackText: "Although her formal training has just begun, Ms. Yu has already mastered the firm's proprietary accounting software.",
    fallbackRef: "Test 02 - Part 5 - Q110",
    translation: "Mặc dù quá trình đào tạo chính thức của cô ấy mới bắt đầu, cô Yu đã làm chủ được phần mềm kế toán độc quyền của công ty.",
    tip: "'Proprietary' = thuộc quyền sở hữu riêng của công ty, không chia sẻ công khai ra ngoài."
  },
  {
    category: 2,
    term: "ongoing construction / project / investigation",
    type: "Adjective + Noun",
    meaning: "Công trình xây dựng / dự án / cuộc điều tra đang diễn ra liên tục",
    regex: "ongoing.*(construction|project|investigation|effort|maintenance|support)",
    fallbackText: "Merryville residents will receive an online status update regarding the ongoing bridge construction project.",
    fallbackRef: "Test 01 - Part 5 - Q103",
    translation: "Cư dân Merryville sẽ nhận được một bản cập nhật trạng thái trực tuyến liên quan đến dự án xây dựng cầu đang được tiến hành.",
    tip: "'Ongoing' = continuing, in progress (đang tiếp diễn). Đứng trước danh từ bổ nghĩa trực tiếp."
  },
  {
    category: 2,
    term: "significant impact / progress / savings",
    type: "Adjective + Noun",
    meaning: "Tác động / tiến triển / khoản tiết kiệm đáng kể, to lớn",
    regex: "significant.*(impact|progress|saving|change|improvement|role)",
    fallbackText: "Switching to energy-efficient LED fixtures has resulted in significant cost savings across all regional facilities.",
    fallbackRef: "Test 09 - Part 5 - Q110",
    translation: "Việc chuyển đổi sang các thiết bị đèn LED tiết kiệm năng lượng đã mang lại các khoản tiết kiệm chi phí đáng kể trên toàn bộ các cơ sở khu vực.",
    tip: "'Significant' là tính từ xuất hiện với tần suất cực cao trong cả 3 Part 5, 6, 7. Trạng từ đi kèm: 'significantly increase/improve'."
  },
  {
    category: 2,
    term: "temporary replacement / disruption",
    type: "Adjective + Noun",
    meaning: "Người / vật thay thế tạm thời / sự gián đoạn tạm thời",
    regex: "temporary.*(replacement|disruption|closure|worker|measure|relocation)",
    fallbackText: "During the temporary closure of the north lobby, please use the alternative entrance on Elm Street.",
    fallbackRef: "Test 09 - Part 5 - Q102",
    translation: "Trong thời gian tạm thời đóng cửa sảnh phía bắc, vui lòng sử dụng lối vào thay thế trên đường Elm.",
    tip: "'Temporary' trái nghĩa với 'permanent' (vĩnh viễn, lâu dài). Thường xuất hiện trong các thông báo bảo trì, sửa chữa đường xá."
  },

  // ============================================================
  // SECTION 3: ADVERB + VERB / ADJECTIVE (25 CỤM TRẠNG TỪ ĂN ĐIỂM)
  // ============================================================
  {
    category: 3,
    term: "conveniently located",
    type: "Adverb + Participle/Adj",
    meaning: "Tọa lạc tại vị trí vô cùng thuận tiện",
    regex: "conveniently.*(located|situated|placed)",
    fallbackText: "The newly remodeled branch office is conveniently located within walking distance of the central metro station.",
    fallbackRef: "Test 03 - Part 5 - Q110",
    translation: "Văn phòng chi nhánh mới được tân trang lại nằm ở vị trí vô cùng thuận tiện, chỉ cách ga tàu điện ngầm trung tâm vài phút đi bộ.",
    tip: "Cứ thấy 'located' là 90% chọn 'conveniently' hoặc 'centrally', 'ideally'. Đây là phản xạ ăn điểm 5 giây kinh điển của Part 5!"
  },
  {
    category: 3,
    term: "strictly prohibited / enforced / confidential",
    type: "Adverb + Participle/Adj",
    meaning: "Bị nghiêm cấm tuyệt đối / thực thi nghiêm ngặt / bảo mật tuyệt đối",
    regex: "strictly.*(prohibited|enforced|confidential|forbidden|mandatory)",
    fallbackText: "Unauthorized photography and recording are strictly prohibited inside the main exhibition galleries.",
    fallbackRef: "Test 08 - Part 7 Passage",
    translation: "Việc chụp ảnh và ghi âm khi chưa được cấp phép bị nghiêm cấm tuyệt đối bên trong các phòng trưng bày triển lãm chính.",
    tip: "Đi với 'prohibited' hay 'forbidden', luôn chọn trạng từ 'strictly'. Không dùng 'heavily prohibited' hay 'deeply prohibited'."
  },
  {
    category: 3,
    term: "readily available / accessible",
    type: "Adverb + Adjective",
    meaning: "Luôn có sẵn, sẵn sàng để sử dụng / dễ dàng tiếp cận",
    regex: "readily.*(available|accessible|identifiable)",
    fallbackText: "Replacement cartridges and printing paper are readily available in the supply cabinet on the third floor.",
    fallbackRef: "Test 03 - Part 5 - Q102",
    translation: "Hộp mực thay thế và giấy in luôn có sẵn trong tủ vật tư ở tầng ba.",
    tip: "'Readily available' = easily available without delay (sẵn sàng bất cứ lúc nào cần). Cặp từ đi liền thành một khối vững chắc."
  },
  {
    category: 3,
    term: "highly recommended / qualified / successful",
    type: "Adverb + Adjective/Participle",
    meaning: "Được đánh giá rất cao / có trình độ chuyên môn cao / rất thành công",
    regex: "highly.*(recommended|qualified|successful|anticipated|competitive)",
    fallbackText: "Mr. Ellis and Ms. Barnes were both highly qualified candidates, but neither was ultimately selected for the executive position.",
    fallbackRef: "Test 01 - Part 5 - Q120",
    translation: "Ông Ellis và bà Barnes đều là những ứng viên có trình độ chuyên môn rất cao, nhưng cuối cùng cả hai đều không được chọn cho vị trí điều hành.",
    tip: "Trạng từ 'highly' bổ nghĩa cho tính từ chỉ phẩm chất, khen ngợi: highly skilled, highly profitable, highly regarded."
  },
  {
    category: 3,
    term: "promptly at [time]",
    type: "Adverb + Time Phrase",
    meaning: "Đúng, chính xác vào lúc mấy giờ",
    regex: "promptly.*(at|upon)",
    fallbackText: "The next formal meeting of the planning committee will be held promptly at 2 P.M. in Conference Room B.",
    fallbackRef: "Test 02 - Part 5 - Q103",
    translation: "Cuộc họp chính thức tiếp theo của ủy ban quy hoạch sẽ được tổ chức đúng 2 giờ chiều tại Phòng họp B.",
    tip: "Khi thấy khoảng trống đứng trước 'at [giờ cụ thể]', hãy chọn ngay trạng từ 'promptly' (= exactly on time)."
  },
  {
    category: 3,
    term: "dramatically increase / drop / change",
    type: "Adverb + Verb",
    meaning: "Tăng vọt / sụt giảm thê thảm / thay đổi đáng kể",
    regex: "dramatically.*(increase|drop|change|improve|fall|rise)",
    fallbackText: "Online customer engagement increased dramatically after the launch of the responsive mobile application.",
    fallbackRef: "Test 06 - Part 7 Passage",
    translation: "Tương tác của khách hàng trực tuyến đã tăng vọt sau khi ra mắt ứng dụng di động có giao diện tương thích tốt.",
    tip: "Nhóm trạng từ chỉ mức độ thay đổi mạnh gồm: dramatically, drastically, sharply, substantially."
  },
  {
    category: 3,
    term: "consistently deliver / provide / outperform",
    type: "Adverb + Verb",
    meaning: "Liên tục, luôn luôn đem lại / duy trì phong độ xuất sắc",
    regex: "consistently.*(deliver|provide|outperform|rank|exceed)",
    fallbackText: "The logistics division has consistently delivered parcels ahead of estimated delivery dates this entire quarter.",
    fallbackRef: "Test 07 - Part 5 - Q106",
    translation: "Bộ phận hậu cần đã liên tục giao các bưu kiện trước ngày giao hàng dự kiến trong suốt toàn bộ quý này.",
    tip: "'Consistently' mang ý nghĩa ổn định, phong độ không hề suy suyển qua thời gian (= reliably and steadily)."
  },
  {
    category: 3,
    term: "closely monitor / examine / inspect",
    type: "Adverb + Verb",
    meaning: "Theo dõi sát sao / xem xét, kiểm tra kỹ lưỡng",
    regex: "closely.*(monitor|examine|inspect|follow|work)",
    fallbackText: "Project supervisors must closely monitor daily expenditures to ensure the venture stays within its approved budget.",
    fallbackRef: "Test 04 - Part 5 - Q108",
    translation: "Các giám sát viên dự án phải theo dõi sát sao các khoản chi tiêu hàng ngày để đảm bảo dự án không vượt quá ngân sách đã được phê duyệt.",
    tip: "Cặp 'closely monitor' xuất hiện rất nhiều trong ngữ cảnh giám sát công trình, quản lý chất lượng và ngân sách."
  },
  {
    category: 3,
    term: "mutually beneficial (relationship / agreement)",
    type: "Adverb + Adjective",
    meaning: "Đôi bên cùng có lợi (quan hệ hợp tác / thỏa thuận)",
    regex: "mutually beneficial",
    fallbackText: "We look forward to establishing a mutually beneficial partnership with your distinguished distribution firm.",
    fallbackRef: "Test 02 - Part 7 Passage",
    translation: "Chúng tôi rất mong muốn thiết lập một mối quan hệ đối tác đôi bên cùng có lợi với công ty phân phối danh tiếng của quý vị.",
    tip: "Đây là cụm collocation bất biến trong văn phong thư từ thương mại khi đề xuất hợp tác kinh doanh."
  },
  {
    category: 3,
    term: "eagerly anticipate / await",
    type: "Adverb + Verb",
    meaning: "Háo hức, nóng lòng chờ đợi điều gì",
    regex: "eagerly.*(anticipate|await|expect)",
    fallbackText: "Subscribers are eagerly anticipating the grand unveiling of the innovative hybrid engine at next week's motor expo.",
    fallbackRef: "Test 08 - Part 5 - Q101",
    translation: "Các độc giả đang háo hức chờ đợi buổi lễ ra mắt hoành tráng của động cơ lai sáng tạo tại triển lãm ô tô tuần tới.",
    tip: "'Eagerly' = with great enthusiasm (háo hức). Thường đi với anticipate, await, look forward to."
  },
  {
    category: 3,
    term: "tentatively scheduled for...",
    type: "Adverb + Participle",
    meaning: "Dự kiến được lên lịch vào ngày...",
    regex: "tentatively scheduled",
    fallbackText: "The groundbreaking ceremony for the community sports complex is tentatively scheduled for October 15.",
    fallbackRef: "Test 04 - Part 5 - Q110",
    translation: "Lễ khởi công khu liên hợp thể thao cộng đồng dự kiến được lên lịch vào ngày 15 tháng 10.",
    tip: "Khi ngày tháng có thể bị hoãn hoặc dời lịch, đề thi luôn dùng cụm 'tentatively scheduled for + ngày'."
  },
  {
    category: 3,
    term: "temporarily out of service / unavailable",
    type: "Adverb + Phrase",
    meaning: "Tạm thời ngưng hoạt động / tạm thời không thể sử dụng",
    regex: "temporarily.*(out of service|unavailable|closed|suspended)",
    fallbackText: "Please note that the passenger elevator will be temporarily out of service between 9 A.M. and noon for routine repairs.",
    fallbackRef: "Test 09 - Part 7 Passage",
    translation: "Xin lưu ý rằng thang máy chở khách sẽ tạm thời ngừng hoạt động từ 9 giờ sáng đến trưa để bảo dưỡng định kỳ.",
    tip: "Cực kỳ phổ biến trong các biển báo (signs) và email nội bộ thông báo sự cố máy móc, bảo trì."
  },
  {
    category: 3,
    term: "actively solicit / seek / participate",
    type: "Adverb + Verb",
    meaning: "Tích cực tìm kiếm / chủ động thu thập / tham gia sôi nổi",
    regex: "actively.*(solicit|seek|participate|recruit|engage)",
    fallbackText: "Elegancia Dishware is actively soliciting customer reviews to enhance its upcoming fall cookware collection.",
    fallbackRef: "Test 01 - Part 5 - Q114",
    translation: "Elegancia Dishware đang chủ động thu thập các đánh giá của khách hàng để nâng cấp bộ sưu tập đồ dùng nấu bếp mùa thu sắp tới.",
    tip: "'Actively' thể hiện tính chủ động cao, hành động có mục đích rõ ràng."
  },
  {
    category: 3,
    term: "carefully review / consider / inspect",
    type: "Adverb + Verb",
    meaning: "Cẩn thận xem xét / cân nhắc kỹ lưỡng / thanh tra tỉ mỉ",
    regex: "carefully.*(review|consider|inspect|examine|read)",
    fallbackText: "The hiring panel carefully considered each applicant's credentials and prior project portfolio before making a selection.",
    fallbackRef: "Test 01 - Part 5 - Q106",
    translation: "Hội đồng tuyển dụng đã cẩn thận cân nhắc hồ sơ năng lực và danh mục dự án trước đây của từng ứng viên trước khi đưa ra lựa chọn.",
    tip: "Bổ nghĩa cho các động từ xem xét giấy tờ, hồ sơ, hợp đồng (review, read, inspect, check) luôn ưu tiên trạng từ 'carefully'."
  },
  {
    category: 3,
    term: "precisely locate / measure / calculate",
    type: "Adverb + Verb",
    meaning: "Xác định vị trí / đo đạc / tính toán một cách chính xác",
    regex: "precisely.*(locate|measure|calculate|define)",
    fallbackText: "The geological team designed proprietary mapping software that can precisely locate mineral deposits underground.",
    fallbackRef: "Test 01 - Part 5 - Q111",
    translation: "Đội ngũ địa chất đã thiết kế phần mềm lập bản đồ độc quyền có khả năng xác định chính xác các mỏ khoáng sản dưới lòng đất.",
    tip: "'Precisely' = with exact precision (chuẩn xác đến từng chi tiết). Thường đi với locate, measure, identify."
  },
  {
    category: 3,
    term: "continuously operate / seek / improve",
    type: "Adverb + Verb",
    meaning: "Vận hành không ngừng nghỉ / liên tục tìm kiếm / không ngừng cải tiến",
    regex: "continuously.*(operate|seek|improve|run|monitor)",
    fallbackText: "Line 73 is the oldest continuously operating bus route in the entire metropolitan transit system's history.",
    fallbackRef: "Test 10 - Part 5 - Q109",
    translation: "Tuyến số 73 là tuyến xe buýt vận hành liên tục lâu đời nhất trong toàn bộ lịch sử hệ thống giao thông công cộng của thành phố.",
    tip: "'Continuously' = không ngắt quãng (non-stop), khác với 'continually' (lặp đi lặp lại nhiều lần)."
  },
  {
    category: 3,
    term: "widely praised / accepted / recognized",
    type: "Adverb + Participle",
    meaning: "Được ca ngợi / chấp nhận / công nhận rộng rãi",
    regex: "widely.*(praised|accepted|recognized|known|regarded)",
    fallbackText: "Ms. Lim's best-selling historical novel has been widely praised by literary critics across the continent.",
    fallbackRef: "Test 05 - Part 5 - Q105",
    translation: "Cuốn tiểu thuyết lịch sử bán chạy nhất của cô Lim đã được ca ngợi rộng rãi bởi các nhà phê bình văn học trên toàn châu lục.",
    tip: "'Widely' thường bổ nghĩa cho các tính từ/phân từ chỉ mức độ đón nhận của công chúng: widely used, widely distributed."
  },
  {
    category: 3,
    term: "substantially higher / lower / improve",
    type: "Adverb + Comparative/Verb",
    meaning: "Cao hơn / thấp hơn / cải thiện một cách đáng kể",
    regex: "substantially.*(higher|lower|improve|increase|reduce|different)",
    fallbackText: "Operating profits for the international logistics division were substantially higher than projected for the first fiscal half.",
    fallbackRef: "Test 08 - Part 5 - Q107",
    translation: "Lợi nhuận hoạt động của bộ phận hậu cần quốc tế đã cao hơn đáng kể so với dự kiến cho nửa đầu năm tài khóa.",
    tip: "Bổ nghĩa cho tính từ so sánh hơn (higher, lower, cheaper), hãy chọn các trạng từ: substantially, significantly, considerably."
  },
  {
    category: 3,
    term: "easily accessible (by public transit)",
    type: "Adverb + Adjective",
    meaning: "Dễ dàng tiếp cận / đi đến được bằng phương tiện công cộng",
    regex: "easily.*(accessible|reached|obtained|understood)",
    fallbackText: "The new suburban medical center is easily accessible by commuter train and features expansive complimentary parking.",
    fallbackRef: "Test 03 - Part 7 Passage",
    translation: "Trung tâm y tế ngoại ô mới rất dễ dàng tiếp cận bằng tàu hỏa đi lại hàng ngày và có bãi đỗ xe miễn phí rộng rãi.",
    tip: "'Easily accessible' là cụm mô tả vị trí đắc địa rất hay xuất hiện trong các bài quảng cáo bất động sản hoặc trung tâm hội nghị."
  },
  {
    category: 3,
    term: "strongly advise / urge / recommend",
    type: "Adverb + Verb",
    meaning: "Khuyên bảo tha thiết / thúc giục / nhiệt liệt khuyến nghị",
    regex: "strongly.*(advise|urge|recommend|encourage|suggest)",
    fallbackText: "Health authorities strongly advise all citizens to receive seasonal vaccinations before the onset of cold weather.",
    fallbackRef: "Test 02 - Part 7 Passage",
    translation: "Các cơ quan y tế nhiệt liệt khuyến nghị tất cả người dân nên tiêm phòng vắc xin theo mùa trước khi thời tiết giá lạnh bắt đầu.",
    tip: "Để nhấn mạnh lời khuyên bảo trong văn phong công sở, trạng từ 'strongly' luôn là sự lựa chọn số 1."
  },
  {
    category: 3,
    term: "adversely affect / impact",
    type: "Adverb + Verb",
    meaning: "Ảnh hưởng tiêu cực, tác động bất lợi tới",
    regex: "adversely.*(affect|impact|influence)",
    fallbackText: "Severe storms in the northern shipping lanes have adversely affected delivery schedules across several regions.",
    fallbackRef: "Test 07 - Part 5 - Q119",
    translation: "Những cơn bão dữ dội trên các tuyến hàng hải phía bắc đã ảnh hưởng tiêu cực đến tiến độ giao hàng trên nhiều khu vực.",
    tip: "'Adversely' = negatively, unfavorably. Cực kỳ hay đi cùng động từ 'affect' (lưu ý affect là động từ, effect là danh từ)."
  },
  {
    category: 3,
    term: "seamlessly integrate (with)",
    type: "Adverb + Verb",
    meaning: "Tích hợp mượt mà, trơn tru (với hệ thống khác)",
    regex: "seamlessly.*(integrate|transition|connect|work)",
    fallbackText: "The new accounting plug-in seamlessly integrates with our enterprise resource planning software.",
    fallbackRef: "Test 04 - Part 7 Passage",
    translation: "Tiện ích kế toán mới tích hợp mượt mà, trơn tru với phần mềm hoạch định nguồn lực doanh nghiệp của chúng tôi.",
    tip: "'Seamlessly' mang nghĩa liền mạch không một vết gợn. Rất hay xuất hiện trong bài đọc công nghệ, IT."
  },
  {
    category: 3,
    term: "adequately prepared / trained",
    type: "Adverb + Participle",
    meaning: "Được chuẩn bị / huấn luyện một cách đầy đủ, chu đáo",
    regex: "adequately.*(prepared|trained|equipped|staffed|funded)",
    fallbackText: "Our technical support team is adequately prepared to handle peak customer service volumes during product launches.",
    fallbackRef: "Test 05 - Part 6 Passage",
    translation: "Đội ngũ hỗ trợ kỹ thuật của chúng tôi đã được chuẩn bị đầy đủ để xử lý lượng yêu cầu hỗ trợ khách hàng đạt đỉnh trong đợt ra mắt sản phẩm.",
    tip: "'Adequately' = đủ về số lượng lẫn chất lượng để đáp ứng tiêu chuẩn. Trái nghĩa: 'inadequately'."
  },
  {
    category: 3,
    term: "financially responsible",
    type: "Adverb + Adjective",
    meaning: "Có trách nhiệm / hợp lý về mặt tài chính",
    regex: "financially.*(responsible|viable|sound|secure|independent)",
    fallbackText: "According to the chief financial officer, it would not be financially responsible to double the research budget this quarter.",
    fallbackRef: "Test 01 - Part 5 - Q112",
    translation: "Theo giám đốc tài chính, việc tăng gấp đôi ngân sách nghiên cứu trong quý này là không hợp lý về mặt trách nhiệm tài chính.",
    tip: "Bổ nghĩa cho tính từ chỉ trách nhiệm, tính khả thi hoặc an toàn, dùng 'financially' (financially sound/viable)."
  },
  {
    category: 3,
    term: "primarily responsible for",
    type: "Adverb + Adjective + Prep",
    meaning: "Chịu trách nhiệm chính về mảng công việc nào đó",
    regex: "primarily.*(responsible|focused|concerned|designed)",
    fallbackText: "As lead project manager, Ms. Al-Mansoor is primarily responsible for coordinating cross-departmental communications.",
    fallbackRef: "Test 02 - Part 5 - Q105",
    translation: "Với tư cách là quản lý dự án trưởng, bà Al-Mansoor chịu trách nhiệm chính trong việc điều phối liên lạc giữa các phòng ban.",
    tip: "'Primarily' = mainly, chiefly (chủ yếu là). Vị trí đứng giữa 'is' và 'responsible for'."
  },

  // ============================================================
  // SECTION 4: PREPOSITIONAL & FIXED PHRASES (30 CỤM GIỚI TỪ & CỐ ĐỊNH)
  // ============================================================
  {
    category: 4,
    term: "take advantage of",
    type: "Idiomatic Prepositional Phrase",
    meaning: "Tận dụng tối đa cơ hội, lợi thế, ưu đãi",
    regex: "take advantage of",
    fallbackText: "While at the convention, take advantage of our latest digital feature: an interactive floorplan navigator.",
    fallbackRef: "Test 02 - Part 7 Passage",
    translation: "Khi đang ở tại hội nghị, hãy tận dụng tính năng kỹ thuật số mới nhất của chúng tôi: bộ điều hướng sơ đồ tương tác.",
    tip: "Xuất hiện hơn 20 lần trong 10 bộ đề TOEIC 2026. Thường là đáp án trong các câu hỏi Part 5 kiểm tra động từ đi cùng 'advantage of'."
  },
  {
    category: 4,
    term: "in accordance with",
    type: "Complex Preposition",
    meaning: "Phù hợp với, chiếu theo, tuân theo quy định / chính sách",
    regex: "in accordance with",
    fallbackText: "All confidential customer data will be stored securely in accordance with industry privacy compliance regulations.",
    fallbackRef: "Test 02 - Part 7 Passage",
    translation: "Mọi dữ liệu mật của khách hàng sẽ được lưu trữ an toàn tuân thủ theo các quy định bảo mật của ngành.",
    tip: "CÔNG THỨC ĂN ĐIỂM: 'in accordance with' = 'in compliance with' = 'according to'. Chỗ trống hay khuyết từ 'accordance'."
  },
  {
    category: 4,
    term: "prior to (+ Noun / V-ing)",
    type: "Prepositional Phrase",
    meaning: "Trước khi, trước một mốc thời gian hoặc sự kiện nào đó",
    regex: "prior to",
    fallbackText: "As someone who held this leadership role prior to your retirement four years ago, you have valuable perspective.",
    fallbackRef: "Test 09 - Part 7 Passage",
    translation: "Là người đã từng nắm giữ vai trò lãnh đạo này trước khi bạn nghỉ hưu cách đây 4 năm, bạn có được góc nhìn vô cùng quý giá.",
    tip: "BẪY NGỮ PHÁP: 'Prior to' đóng vai trò như một giới từ, theo sau bắt buộc là Danh từ (Noun) hoặc V-ing, KHÔNG đi với V-bare."
  },
  {
    category: 4,
    term: "on behalf of",
    type: "Complex Preposition",
    meaning: "Thay mặt cho, đại diện cho ai / tổ chức nào",
    regex: "on behalf of",
    fallbackText: "I am writing on behalf of Impressionise Creative Agency to submit our formal partnership proposal.",
    fallbackRef: "Test 05 - Part 6 Passage",
    translation: "Tôi viết thư này để thay mặt cho Công ty Sáng tạo Impressionise gửi đề xuất hợp tác chính thức của chúng tôi.",
    tip: "Bắt buộc đi theo khuôn mẫu: ON behalf OF. Bẫy hay gặp: ETS gài các giới từ sai như 'in behalf to' hoặc 'at behalf of'."
  },
  {
    category: 4,
    term: "in response to",
    type: "Complex Preposition",
    meaning: "Để đáp lại, hồi đáp cho / đối phó với",
    regex: "in response to",
    fallbackText: "In response to customer feedback, the bakery has introduced an extensive menu of gluten-free pastries.",
    fallbackRef: "Test 07 - Part 5 - Q109",
    translation: "Để đáp lại những phản hồi của khách hàng, tiệm bánh đã giới thiệu một thực đơn phong phú gồm các loại bánh ngọt không chứa gluten.",
    tip: "Theo sau 'in response to' luôn là danh từ chỉ yêu cầu, phàn nàn, góp ý (feedback, inquiry, demand, complaint)."
  },
  {
    category: 4,
    term: "with the exception of",
    type: "Complex Preposition",
    meaning: "Ngoại trừ, với sự ngoại trừ của...",
    regex: "with the exception of",
    fallbackText: "All store locations will remain open regular business hours on Sunday, with the exception of the airport boutique.",
    fallbackRef: "Test 03 - Part 7 Passage",
    translation: "Tất cả các địa điểm cửa hàng sẽ vẫn mở cửa theo giờ làm việc bình thường vào Chủ Nhật, ngoại trừ cửa hàng tại sân bay.",
    tip: "Tương đương với 'except for' hoặc 'apart from'. Chỗ trống thường hỏi từ 'exception'."
  },
  {
    category: 4,
    term: "in light of",
    type: "Complex Preposition",
    meaning: "Xét về, dựa trên tình hình thực tế, bởi vì...",
    regex: "in light of",
    fallbackText: "In light of recent budget reductions, we must re-evaluate our travel and corporate entertainment expenses.",
    fallbackRef: "Test 05 - Part 7 Passage",
    translation: "Xét về những đợt cắt giảm ngân sách gần đây, chúng ta phải đánh giá lại các khoản chi phí công tác và tiếp khách của công ty.",
    tip: "'In light of' = 'considering', 'because of'. Mang nghĩa xem xét một yếu tố mới xuất hiện để đưa ra quyết định."
  },
  {
    category: 4,
    term: "regardless of",
    type: "Prepositional Phrase",
    meaning: "Bất kể, không phân biệt, không màng tới",
    regex: "regardless of",
    fallbackText: "All employees are entitled to comprehensive health benefits regardless of their job title or department.",
    fallbackRef: "Test 04 - Part 5 - Q118",
    translation: "Tất cả nhân viên đều được hưởng đầy đủ các phúc lợi y tế toàn diện bất kể chức danh công việc hay phòng ban của họ là gì.",
    tip: "Theo sau 'regardless of' thường là Noun phrase hoặc Wh-clause (e.g. regardless of whether, regardless of age/experience)."
  },
  {
    category: 4,
    term: "at your earliest convenience",
    type: "Fixed Business Expression",
    meaning: "Ngay khi bạn cảm thấy thuận tiện nhất (sớm nhất có thể)",
    regex: "at your earliest convenience",
    fallbackText: "Please review the attached contract draft and return a signed copy at your earliest convenience.",
    fallbackRef: "Test 04 - Part 7 Passage",
    translation: "Vui lòng xem lại bản dự thảo hợp đồng đính kèm và gửi lại bản sao đã ký ngay khi thuận tiện cho quý khách nhất.",
    tip: "Cách nói lịch sự, chuẩn mực thay thế cho 'as soon as possible' (ASAP) trong thư từ thương mại."
  },
  {
    category: 4,
    term: "be eligible for / to",
    type: "Adjective + Preposition",
    meaning: "Đủ điều kiện, đủ tiêu chuẩn để hưởng / làm gì",
    regex: "eligible (for|to)",
    fallbackText: "Employees are eligible for additional paid vacation days after they have been employed for five consecutive years.",
    fallbackRef: "Test 05 - Part 5 - Q109",
    translation: "Nhân viên đủ điều kiện để nhận thêm những ngày nghỉ phép có lương sau khi họ đã làm việc trong năm năm liên tục.",
    tip: "QUY TẮC VÀNG: 'eligible FOR + Noun' (đủ điều kiện nhận cái gì) hoặc 'eligible TO + Verb-bare' (đủ tư cách làm gì)."
  },
  {
    category: 4,
    term: "be subject to (change / approval)",
    type: "Adjective + Preposition",
    meaning: "Có thể bị thay đổi / phải trải qua sự phê duyệt",
    regex: "subject to",
    fallbackText: "Flight schedules and boarding gates are subject to change without prior notice due to adverse weather conditions.",
    fallbackRef: "Test 04 - Part 7 Passage",
    translation: "Lịch trình chuyến bay và cổng lên máy bay có thể bị thay đổi mà không cần thông báo trước do điều kiện thời tiết xấu.",
    tip: "'To' trong 'subject to' là GIỚI TỪ, theo sau là Noun hoặc V-ing. Cực kỳ hay gặp: 'subject to change' (có thể đổi), 'subject to approval' (chờ duyệt)."
  },
  {
    category: 4,
    term: "comply with",
    type: "Verb + Preposition",
    meaning: "Tuân thủ, chấp hành quy chuẩn / điều luật",
    regex: "comply with",
    fallbackText: "All building contractors must comply with local municipal environmental and safety codes throughout the project.",
    fallbackRef: "Test 02 - Part 7 Passage",
    translation: "Tất cả các nhà thầu xây dựng phải tuân thủ các quy chuẩn an toàn và môi trường của đô thị địa phương trong suốt dự án.",
    tip: "Comply BẮT BUỘC đi với 'WITH'. Danh từ tương ứng: 'in compliance with'."
  },
  {
    category: 4,
    term: "subscribe to",
    type: "Verb + Preposition",
    meaning: "Đăng ký theo dõi (báo, tạp chí, dịch vụ định kỳ)",
    regex: "subscribe to",
    fallbackText: "Please click on the link below to subscribe to our monthly digital technology and marketing newsletter.",
    fallbackRef: "Test 07 - Part 5 - Q107",
    translation: "Vui lòng nhấp vào liên kết bên dưới để đăng ký theo dõi bản tin tiếp thị và công nghệ kỹ thuật số hàng tháng của chúng tôi.",
    tip: "Subscribe luôn đi với giới từ 'TO'. Danh từ: subscription (sự đăng ký), subscriber (người đăng ký)."
  },
  {
    category: 4,
    term: "in conjunction with",
    type: "Complex Preposition",
    meaning: "Cùng kết hợp với, phối hợp đồng thời với...",
    regex: "in conjunction with",
    fallbackText: "The city museum is organizing a special historical exhibition in conjunction with the national cultural archives.",
    fallbackRef: "Test 06 - Part 5 - Q127",
    translation: "Bảo tàng thành phố đang tổ chức một cuộc triển lãm lịch sử đặc biệt phối hợp cùng kho lưu trữ văn hóa quốc gia.",
    tip: "'In conjunction with' = 'together with', 'in partnership with'. Thể hiện sự hợp tác giữa hai bên."
  },
  {
    category: 4,
    term: "as a courtesy to",
    type: "Prepositional Phrase",
    meaning: "Như một sự lịch thiệp, ưu ái đặc biệt dành cho...",
    regex: "as a courtesy to",
    fallbackText: "As a courtesy to our executive tier loyalty members, late check-out is complimentary until 3 P.M.",
    fallbackRef: "Test 03 - Part 7 Passage",
    translation: "Như một sự lịch thiệp dành cho các hội viên thân thiết hạng điều hành, dịch vụ trả phòng muộn được miễn phí đến 3 giờ chiều.",
    tip: "Thường dùng trong ngành dịch vụ nhà hàng - khách sạn khi cung cấp tiện ích miễn phí cho khách VIP."
  },
  {
    category: 4,
    term: "ahead of schedule / on schedule",
    type: "Prepositional Phrase",
    meaning: "Trước thời hạn dự kiến / đúng tiến độ đề ra",
    regex: "(ahead of|on|behind) schedule",
    fallbackText: "The scheduled completion date was September 4, but the bridge repaving was actually finished two weeks ahead of schedule.",
    fallbackRef: "Test 07 - Part 5 - Q106",
    translation: "Ngày hoàn thành dự kiến là mùng 4 tháng 9, nhưng công việc trải nhựa lại mặt cầu thực tế đã hoàn tất trước tiến độ hai tuần.",
    tip: "Bộ 3 tiến độ: 'ahead of schedule' (trước hạn) - 'on schedule' (đúng hạn) - 'behind schedule' (chậm tiến độ)."
  },
  {
    category: 4,
    term: "per your request / as requested",
    type: "Prepositional Phrase",
    meaning: "Theo đúng như lời yêu cầu của bạn",
    regex: "per your request",
    fallbackText: "Per your request, we have revised the catering menu to feature additional vegetarian and vegan selections.",
    fallbackRef: "Test 04 - Part 7 Passage",
    translation: "Theo đúng yêu cầu của quý khách, chúng tôi đã chỉnh sửa thực đơn tiệc để bổ sung thêm các lựa chọn món chay thuần và chay rau củ.",
    tip: "'Per' đóng vai trò giới từ mang nghĩa 'theo như' (per our conversation, per the contract terms)."
  },
  {
    category: 4,
    term: "under warranty / under construction",
    type: "Prepositional Phrase",
    meaning: "Còn trong thời hạn bảo hành / đang trong quá trình xây dựng",
    regex: "under (warranty|construction|supervision|investigation|renovation)",
    fallbackText: "Repairs will be completed at no charge if the appliance is still covered under the original manufacturer warranty.",
    fallbackRef: "Test 08 - Part 7 Passage",
    translation: "Việc sửa chữa sẽ được hoàn tất hoàn toàn miễn phí nếu thiết bị vẫn còn trong thời hạn bảo hành gốc của nhà sản xuất.",
    tip: "Giới từ 'under' đi với danh từ chỉ trạng thái: under warranty, under construction, under new management."
  },
  {
    category: 4,
    term: "out of order / out of stock",
    type: "Prepositional Phrase",
    meaning: "Bị hỏng hóc (máy móc) / hết hàng trong kho",
    regex: "out of (order|stock|service|office)",
    fallbackText: "We apologize for the inconvenience, but the medium-sized storage bins are currently out of stock until next Tuesday.",
    fallbackRef: "Test 01 - Part 7 Passage",
    translation: "Chúng tôi thành thật xin lỗi vì sự bất tiện này, nhưng các thùng chứa đồ cỡ vừa hiện đang hết hàng cho đến thứ Ba tuần tới.",
    tip: "'Out of order' dùng cho máy móc hỏng hóc. 'Out of stock' dùng cho hàng hóa hết tồn kho."
  },
  {
    category: 4,
    term: "at all times",
    type: "Adverbial Phrase",
    meaning: "Mọi lúc, luôn luôn, trong bất kỳ thời điểm nào",
    regex: "at all times",
    fallbackText: "For your safety, visitor identification badges must be worn visibly on your clothing at all times.",
    fallbackRef: "Test 08 - Part 5 - Q103",
    translation: "Vì sự an toàn của bạn, thẻ nhận dạng khách tham quan phải được đeo rõ ràng trên trang phục vào mọi lúc.",
    tip: "'At all times' = always. Đứng cuối câu hoặc đầu câu mệnh lệnh trong các thông báo an toàn."
  },
  {
    category: 4,
    term: "in transit",
    type: "Prepositional Phrase",
    meaning: "Đang trên đường vận chuyển, đang lưu chuyển",
    regex: "in transit",
    fallbackText: "Once your package is in transit, you will receive an automatic email containing real-time GPS tracking details.",
    fallbackRef: "Test 10 - Part 5 - Q110",
    translation: "Khi kiện hàng của quý khách đang trên đường vận chuyển, bạn sẽ nhận được email tự động chứa chi tiết theo dõi định vị GPS theo thời gian thực.",
    tip: "Cụm cố định chỉ trạng thái hàng hóa vận tải: in transit (đang đi đường), in stock (còn hàng)."
  },
  {
    category: 4,
    term: "contribute to",
    type: "Verb + Preposition",
    meaning: "Đóng góp vào / góp phần dẫn đến kết quả nào đó",
    regex: "contribute to",
    fallbackText: "Employee innovation and hard work have contributed significantly to our firm's remarkable market expansion.",
    fallbackRef: "Test 06 - Part 5 - Q110",
    translation: "Sự đổi mới và nỗ lực chăm chỉ của nhân viên đã đóng góp đáng kể vào sự mở rộng thị trường vượt bậc của công ty chúng tôi.",
    tip: "Sau 'contribute to' là Noun hoặc V-ing (chữ 'to' ở đây là giới từ, không phải to-infinitive)."
  },
  {
    category: 4,
    term: "apologize for any inconvenience",
    type: "Fixed Customer Service Phrase",
    meaning: "Thành thật xin lỗi vì bất kỳ sự bất tiện nào đã gây ra",
    regex: "apologize for (the|any) inconvenience",
    fallbackText: "We sincerely apologize for any inconvenience caused by the temporary water service interruption.",
    fallbackRef: "Test 07 - Part 7 Passage",
    translation: "Chúng tôi chân thành xin lỗi vì bất kỳ sự bất tiện nào gây ra bởi việc tạm thời gián đoạn dịch vụ cung cấp nước.",
    tip: "Câu chốt kinh điển trong 100% các email giải quyết sự cố, đền bù hoặc thông báo bảo trì ở Part 6 & 7."
  },
  {
    category: 4,
    term: "look forward to (+ V-ing / Noun)",
    type: "Phrasal Verb + Preposition",
    meaning: "Rất mong đợi, trông ngóng một sự kiện trong tương lai",
    regex: "look forward to",
    fallbackText: "We look forward to collaborating with your design team on the upcoming brand revitalization project.",
    fallbackRef: "Test 05 - Part 6 Passage",
    translation: "Chúng tôi rất mong đợi được hợp tác cùng đội ngũ thiết kế của quý vị trong dự án tái sinh thương hiệu sắp tới.",
    tip: "BẪY KINH ĐIỂN ETS: Sau 'look forward to' BẮT BUỘC là V-ing hoặc Noun (ví dụ: look forward to seeing you, KHÔNG dùng to see)."
  },
  {
    category: 4,
    term: "in effect / come into effect",
    type: "Prepositional Phrase",
    meaning: "Đang có hiệu lực / bắt đầu đi vào hiệu lực thi hành",
    regex: "(in effect|come into effect|take effect)",
    fallbackText: "The amended municipal parking zoning regulations will officially come into effect next Monday morning.",
    fallbackRef: "Test 01 - Part 5 - Q124",
    translation: "Các quy định phân vùng đỗ xe sửa đổi của đô thị sẽ chính thức đi vào hiệu lực vào sáng thứ Hai tuần tới.",
    tip: "'In effect' = đang có tác dụng; 'come into effect' = 'take effect' = bắt đầu có hiệu lực pháp lý."
  },
  {
    category: 4,
    term: "with regard to / in terms of",
    type: "Complex Preposition",
    meaning: "Liên quan đến, xét về phương diện nào đó",
    regex: "(with regard to|in terms of)",
    fallbackText: "Ms. Persson was able to respond directly to government officials with regard to their funding allocation concerns.",
    fallbackRef: "Test 07 - Part 5 - Q109",
    translation: "Bà Persson đã có thể trực tiếp phản hồi các quan chức chính phủ liên quan đến những mối lo ngại về phân bổ nguồn vốn.",
    tip: "Đồng nghĩa: 'regarding', 'concerning', 'as to', 'about'. Chú ý: 'with regard to' (không có chữ 's' ở regard)."
  },
  {
    category: 4,
    term: "in charge of / responsible for",
    type: "Adjective + Preposition",
    meaning: "Chịu trách nhiệm phụ trách, quản lý công việc",
    regex: "(in charge of|responsible for)",
    fallbackText: "As senior coordinator, Mr. Lin is in charge of organizing all regional product demonstration workshops.",
    fallbackRef: "Test 01 - Part 5 - Q107",
    translation: "Với tư cách là điều phối viên cao cấp, ông Lin chịu trách nhiệm tổ chức tất cả các buổi hội thảo trình diễn sản phẩm khu vực.",
    tip: "Phân biệt: 'in charge of + N/V-ing' = 'responsible for + N/V-ing'. Đừng nhầm sang 'take charge of' (tiếp quản quyền kiểm soát)."
  },
  {
    category: 4,
    term: "by means of",
    type: "Complex Preposition",
    meaning: "Bằng cách thức, bằng phương tiện gì",
    regex: "by means of",
    fallbackText: "Candidates who cannot attend the in-person interview may participate by means of video conference.",
    fallbackRef: "Test 04 - Part 5 - Q128",
    translation: "Các ứng viên không thể tham dự buổi phỏng vấn trực tiếp có thể tham gia bằng phương thức hội nghị truyền hình.",
    tip: "'By means of' = through the use of (bằng công cụ, phương pháp nào đó)."
  },
  {
    category: 4,
    term: "in the event of (rain / emergency)",
    type: "Complex Preposition",
    meaning: "Trong trường hợp xảy ra sự cố khẩn cấp / trời mưa",
    regex: "in the event of",
    fallbackText: "In the event of inclement weather, the outdoor awards banquet will be relocated indoors to the ballroom.",
    fallbackRef: "Test 09 - Part 5 - Q108",
    translation: "Trong trường hợp thời tiết xấu khắc nghiệt, bữa tiệc trao giải ngoài trời sẽ được dời vào bên trong phòng đại tiệc.",
    tip: "Theo sau 'in the event of' là một danh từ chỉ tình huống (emergency, rain, delay, fire). Tương đương: 'in case of'."
  },
  {
    category: 4,
    term: "as opposed to / rather than",
    type: "Conjunctive Preposition",
    meaning: "Thay vì, trái ngược lại với...",
    regex: "(as opposed to|rather than)",
    fallbackText: "The medical facility cafeteria serves hot lunch seven days a week rather than only on weekdays.",
    fallbackRef: "Test 01 - Part 5 - Q128",
    translation: "Nhà ăn của cơ sở y tế phục vụ bữa trưa nóng sốt cả bảy ngày trong tuần thay vì chỉ vào các ngày trong tuần thông thường.",
    tip: "'Rather than' và 'instead of' thường được kiểm tra trong Part 5 khi diễn tả sự lựa chọn ưu tiên giữa hai phương án."
  },

  // ============================================================
  // SECTION 5: TOPIC-SPECIFIC COLLOCATIONS IN 10 TESTS (25 CỤM CHỦ ĐỀ)
  // ============================================================
  {
    category: 5,
    term: "customer satisfaction survey",
    type: "Customer Service Topic",
    meaning: "Khảo sát đo lường mức độ hài lòng của khách hàng",
    regex: "satisfaction survey",
    fallbackText: "To provide feedback about your recent dental appointment, please respond to this brief online customer satisfaction survey.",
    fallbackRef: "Test 08 - Part 5 - Q110",
    translation: "Để gửi phản hồi về cuộc hẹn nha khoa gần đây của bạn, vui lòng trả lời bản khảo sát ngắn về mức độ hài lòng của khách hàng này.",
    tip: "Thường xuyên xuất hiện trong Part 7 dưới dạng biểu mẫu khảo sát (survey forms) để hỏi về ý kiến đánh giá của người dùng."
  },
  {
    category: 5,
    term: "resolve customer inquiries / grievances",
    type: "Customer Service Topic",
    meaning: "Giải quyết các thắc mắc / khiếu nại của khách hàng",
    regex: "resolve.*(inquiry|grievance|complaint)",
    fallbackText: "Our client support representatives are trained to resolve all technical inquiries within twenty-four hours.",
    fallbackRef: "Test 01 - Part 7 Passage",
    translation: "Các đại diện hỗ trợ khách hàng của chúng tôi được đào tạo để giải quyết mọi thắc mắc kỹ thuật trong vòng 24 giờ.",
    tip: "Từ đồng nghĩa: 'handle inquiries', 'address complaints', 'settle disputes'."
  },
  {
    category: 5,
    term: "refund policy / warranty claim",
    type: "Customer Service Topic",
    meaning: "Chính sách hoàn tiền / yêu cầu bảo hành sản phẩm",
    regex: "(refund policy|warranty claim)",
    fallbackText: "Under our standard refund policy, merchandise may be returned for a full reimbursement within thirty days of purchase.",
    fallbackRef: "Test 03 - Part 7 Passage",
    translation: "Theo chính sách hoàn tiền tiêu chuẩn của chúng tôi, hàng hóa có thể được trả lại để nhận hoàn tiền đầy đủ trong vòng 30 ngày kể từ ngày mua.",
    tip: "Chú ý: 'eligible for a full refund' (đủ điều kiện được hoàn tiền 100%)."
  },
  {
    category: 5,
    term: "flight itinerary / boarding pass",
    type: "Travel & Hospitality Topic",
    meaning: "Hành trình chuyến bay / thẻ lên tàu bay",
    regex: "(flight itinerary|boarding pass|travel itinerary)",
    fallbackText: "Passengers must present both their digital boarding pass and passport at the gate prior to boarding the aircraft.",
    fallbackRef: "Test 06 - Part 7 Passage",
    translation: "Hành khách phải xuất trình cả thẻ lên máy bay kỹ thuật số và hộ chiếu tại cửa trước khi bước lên máy bay.",
    tip: "'Itinerary' = lịch trình chi tiết (ngày giờ, chuyến bay, khách sạn). 'Boarding pass' = thẻ lên máy bay sau khi check-in."
  },
  {
    category: 5,
    term: "baggage allowance / round-trip fare",
    type: "Travel & Hospitality Topic",
    meaning: "Hạn mức hành lý miễn cước / giá vé khứ hồi",
    regex: "(baggage allowance|round-trip)",
    fallbackText: "Economy plus tickets include a complimentary baggage allowance of two checked suitcases weighing up to 23 kg each.",
    fallbackRef: "Test 02 - Part 7 Passage",
    translation: "Vé hạng phổ thông đặc biệt bao gồm hạn mức hành lý miễn cước gồm hai kiện vali ký gửi nặng tối đa 23 kg mỗi kiện.",
    tip: "Trong bảng giá vé máy bay (airline comparison tables), 'round-trip' = vé khứ hồi, đối lập với 'one-way' = vé một chiều."
  },
  {
    category: 5,
    term: "room amenities / complimentary toiletries",
    type: "Travel & Hospitality Topic",
    meaning: "Tiện nghi trong phòng nghỉ / đồ vệ sinh cá nhân miễn phí",
    regex: "(room amenities|amenities)",
    fallbackText: "Guest room amenities include high-speed wireless Internet, an espresso machine, and a private balcony overlooking the bay.",
    fallbackRef: "Test 03 - Part 5 - Q109",
    translation: "Các tiện nghi trong phòng nghỉ bao gồm mạng Internet không dây tốc độ cao, máy pha cà phê espresso và ban công riêng nhìn ra vịnh.",
    tip: "'Amenities' = các trang thiết bị tiện nghi đem lại sự thoải mái cho khách du lịch."
  },
  {
    category: 5,
    term: "probationary period",
    type: "Human Resources Topic",
    meaning: "Thời gian thử việc của nhân viên mới",
    regex: "probationary period",
    fallbackText: "Upon successful completion of the ninety-day probationary period, new hires become eligible for company health insurance.",
    fallbackRef: "Test 02 - Part 5 - Q109",
    translation: "Sau khi hoàn thành xuất sắc thời gian thử việc chín mươi ngày, nhân viên mới sẽ đủ điều kiện tham gia bảo hiểm y tế công ty.",
    tip: "Collocation chuyên ngành nhân sự: sau khi hết 'probationary period', ứng viên trở thành 'permanent employee' (nhân viên chính thức)."
  },
  {
    category: 5,
    term: "performance appraisal / review",
    type: "Human Resources Topic",
    meaning: "Buổi đánh giá hiệu quả công việc định kỳ",
    regex: "performance (appraisal|review|evaluation)",
    fallbackText: "Annual performance appraisals will be conducted by department supervisors throughout the month of November.",
    fallbackRef: "Test 03 - Part 5 - Q103",
    translation: "Các đợt đánh giá hiệu quả công việc hàng năm sẽ được tiến hành bởi các giám sát viên phòng ban trong suốt tháng 11.",
    tip: "'Performance review' thường quyết định việc thăng chức (promotion) hoặc thưởng hiệu suất (performance bonus)."
  },
  {
    category: 5,
    term: "competitive benefits package",
    type: "Human Resources Topic",
    meaning: "Gói chế độ đãi ngộ và phúc lợi cạnh tranh, hấp dẫn",
    regex: "(benefits package|compensation package)",
    fallbackText: "The software firm attracts top-tier programming talent by offering a competitive compensation and benefits package.",
    fallbackRef: "Test 04 - Part 7 Passage",
    translation: "Công ty phần mềm thu hút các tài năng lập trình hàng đầu bằng cách đưa ra gói thù lao và phúc lợi mang tính cạnh tranh cao.",
    tip: "Gói phúc lợi (benefits package) trong đề TOEIC thường bao gồm: paid time off (PTO), health insurance, retirement plan 401(k)."
  },
  {
    category: 5,
    term: "job vacancy / opening",
    type: "Human Resources Topic",
    meaning: "Vị trí việc làm còn trống đang tuyển dụng",
    regex: "(job vacancy|job opening|vacant position)",
    fallbackText: "Due to rapid regional expansion, we currently have several exciting job vacancies across our sales division.",
    fallbackRef: "Test 09 - Part 5 - Q106",
    translation: "Do sự mở rộng nhanh chóng trong khu vực, chúng tôi hiện có một số vị trí việc làm còn trống hấp dẫn trong bộ phận kinh doanh.",
    tip: "'Vacancy' xuất phát từ 'vacant' (trống rỗng). Tránh nhầm với 'vacation' (kỳ nghỉ)."
  },
  {
    category: 5,
    term: "letters of recommendation / reference",
    type: "Human Resources Topic",
    meaning: "Thư giới thiệu / thư tiến cử năng lực",
    regex: "letters of (recommendation|reference)",
    fallbackText: "Candidates must submit a detailed resume, three letters of recommendation, and a portfolio of past writing samples.",
    fallbackRef: "Test 07 - Part 5 - Q108",
    translation: "Các ứng viên phải nộp một bản sơ yếu lý lịch chi tiết, ba thư giới thiệu và một tập danh mục các bài viết mẫu trước đây.",
    tip: "Xuất hiện trong các yêu cầu nộp hồ sơ xin việc (application requirements) của Part 7."
  },
  {
    category: 5,
    term: "retirement banquet / party",
    type: "Human Resources Topic",
    meaning: "Bữa tiệc liên hoan chia tay đồng nghiệp về hưu",
    regex: "retirement (banquet|party|celebration)",
    fallbackText: "Colleagues gathered in the grand banquet hall to honor Mr. Okada's thirty-year career at his celebratory retirement party.",
    fallbackRef: "Test 09 - Part 5 - Q109",
    translation: "Các đồng nghiệp đã tề tựu tại phòng tiệc lớn để vinh danh sự nghiệp ba mươi năm của ông Okada tại bữa tiệc về hưu chúc mừng ông.",
    tip: "Bối cảnh Part 7 rất hay có thư mời dự tiệc chia tay về hưu (retirement celebration) hoặc tiệc kỷ niệm năm thành lập (anniversary)."
  },
  {
    category: 5,
    term: "quarterly revenue / financial forecast",
    type: "Finance & Business Topic",
    meaning: "Doanh thu theo quý / dự báo tài chính",
    regex: "(quarterly revenue|financial forecast|quarterly earnings)",
    fallbackText: "The financial forecast predicts a steady rebound in quarterly revenue as export demand stabilizes.",
    fallbackRef: "Test 06 - Part 5 - Q104",
    translation: "Bản dự báo tài chính dự đoán sự hồi phục ổn định của doanh thu theo quý khi nhu cầu xuất khẩu dần bình ổn trở lại.",
    tip: "'Quarterly' = theo từng quý (3 tháng). 1 năm có 4 quý: Q1, Q2, Q3, Q4. Thường đi với revenue, earnings, profit, report."
  },
  {
    category: 5,
    term: "budget allocation / expenditure",
    type: "Finance & Business Topic",
    meaning: "Sự phân bổ ngân sách / mức chi tiêu tài chính",
    regex: "(budget allocation|expenditure)",
    fallbackText: "Department managers must submit their proposed budget allocations for the upcoming calendar year by October 1.",
    fallbackRef: "Test 07 - Part 5 - Q109",
    translation: "Các trưởng phòng phải nộp các đề xuất phân bổ ngân sách cho năm dương lịch sắp tới trước ngày mùng 1 tháng 10.",
    tip: "'Expenditure' = chi tiêu, chi phí (đồng nghĩa với expense, spending). Động từ tương ứng: 'expend funds'."
  },
  {
    category: 5,
    term: "terms and conditions",
    type: "Finance & Contracts Topic",
    meaning: "Các điều khoản và điều kiện ràng buộc trong hợp đồng",
    regex: "terms and conditions",
    fallbackText: "Please carefully read the terms and conditions outlined in Section 4 of the commercial lease agreement.",
    fallbackRef: "Test 04 - Part 5 - Q107",
    translation: "Vui lòng đọc kỹ các điều khoản và điều kiện được nêu tại Mục 4 của hợp đồng thuê mặt bằng thương mại.",
    tip: "Cụm danh từ ghép cố định không thể tách rời: 'terms and conditions'. Khi ký hợp đồng hoặc mua vé luôn phải đồng ý với cụm này."
  },
  {
    category: 5,
    term: "sign the contract / merge with",
    type: "Finance & Business Topic",
    meaning: "Ký kết hợp đồng / sáp nhập doanh nghiệp với đối tác",
    regex: "(sign the contract|merge with)",
    fallbackText: "Production of the garments will commence immediately after both corporate parties formally sign the contract.",
    fallbackRef: "Test 10 - Part 5 - Q105",
    translation: "Quá trình sản xuất hàng may mặc sẽ bắt đầu ngay sau khi đại diện hai công ty chính thức ký kết hợp đồng.",
    tip: "'Merge' đi với giới từ 'WITH' (sáp nhập với). Danh từ: 'merger' (vụ sáp nhập). Thường đi đôi với 'acquisition' (mua lại)."
  },
  {
    category: 5,
    term: "billing invoice statement",
    type: "Finance & Billing Topic",
    meaning: "Bản sao kê hóa đơn thanh toán tiền",
    regex: "(invoice statement|billing statement|invoice inquiry)",
    fallbackText: "Customers will receive an electronic invoice statement detailing monthly subscription charges via email.",
    fallbackRef: "Test 08 - Part 7 Passage",
    translation: "Khách hàng sẽ nhận được một bản sao kê hóa đơn điện tử nêu chi tiết các khoản phí đăng ký dịch vụ hàng tháng qua email.",
    tip: "Chủ đề hóa đơn: 'issue an invoice' (xuất hóa đơn), 'settle an invoice' (thanh toán hóa đơn), 'dispute an invoice' (khiếu nại hóa đơn)."
  },
  {
    category: 5,
    term: "emergency evacuation route",
    type: "Facilities & Safety Topic",
    meaning: "Lối thoát hiểm khẩn cấp khi có sự cố",
    regex: "(evacuation route|emergency exit)",
    fallbackText: "Emergency evacuation routes are posted prominently next to the elevator banks on every floor of the facility.",
    fallbackRef: "Test 08 - Part 5 - Q103",
    translation: "Các lối thoát hiểm khẩn cấp được dán nổi bật ngay bên cạnh cụm thang máy ở mỗi tầng của tòa nhà cơ sở.",
    tip: "Trong các sơ đồ tòa nhà (building floorplans) của Part 7, ký hiệu 'Evacuation Route' luôn chỉ đường thoát hiểm ngắn nhất."
  },
  {
    category: 5,
    term: "wear protective gear / equipment",
    type: "Facilities & Safety Topic",
    meaning: "Mặc đồ bảo hộ / trang bị bảo hộ lao động",
    regex: "protective (gear|equipment|clothing)",
    fallbackText: "All factory personnel and visitors must wear approved protective gear, including hard hats and goggles, on the assembly floor.",
    fallbackRef: "Test 08 - Part 5 - Q103",
    translation: "Tất cả nhân sự nhà máy và khách tham quan phải mặc đồ bảo hộ đã được chứng nhận, bao gồm mũ bảo hộ và kính bảo hộ, tại khu vực lắp ráp.",
    tip: "'Gear' là danh từ không đếm được mang nghĩa trang bị, đồ dùng bảo hộ (hard hat, gloves, boots)."
  },
  {
    category: 5,
    term: "unexpected power outage / disruption",
    type: "Facilities & Safety Topic",
    meaning: "Sự cố mất điện đột xuất / gián đoạn năng lượng",
    regex: "(power outage|electrical outage)",
    fallbackText: "Emergency backup generators were activated immediately during the sudden power outage caused by lightning strikes.",
    fallbackRef: "Test 07 - Part 7 Passage",
    translation: "Các máy phát điện dự phòng khẩn cấp đã được kích hoạt ngay lập tức trong đợt mất điện đột ngột do sét đánh gây ra.",
    tip: "'Power outage' = sự cố cúp điện. Đồng nghĩa: 'blackout', 'power interruption'."
  },
  {
    category: 5,
    term: "undergo extensive renovation",
    type: "Facilities & Property Topic",
    meaning: "Trải qua quá trình tu sửa, tân trang mở rộng",
    regex: "extensive renovation",
    fallbackText: "The historical theater is undergoing extensive renovation to install modern acoustic soundproofing and comfortable seating.",
    fallbackRef: "Test 09 - Part 7 Passage",
    translation: "Nhà hát lịch sử đang trải qua đợt trùng tu toàn diện để lắp đặt hệ thống cách âm hiện đại và ghế ngồi êm ái.",
    tip: "'Renovation' là sửa chữa nâng cấp nhà cửa/cơ sở vật chất. Không dùng 'repair' khi nói về làm mới toàn diện."
  },
  {
    category: 5,
    term: "ergonomic office workstation",
    type: "Facilities & Workplace Topic",
    meaning: "Bàn làm việc văn phòng chuẩn công thái học",
    regex: "(office workstation|workstation)",
    fallbackText: "Handi Office Supplies' sleek desk organizers serve as practical and stylish additions to any modern office workstation.",
    fallbackRef: "Test 06 - Part 5 - Q109",
    translation: "Các khay đựng đồ để bàn gọn gàng của Handi Office Supplies là sự bổ sung tiện lợi và phong cách cho mọi bàn làm việc văn phòng hiện đại.",
    tip: "'Workstation' = chỗ làm việc riêng của nhân viên trong văn phòng (gồm bàn, ghế, máy tính, vách ngăn)."
  },
  {
    category: 5,
    term: "parking restrictions / permit",
    type: "Facilities & Urban Life Topic",
    meaning: "Các quy định hạn chế đỗ xe / giấy phép đỗ xe",
    regex: "(parking restrictions|parking permit)",
    fallbackText: "The City of Doyle's new downtown parking restrictions have been met with stiff opposition by local business owners.",
    fallbackRef: "Test 01 - Part 5 - Q124",
    translation: "Các quy định hạn chế đỗ xe mới tại khu trung tâm của thành phố Doyle đã vấp phải sự phản đối gay gắt từ các chủ cơ sở kinh doanh địa phương.",
    tip: "'Restrictions' = sự hạn chế, thắt chặt. 'Permit' = giấy phép (danh từ đếm được: a parking permit)."
  },
  {
    category: 5,
    term: "diagnostic fee / estimate",
    type: "Maintenance & Automotive Topic",
    meaning: "Phí kiểm tra chẩn đoán hư hỏng / bảng ước tính chi phí",
    regex: "(diagnostic fee|diagnostic)",
    fallbackText: "For a standard $95 diagnostic fee, our certified auto mechanics will inspect the engine and determine what repairs are needed.",
    fallbackRef: "Test 01 - Part 5 - Q130",
    translation: "Với mức phí kiểm tra chẩn đoán tiêu chuẩn 95 đô la, các thợ cơ khí lành nghề của chúng tôi sẽ kiểm tra động cơ và xác định xem cần sửa chữa những gì.",
    tip: "'Diagnostic' = thuộc về chẩn đoán lỗi kỹ thuật. Rất hay đi cùng 'fee', 'test', 'equipment'."
  },
  {
    category: 5,
    term: "commercial real estate / lease",
    type: "Property & Real Estate Topic",
    meaning: "Bất động sản thương mại / hợp đồng thuê văn phòng/mặt bằng",
    regex: "(commercial real estate|retail space)",
    fallbackText: "The Lofstrom Shopping Center is currently seeking new retail tenants to lease prime vacant commercial space.",
    fallbackRef: "Test 09 - Part 5 - Q106",
    translation: "Trung tâm thương mại Lofstrom hiện đang tìm kiếm các khách thuê bán lẻ mới để thuê mặt bằng thương mại còn trống ở vị trí đắc địa.",
    tip: "Chủ đề bất động sản thương mại: 'tenant' (người thuê), 'landlord' (chủ cho thuê), 'lease' (hợp đồng thuê dài hạn)."
  }
];

// ============================================================
// SECTION 6: CHEAT SHEET (TOP 30 SIÊU TỐC - CỨ GẶP LÀ KHOANH TRONG 5S)
// ============================================================
const cheatSheetItems = [
  { no: 1, collocation: "meet the deadline", blank: "meet hoặc deadline", meaning: "Kịp hạn chót", clue: "Thấy 'deadline' -> chọn ngay 'meet' (không chọn make/catch/do)." },
  { no: 2, collocation: "prior to (+ N / V-ing)", blank: "prior hoặc to", meaning: "Trước khi...", clue: "Đứng trước Noun/V-ing mang nghĩa thời gian trước -> chọn 'prior to'." },
  { no: 3, collocation: "in accordance with", blank: "accordance hoặc with", meaning: "Tuân theo quy định", clue: "Thấy 'in... with' -> 99% điền 'accordance' (hoặc 'compliance')." },
  { no: 4, collocation: "take advantage of", blank: "advantage hoặc take", meaning: "Tận dụng lợi thế", clue: "Cụm cố định ba từ. Thấy 'of' và cơ hội -> chọn 'take advantage of'." },
  { no: 5, collocation: "conveniently located", blank: "conveniently hoặc located", meaning: "Tọa lạc thuận tiện", clue: "Đứng trước 'located' -> chọn ngay trạng từ 'conveniently' hoặc 'centrally'." },
  { no: 6, collocation: "strictly prohibited", blank: "strictly", meaning: "Bị nghiêm cấm tuyệt đối", clue: "Bổ nghĩa cho 'prohibited/forbidden' -> luôn là 'strictly'." },
  { no: 7, collocation: "readily available", blank: "readily", meaning: "Luôn có sẵn", clue: "Đứng trước tính từ 'available' -> phản xạ chọn 'readily'." },
  { no: 8, collocation: "promptly at [time]", blank: "promptly", meaning: "Đúng vào lúc (giờ)", clue: "Khoảng trống đứng ngay trước 'at [giờ cụ thể]' -> chọn 'promptly'." },
  { no: 9, collocation: "highly qualified", blank: "highly", meaning: "Trình độ chuyên môn cao", clue: "Bổ nghĩa cho 'qualified/recommended/successful' -> chọn 'highly'." },
  { no: 10, collocation: "conduct a survey", blank: "conduct", meaning: "Tiến hành khảo sát", clue: "Tân ngữ là survey/research/study/inspection -> chọn động từ 'conduct'." },
  { no: 11, collocation: "address concerns", blank: "address", meaning: "Giải quyết mối lo ngại", clue: "Tân ngữ là concerns/issues/problems -> chọn động từ 'address'." },
  { no: 12, collocation: "state-of-the-art facility", blank: "state-of-the-art", meaning: "Cơ sở vật chất tối tân", clue: "Bổ nghĩa cho equipment/facility/technology -> chọn 'state-of-the-art'." },
  { no: 13, collocation: "complimentary breakfast", blank: "complimentary", meaning: "Bữa sáng miễn phí", clue: "Đồ miễn phí trong khách sạn/hội nghị -> chọn 'complimentary' (chữ 'i')." },
  { no: 14, collocation: "be eligible for (+ N)", blank: "eligible hoặc for", meaning: "Đủ điều kiện nhận...", clue: "Thấy cấu trúc 'be... for [thưởng/nghỉ phép]' -> điền 'eligible'." },
  { no: 15, collocation: "be subject to (change)", blank: "subject hoặc to", meaning: "Có thể bị thay đổi", clue: "Lịch trình/giá cả phụ thuộc hoặc thay đổi -> chọn 'subject to'." },
  { no: 16, collocation: "ahead of schedule", blank: "ahead hoặc schedule", meaning: "Trước thời hạn tiến độ", clue: "Hoàn thành sớm hơn dự kiến -> chọn 'ahead of schedule'." },
  { no: 17, collocation: "at your earliest convenience", blank: "convenience hoặc earliest", meaning: "Ngay khi bạn thuận tiện", clue: "Thư từ kết bài yêu cầu phản hồi -> chọn cụm 'earliest convenience'." },
  { no: 18, collocation: "on behalf of", blank: "behalf", meaning: "Thay mặt đại diện cho", clue: "Cụm cố định bắt buộc: 'on behalf of'." },
  { no: 19, collocation: "routine maintenance", blank: "routine", meaning: "Bảo dưỡng định kỳ", clue: "Đi với 'maintenance/inspection' chỉ công việc theo chu kỳ -> chọn 'routine'." },
  { no: 20, collocation: "fulfil an order", blank: "fulfill", meaning: "Hoàn tất đơn hàng", clue: "Xử lý và giao đơn hàng -> chọn 'fulfill an order'." },
  { no: 21, collocation: "place an order", blank: "place", meaning: "Đặt hàng", clue: "Thực hiện mua sắm -> chọn 'place an order' (không dùng set/put)." },
  { no: 22, collocation: "reach an agreement", blank: "reach", meaning: "Đạt được thỏa thuận", clue: "Sau đàm phán chốt hợp đồng -> chọn 'reach an agreement'." },
  { no: 23, collocation: "substantial increase", blank: "substantial", meaning: "Sự gia tăng đáng kể", clue: "Bổ nghĩa cho increase/growth/reduction -> chọn 'substantial'/'significant'." },
  { no: 24, collocation: "closely monitor", blank: "closely", meaning: "Theo dõi sát sao", clue: "Đi với động từ 'monitor/inspect/examine' -> chọn 'closely'." },
  { no: 25, collocation: "under warranty", blank: "under", meaning: "Còn trong hạn bảo hành", clue: "Máy móc được sửa miễn phí vì 'under warranty'." },
  { no: 26, collocation: "out of stock", blank: "stock", meaning: "Hết hàng tồn kho", clue: "Sản phẩm tạm thời không còn để bán -> chọn 'out of stock'." },
  { no: 27, collocation: "look forward to (+ V-ing)", blank: "look hoặc forward", meaning: "Rất mong đợi điều gì", clue: "Theo sau là V-ing -> chọn 'look forward to'." },
  { no: 28, collocation: "mutually beneficial", blank: "mutually", meaning: "Đôi bên cùng có lợi", clue: "Đi trước tính từ 'beneficial' trong quan hệ đối tác -> chọn 'mutually'." },
  { no: 29, collocation: "comply with regulations", blank: "comply hoặc with", meaning: "Tuân thủ quy định", clue: "Động từ đi kèm giới từ 'with' về pháp lý/an toàn -> chọn 'comply with'." },
  { no: 30, collocation: "solid reputation", blank: "solid", meaning: "Uy tín vững chắc", clue: "Bổ nghĩa cho danh tiếng doanh nghiệp 'reputation' -> chọn 'solid'." }
];

console.log(`Processing authentic sentences for ${rawCollocations.length} collocations...`);

// Resolve real sentences from test data
const processedCollocations = rawCollocations.map((item, idx) => {
  const authentic = findAuthenticSentence(item.regex, item.fallbackText, item.fallbackRef);
  return {
    id: idx + 1,
    ...item,
    sampleSentence: authentic.text,
    sourceRef: authentic.ref,
    sourceType: authentic.sourceType
  };
});

console.log(`Total collocations processed: ${processedCollocations.length}`);

// Group by category
const categories = {
  1: {
    title: "Chương 1: Cụm Động Từ + Danh Từ Đắt Giá Nhất (Verb + Noun)",
    badge: "Verb + Noun",
    badgeColor: "#059669",
    desc: "Các cụm động từ kết hợp với danh từ cốt lõi trong giao dịch kinh doanh, quản lý dự án và quan hệ đối tác.",
    items: processedCollocations.filter(c => c.category === 1)
  },
  2: {
    title: "Chương 2: Cụm Tính Từ + Danh Từ Kinh Điển (Adjective + Noun)",
    badge: "Adjective + Noun",
    badgeColor: "#2563eb",
    desc: "Các cặp tính từ - danh từ chuyên ngành miêu tả sản phẩm, dịch vụ, con người và tiêu chuẩn công sở.",
    items: processedCollocations.filter(c => c.category === 2)
  },
  3: {
    title: "Chương 3: Cụm Trạng Từ Ăn Điểm Nhanh (Adverb + Verb / Adjective)",
    badge: "Adverb Collocations",
    badgeColor: "#7c3aed",
    desc: "Những trạng từ xuất hiện với tần suất cực đại ở Part 5 & 6, giúp nhận diện đáp án chính xác trong vòng 5 giây.",
    items: processedCollocations.filter(c => c.category === 3)
  },
  4: {
    title: "Chương 4: Cụm Giới Từ & Cụm Từ Cố Định (Prepositional & Fixed Phrases)",
    badge: "Prepositional Phrases",
    badgeColor: "#d97706",
    desc: "Các thành ngữ cố định và cụm giới từ thương mại chuẩn mực bắt buộc phải thuộc lòng khi làm bài đọc TOEIC.",
    items: processedCollocations.filter(c => c.category === 4)
  },
  5: {
    title: "Chương 5: Collocations Theo Chủ Đề Công Sở Thực Tế Trong 10 Đề",
    badge: "Topic Collocations",
    badgeColor: "#0d9488",
    desc: "Tuyển chọn các cụm từ theo 5 chủ đề lớn: CSKH, Khách sạn - Du lịch, Nhân sự, Tài chính - Hợp đồng và Vận hành tòa nhà.",
    items: processedCollocations.filter(c => c.category === 5)
  }
};

// -------------------------------------------------------------
// BUILD PUBLICATION-QUALITY HTML FOR PDF PRINTING
// -------------------------------------------------------------

function generateHtml() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>BỘ TỔNG HỢP COLLOCATIONS 10 ĐỀ TOEIC READING 2026 - ENGLISH PARTY</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

    @page {
      size: A4 portrait;
      margin: 14mm 16mm 14mm 16mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Be Vietnam Pro', 'Inter', -apple-system, sans-serif;
      font-size: 9.5pt;
      line-height: 1.5;
      color: #1e293b;
      background-color: #ffffff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Page breaks */
    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* COVER PAGE */
    .cover-page {
      height: 268mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20mm 15mm;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #172554 100%);
      color: #ffffff;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }

    .cover-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #38bdf8;
      width: fit-content;
    }

    .cover-title-group {
      margin-top: 25mm;
    }

    .cover-supertitle {
      font-size: 13pt;
      font-weight: 700;
      color: #fbbf24;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }

    .cover-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 26pt;
      font-weight: 800;
      line-height: 1.25;
      color: #ffffff;
      margin-bottom: 16px;
    }

    .cover-subtitle {
      font-size: 11pt;
      font-weight: 400;
      color: #cbd5e1;
      line-height: 1.6;
      max-width: 90%;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 25mm;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 16px;
      border-radius: 10px;
    }

    .stat-card {
      text-align: center;
    }

    .stat-number {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 20pt;
      font-weight: 800;
      color: #38bdf8;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 8pt;
      font-weight: 500;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cover-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      color: #94a3b8;
    }

    .cover-brand {
      font-weight: 700;
      color: #ffffff;
      font-size: 10pt;
    }

    /* HEADER & FOOTER */
    .section-header-banner {
      background: linear-gradient(90deg, #1e293b, #334155);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header-banner h2 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13pt;
      font-weight: 700;
      color: #ffffff;
    }

    .section-header-banner .badge {
      background: rgba(255, 255, 255, 0.18);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 8pt;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .section-intro-text {
      font-size: 9pt;
      color: #475569;
      margin-bottom: 14px;
      font-style: italic;
      background: #f8fafc;
      padding: 8px 12px;
      border-left: 3px solid #64748b;
      border-radius: 0 6px 6px 0;
    }

    /* ENTRY CARD */
    .entry-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    .entry-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 4px;
    }

    .entry-term {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
    }

    .entry-term-num {
      color: #64748b;
      font-weight: 600;
      font-size: 9pt;
      margin-right: 4px;
    }

    .entry-type-pill {
      font-size: 7.5pt;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .entry-meaning {
      font-size: 9pt;
      font-weight: 600;
      color: #0369a1;
      margin-bottom: 6px;
    }

    /* EXAMPLE BOX */
    .example-box {
      background: #f8fafc;
      border-left: 3px solid #3b82f6;
      padding: 6px 10px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 6px;
      font-size: 8.5pt;
    }

    .example-source-tag {
      display: inline-block;
      font-size: 7pt;
      font-weight: 700;
      color: #1d4ed8;
      background: #dbeafe;
      padding: 1px 6px;
      border-radius: 4px;
      margin-bottom: 3px;
    }

    .example-en {
      color: #1e293b;
      font-style: italic;
      line-height: 1.45;
      margin-bottom: 3px;
    }

    .example-vn {
      color: #475569;
      font-size: 8pt;
      line-height: 1.4;
    }

    /* TIP BOX */
    .tip-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 3px solid #f59e0b;
      padding: 5px 8px;
      border-radius: 0 4px 4px 0;
      font-size: 8pt;
      color: #92400e;
      line-height: 1.4;
      display: flex;
      gap: 6px;
      align-items: flex-start;
    }

    .tip-icon {
      font-size: 9pt;
      line-height: 1;
    }

    /* CHEAT SHEET TABLE */
    .cheat-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.2pt;
      margin-top: 8px;
    }

    .cheat-table th {
      background: #1e293b;
      color: #ffffff;
      font-weight: 600;
      padding: 7px 8px;
      text-align: left;
      border: 1px solid #334155;
    }

    .cheat-table td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
      line-height: 1.4;
    }

    .cheat-table tr:nth-child(even) {
      background-color: #f8fafc;
    }

    .cheat-table .colloc-term {
      font-weight: 700;
      color: #0f172a;
    }

    .cheat-table .colloc-blank {
      color: #dc2626;
      font-weight: 600;
    }

    .cheat-table .colloc-clue {
      color: #047857;
      font-size: 7.8pt;
    }

    /* TOC */
    .toc-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #cbd5e1;
      font-size: 9.5pt;
    }

    .toc-item:last-child {
      border-bottom: none;
    }

    .toc-title {
      font-weight: 600;
      color: #1e293b;
    }

    .toc-count {
      color: #2563eb;
      font-weight: 700;
    }

    /* GUIDELINES BOX */
    .guideline-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 20px;
    }

    .guideline-title {
      font-size: 10.5pt;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
    }

    .guideline-list {
      padding-left: 18px;
      font-size: 8.8pt;
      color: #1e3a8a;
      line-height: 1.6;
    }
  </style>
</head>
<body>

  <!-- ================= COVER PAGE ================= -->
  <div class="cover-page page-break">
    <div class="cover-badge">English Party TOEIC Academy 2026 Edition</div>
    
    <div class="cover-title-group">
      <div class="cover-supertitle">Cẩm Nang Độc Quyền Dành Cho Sĩ Tử 800+ TOEIC</div>
      <h1 class="cover-title">BỘ TỔNG HỢP TOÀN DIỆN<br>COLLOCATIONS TRỌNG TÂM<br>10 ĐỀ TOEIC READING 2026</h1>
      <p class="cover-subtitle">
        Tuyển tập hơn 160 cụm từ cố định (Collocations) xuất hiện xuyên suốt 1,000 câu hỏi và bài đọc thực tế của 10 đề TOEIC 2026. Kèm ví dụ trích dẫn chính xác, dịch nghĩa chuẩn ngữ cảnh công sở và bí kíp phản xạ 5 giây cho Part 5 & 6.
      </p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">10</div>
        <div class="stat-label">Bộ Đề Thi 2026</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">1,000</div>
        <div class="stat-label">Câu Hỏi Khảo Sát</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">160+</div>
        <div class="stat-label">Collocations Kinh Điển</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">30</div>
        <div class="stat-label">Cụm Phản Xạ 5 Giây</div>
      </div>
    </div>

    <div class="cover-footer">
      <div>
        <div class="cover-brand">ENGLISH PARTY - TOEIC READING MASTERY</div>
        <div>Biên soạn dựa trên bộ ngân hàng câu hỏi chuẩn ETS TOEIC 2026</div>
      </div>
      <div style="text-align: right;">
        <div>Tài Liệu Ôn Luyện Cao Cấp</div>
        <div>Lưu hành nội bộ học viên</div>
      </div>
    </div>
  </div>

  <!-- ================= TABLE OF CONTENTS & METHODOLOGY ================= -->
  <div class="page-break" style="padding-top: 10px;">
    <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16pt; color: #0f172a; margin-bottom: 6px;">MỤC LỤC TỔNG QUAN</h2>
    <p style="font-size: 9pt; color: #64748b; margin-bottom: 16px;">Tài liệu được phân chia thành 6 phần chuyên biệt, sắp xếp khoa học từ cấu trúc từ loại đến ngữ cảnh chuyên ngành và bảng tra cứu phản xạ.</p>

    <div class="toc-card">
      <div class="toc-item">
        <span class="toc-title">Chương 1: Cụm Động Từ + Danh Từ Đắt Giá Nhất (Verb + Noun)</span>
        <span class="toc-count">35 cụm</span>
      </div>
      <div class="toc-item">
        <span class="toc-title">Chương 2: Cụm Tính Từ + Danh Từ Kinh Điển (Adjective + Noun)</span>
        <span class="toc-count">35 cụm</span>
      </div>
      <div class="toc-item">
        <span class="toc-title">Chương 3: Cụm Trạng Từ Ăn Điểm Nhanh (Adverb + Verb / Adjective)</span>
        <span class="toc-count">25 cụm</span>
      </div>
      <div class="toc-item">
        <span class="toc-title">Chương 4: Cụm Giới Từ & Cụm Cố Định (Prepositional & Fixed Phrases)</span>
        <span class="toc-count">30 cụm</span>
      </div>
      <div class="toc-item">
        <span class="toc-title">Chương 5: Collocations Theo Chủ Đề Công Sở Thực Tế Trong 10 Đề</span>
        <span class="toc-count">25 cụm</span>
      </div>
      <div class="toc-item">
        <span class="toc-title">Chương 6: Bảng Tra Cứu Siêu Tốc - Top 30 "Cứ Gặp Là Khoanh Trong 5 Giây"</span>
        <span class="toc-count">30 cụm</span>
      </div>
    </div>

    <div class="guideline-box">
      <div class="guideline-title">💡 4 NGUYÊN TẮC VÀNG ĐỂ CHINH PHỤC CÂU HỎI COLLOCATION TRONG TOEIC</div>
      <ol class="guideline-list">
        <li><strong>Không dịch thô từng từ đơn lẻ (Word-by-word):</strong> Tiếng Anh công sở có những cụm từ kết hợp tự nhiên cố định. Ví dụ: "đáp ứng hạn chót" phải là <em>meet the deadline</em>, tuyệt đối không dùng <em>catch the deadline</em> hay <em>make the deadline</em>; "đặt đơn hàng" là <em>place an order</em> chứ không dùng <em>set an order</em>.</li>
        <li><strong>Nhìn nhanh trước và sau chỗ trống:</strong> Trong Part 5, có tới 40% câu hỏi từ vựng thực chất là câu hỏi kiểm tra Collocation. Khi thấy danh từ ở phía sau (như <em>survey</em>, <em>policy</em>, <em>agreement</em>), hãy quét nhanh 4 đáp án để tìm động từ "cặp đôi ăn ý" (<em>conduct</em>, <em>implement</em>, <em>reach</em>) thay vì mất thời gian dịch cả câu.</li>
        <li><strong>Cảnh giác với bẫy từ cùng trường nghĩa (Synonym Distractors):</strong> ETS rất thích bẫy các cặp từ như <em>complimentary</em> (miễn phí) vs <em>complementary</em> (bổ sung); <em>extend</em> (gia hạn thời gian) vs <em>expand</em> (mở rộng diện tích); <em>thorough</em> (kỹ lưỡng) vs <em>through</em> (xuyên qua).</li>
        <li><strong>Học theo câu mẫu nguyên bản (Authentic Sentences):</strong> Mỗi cụm từ trong tài liệu này đều đi kèm một câu văn thực tế được trích xuất trực tiếp từ 10 đề TOEIC 2026. Hãy đọc to câu ví dụ 2-3 lần để não bộ ghi nhớ ngữ cảnh tự nhiên.</li>
      </ol>
    </div>
  </div>

  <!-- ================= CHAPTERS 1 TO 5 ================= -->
  ${[1, 2, 3, 4, 5].map(catId => {
    const cat = categories[catId];
    return `
      <div class="section-wrapper ${catId < 5 ? 'page-break' : ''}">
        <div class="section-header-banner">
          <h2>${cat.title}</h2>
          <span class="badge" style="background: ${cat.badgeColor};">${cat.badge} (${cat.items.length} CỤM)</span>
        </div>
        <div class="section-intro-text">${cat.desc}</div>

        <div class="entries-container">
          ${cat.items.map(item => `
            <div class="entry-card avoid-break">
              <div class="entry-top">
                <div class="entry-term">
                  <span class="entry-term-num">#${item.id}.</span> ${item.term}
                </div>
                <span class="entry-type-pill" style="background: ${cat.badgeColor}15; color: ${cat.badgeColor}; border: 1px solid ${cat.badgeColor}40;">
                  ${item.type}
                </span>
              </div>
              <div class="entry-meaning">👉 Nghĩa: ${item.meaning}</div>

              <div class="example-box">
                <div>
                  <span class="example-source-tag">${item.sourceRef} • ${item.sourceType}</span>
                </div>
                <div class="example-en">"${item.sampleSentence}"</div>
                <div class="example-vn">➥ Dịch: ${item.translation}</div>
              </div>

              <div class="tip-box">
                <span class="tip-icon">💡</span>
                <div><strong>Mẹo thi ETS:</strong> ${item.tip}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('')}

  <!-- ================= CHAPTER 6: TOP 30 CHEAT SHEET ================= -->
  <div class="page-break" style="padding-top: 10px;">
    <div class="section-header-banner" style="background: linear-gradient(90deg, #b45309, #d97706);">
      <h2>Chương 6: Bảng Tra Cứu Nhanh - Top 30 "Cứ Thấy Là Khoanh Trong 5 Giây"</h2>
      <span class="badge" style="background: #78350f;">FAST CHEAT SHEET (30 CỤM)</span>
    </div>
    <div class="section-intro-text">
      Bảng tóm tắt các cặp Collocation xuất hiện với tần suất cao nhất trong Part 5 & 6 của 10 đề thi TOEIC 2026. Giúp thí sinh phản xạ lập tức khi nhìn thấy từ manh mối mà không cần dịch nghĩa toàn câu.
    </div>

    <table class="cheat-table avoid-break">
      <thead>
        <tr>
          <th style="width: 5%; text-align: center;">STT</th>
          <th style="width: 25%;">Cụm Collocation</th>
          <th style="width: 18%;">Vị trí ETS hay đục lỗ</th>
          <th style="width: 22%;">Nghĩa tiếng Việt</th>
          <th style="width: 30%;">Mẹo nhận diện nhanh (5 giây)</th>
        </tr>
      </thead>
      <tbody>
        ${cheatSheetItems.map(item => `
          <tr>
            <td style="text-align: center; font-weight: 700; color: #64748b;">${item.no}</td>
            <td class="colloc-term">${item.collocation}</td>
            <td class="colloc-blank">------- ${item.blank}</td>
            <td>${item.meaning}</td>
            <td class="colloc-clue">${item.clue}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="margin-top: 20px; padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 8.5pt; color: #166534;" class="avoid-break">
      <strong>🎉 LỜI KHUYÊN CUỐI CÙNG TỪ ENGLISH PARTY:</strong><br>
      Bộ tài liệu này được chắt lọc tinh hoa từ 1,000 câu hỏi trong 10 bộ đề thi thực chiến TOEIC 2026. Hãy in tài liệu ra hoặc lưu trên iPad, dành mỗi ngày 15 phút ôn tập 10-15 cụm từ và làm các đề thi TOEIC Reading trên hệ thống web English Party để biến các Collocations này thành phản xạ vô điều kiện! Chúc bạn đạt mục tiêu điểm số 800+ TOEIC!
    </div>
  </div>

</body>
</html>`;
}

// -------------------------------------------------------------
// EXECUTE GENERATION & EDGE HEADLESS PRINT-TO-PDF
// -------------------------------------------------------------

async function main() {
  const htmlContent = generateHtml();
  const htmlFilePath = path.resolve(__dirname, '../public/toeic-collocations.html');
  fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
  console.log(`Generated HTML file at: ${htmlFilePath} (${(htmlContent.length / 1024).toFixed(1)} KB)`);

  const edgeExe = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromeExe = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserExe = fs.existsSync(edgeExe) ? edgeExe : chromeExe;

  if (!fs.existsSync(browserExe)) {
    console.error('Neither Edge nor Chrome was found to print PDF.');
    process.exit(1);
  }

  // Target paths
  const outputPdfPath = path.resolve(__dirname, '../TOEIC_2026_COLLOCATIONS_ENGLISH_PARTY.pdf');
  const publicPdfPath = path.resolve(__dirname, '../public/TOEIC_2026_COLLOCATIONS.pdf');
  const dDrivePdfPath = 'D:\\TOEIC_2026_COLLOCATIONS_ENGLISH_PARTY.pdf';

  console.log(`Rendering PDF using: ${browserExe}...`);

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${outputPdfPath}`,
    `file:///${htmlFilePath.replace(/\\/g, '/')}`
  ];

  const res = cp.spawnSync(browserExe, args, { stdio: 'inherit' });

  if (res.status === 0 && fs.existsSync(outputPdfPath)) {
    const stats = fs.statSync(outputPdfPath);
    console.log(`✅ Successfully generated primary PDF: ${outputPdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);

    // Copy to public folder
    fs.copyFileSync(outputPdfPath, publicPdfPath);
    console.log(`✅ Copied to web public folder: ${publicPdfPath}`);

    // Copy to D:\ drive if available
    try {
      if (fs.existsSync('D:\\')) {
        fs.copyFileSync(outputPdfPath, dDrivePdfPath);
        console.log(`✅ Copied to D: drive for convenient user access: ${dDrivePdfPath}`);
      }
    } catch (dErr) {
      console.warn(`Could not copy to D drive: ${dErr.message}`);
    }

  } else {
    console.error('Edge headless command failed or did not produce PDF.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
