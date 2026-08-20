const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const generatedDir = path.join(root, 'src', 'data', 'generated');

const companies = ['Northstar', 'BluePeak', 'Greenfield', 'Summit', 'Riverside', 'BrightPath', 'Harborview', 'Silverline', 'Oakridge', 'MetroWorks'];
const departments = ['sales team', 'finance department', 'marketing unit', 'operations group', 'customer service team', 'research division', 'human resources office', 'shipping department', 'technology team', 'training unit'];
const people = ['Ms. Carter', 'Mr. Lee', 'Ms. Nguyen', 'Mr. Wilson', 'Ms. Patel', 'Mr. Brown', 'Ms. Garcia', 'Mr. Kim', 'Ms. Taylor', 'Mr. Martin'];
const dates = ['June 4', 'June 11', 'June 18', 'July 2', 'July 9', 'July 16', 'August 6', 'August 13', 'September 3', 'September 10'];
const locations = ['Boston', 'Seattle', 'Denver', 'Austin', 'Chicago', 'Portland', 'Atlanta', 'Phoenix', 'Miami', 'Dallas'];

function question(id, part, topic, difficulty, prompt, choices, correctAnswer, explanation, extra = {}) {
  return {
    id,
    exam: 'toeic',
    part,
    type: part === 5 ? 'mcq' : 'reading',
    topic,
    difficulty,
    question: prompt,
    choices,
    correctAnswer,
    explanation,
    tags: [`part-${part}`, topic],
    isActive: true,
    timesAnswered: 0,
    timesCorrect: 0,
    createdBy: 'bundled_bank',
    ...extra,
  };
}

const part5Templates = [
  (c) => ['nouns', 500, `The ${c.department} submitted _____ quarterly report before the deadline.`, ['it', 'its', 'itself', 'their'], 1, 'A possessive adjective is required before the singular noun phrase “quarterly report”. | Cần tính từ sở hữu “its” đứng trước cụm danh từ “quarterly report”.'],
  (c) => ['adverbs', 500, `${c.company} responded _____ to the customer complaint.`, ['prompt', 'promptly', 'promptness', 'prompting'], 1, 'An adverb is needed to modify the verb “responded”. | Cần trạng từ “promptly” để bổ nghĩa cho động từ “responded”.'],
  (c) => ['passive-voice', 600, `The updated schedule _____ to the ${c.department} yesterday.`, ['sent', 'was sent', 'is sending', 'has send'], 1, 'The schedule received the action in the past, so the simple past passive is required. | Lịch trình nhận hành động trong quá khứ nên dùng bị động quá khứ đơn “was sent”.'],
  (c) => ['verb-tenses', 600, `If ${c.company}'s supplier _____ the order today, it will arrive by Friday.`, ['ships', 'shipped', 'will ship', 'shipping'], 0, 'The if-clause of a first conditional uses the simple present. | Mệnh đề if của câu điều kiện loại 1 dùng hiện tại đơn “ships”.'],
  (c) => ['prepositions', 500, `Applications for the ${c.location} office must be received _____ Friday.`, ['by', 'until', 'during', 'since'], 0, '“By” marks a deadline at or before a stated time. | “By” chỉ hạn chót vào hoặc trước một thời điểm.'],
  (c) => ['conjunctions', 600, `The meeting was postponed _____ ${c.person} was unavailable.`, ['because', 'despite', 'unless', 'whereas'], 0, '“Because” introduces the clause that gives the reason for the postponement. | “Because” mở đầu mệnh đề nêu lý do cuộc họp bị hoãn.'],
  (c) => ['comparisons', 600, `${c.company}'s sales are _____ this quarter than they were last quarter.`, ['high', 'higher', 'highest', 'highly'], 1, '“Than” signals the comparative adjective “higher”. | “Than” là dấu hiệu của dạng so sánh hơn “higher”.'],
  (c) => ['pronouns', 600, `The consultant working with ${c.person} _____ prepared the report will present it to the board.`, ['who', 'which', 'whose', 'whom'], 0, '“Who” is the subject relative pronoun referring to a person. | “Who” là đại từ quan hệ làm chủ ngữ, thay cho người.'],
  (c) => ['nouns', 500, `Customer _____ remains a top priority for ${c.company}.`, ['satisfy', 'satisfied', 'satisfaction', 'satisfactorily'], 2, 'A noun is required as the subject of the sentence. | Vị trí chủ ngữ cần danh từ “satisfaction”.'],
  (c) => ['infinitives-gerunds', 600, `Management decided _____ the training program in ${c.location}.`, ['expand', 'to expand', 'expanding', 'expanded'], 1, '“Decide” is followed by a to-infinitive. | Sau “decide” dùng động từ nguyên mẫu có “to”.'],
  (c) => ['verb-tenses', 600, `${c.company} _____ three new branches since January.`, ['opens', 'opened', 'has opened', 'will open'], 2, '“Since January” calls for the present perfect. | “Since January” là dấu hiệu dùng hiện tại hoàn thành “has opened”.'],
  (c) => ['infinitives-gerunds', 700, `${c.person} is responsible for _____ the project schedule.`, ['prepare', 'prepared', 'preparing', 'preparation'], 2, 'A gerund follows the preposition “for”. | Sau giới từ “for” dùng danh động từ “preparing”.'],
  (c) => ['articles', 500, `${c.company} hired _____ experienced auditor for its ${c.location} office.`, ['a', 'an', 'the', 'no article'], 1, '“Experienced” begins with a vowel sound, so “an” is required. | “Experienced” bắt đầu bằng nguyên âm nên dùng “an”.'],
  (c) => ['word-forms', 600, `${c.company}'s new filing system is both efficient and _____.`, ['rely', 'reliable', 'reliably', 'reliability'], 1, 'The parallel structure after “both” requires another adjective. | Cấu trúc song song cần tính từ “reliable” sau “efficient”.'],
  (c) => ['subject-verb-agreement', 700, `Neither the director nor ${c.person} _____ available for an interview today.`, ['are', 'were', 'is', 'have'], 2, 'With “neither...nor”, the verb agrees with the nearest singular subject. | Với “neither...nor”, động từ hòa hợp với chủ ngữ số ít gần nhất nên dùng “is”.'],
  (c) => ['modal-verbs', 500, `All ${c.department} expense reports _____ be submitted before the end of the month.`, ['must', 'would', 'might', 'could have'], 0, '“Must” expresses a firm requirement. | “Must” diễn tả một yêu cầu bắt buộc.'],
  (c) => ['adjectives', 600, `The board found ${c.person}'s proposal highly _____.`, ['persuade', 'persuasive', 'persuasively', 'persuasion'], 1, 'An adjective is required after “found” to describe the proposal. | Cần tính từ “persuasive” để mô tả đề xuất.'],
  (c) => ['participles', 700, `_____ by the positive survey results, the ${c.company} team expanded the campaign.`, ['Encourage', 'Encouraged', 'Encouraging', 'Encouragement'], 1, 'The team received encouragement, so the past participle begins the reduced passive clause. | Nhóm được khích lệ nên dùng quá khứ phân từ “Encouraged”.'],
  (c) => ['prepositions', 600, `${c.person} has been in charge _____ the ${c.department} since March.`, ['at', 'with', 'of', 'for'], 2, 'The fixed expression is “in charge of”. | Cụm cố định đúng là “in charge of”.'],
  (c) => ['subjunctive', 800, `The ${c.company} committee recommended that the final report _____ before publication.`, ['is revised', 'be revised', 'was revised', 'revises'], 1, 'After “recommend that”, formal English uses the base-form subjunctive; the passive form is “be revised”. | Sau “recommend that” dùng giả định với động từ nguyên mẫu; dạng bị động là “be revised”.'],
];

const part5 = [];
part5Templates.forEach((build, templateIndex) => {
  companies.forEach((company, variantIndex) => {
    const [topic, difficulty, prompt, choices, answer, explanation] = build({
      company,
      department: departments[variantIndex],
      person: people[variantIndex],
      location: locations[variantIndex],
    });
    part5.push(question(`local-p5-${String(templateIndex * 10 + variantIndex + 1).padStart(3, '0')}`, 5, topic, difficulty, prompt, choices, answer, explanation));
  });
});

function part6Passage(kind, i) {
  const company = companies[i];
  const date = dates[i];
  const location = locations[i];
  const person = people[i];
  const department = departments[i];

  if (kind === 0) {
    return {
      topic: 'notices',
      difficulty: 600,
      context: `NOTICE TO STAFF\n\nPlease note that the ${company} office in ${location} [1] be closed on ${date} while technicians inspect the ventilation system. Employees should save their work [2] they leave on the previous afternoon. Normal operations will resume the following business day. Questions may be directed to ${person}.`,
      items: [
        ['Choose the best option for blank [1].', ['will', 'has', 'being', 'was'], 0, '“Will be closed” is the correct future passive form. | “Will be closed” là dạng bị động tương lai đúng.'],
        ['Choose the best option for blank [2].', ['before', 'although', 'because of', 'during'], 0, '“Before” correctly links saving work to leaving. | “Before” diễn tả việc lưu công việc trước khi rời đi.'],
        ['Why will the office close?', ['For a staff celebration', 'For a ventilation inspection', 'For employee training', 'For a public holiday'], 1, 'The notice states that technicians will inspect the ventilation system. | Thông báo nêu rõ kỹ thuật viên sẽ kiểm tra hệ thống thông gió.'],
        ['What should employees do?', ['Work at the office overnight', 'Call a customer', 'Save their work before leaving', 'Move to another company'], 2, 'Employees are specifically asked to save their work before leaving. | Nhân viên được yêu cầu lưu công việc trước khi rời đi.'],
        ['Who should receive questions?', [person, 'The building owner', 'The sales team', 'A technician'], 0, `The final sentence directs questions to ${person}. | Câu cuối hướng dẫn gửi câu hỏi cho ${person}.`],
      ],
    };
  }

  if (kind === 1) {
    return {
      topic: 'emails',
      difficulty: 650,
      context: `To: ${department}\nFrom: ${person}\nSubject: Customer Service Workshop\n\nA customer service workshop will take place at our ${location} branch on ${date}. Employees who wish to attend [1] register through the staff portal. Space is limited; [2], early registration is strongly recommended. Participants will receive the workbook by email two days before the session.`,
      items: [
        ['Choose the best option for blank [1].', ['must', 'would', 'used to', 'had'], 0, '“Must register” expresses the workshop requirement. | “Must register” diễn tả yêu cầu đăng ký.'],
        ['Choose the best option for blank [2].', ['however', 'therefore', 'otherwise', 'meanwhile'], 1, 'Limited space is the reason for early registration, so “therefore” fits. | Vì chỗ có hạn nên “therefore” nối kết quả hợp lý.'],
        ['What is the email mainly about?', ['A new employee portal', 'A customer service workshop', 'A branch relocation', 'A workbook sale'], 1, 'The message announces and explains a customer service workshop. | Email thông báo và hướng dẫn về hội thảo dịch vụ khách hàng.'],
        ['How will participants receive the workbook?', ['By postal mail', 'At reception', 'By email', 'From a customer'], 2, 'The workbook will be sent by email. | Tài liệu sẽ được gửi qua email.'],
        ['When will the workbook be sent?', ['On the day of the session', 'Two days before the session', 'One week after the session', 'During registration'], 1, 'The last sentence says it will arrive two days before the session. | Câu cuối cho biết tài liệu được gửi trước buổi học hai ngày.'],
      ],
    };
  }

  if (kind === 2) {
    const order = 3100 + i * 17;
    return {
      topic: 'shipping',
      difficulty: 650,
      context: `Dear Customer,\n\nYour ${company} order #${order} [1] leave our warehouse on ${date}. Once the package has been collected by the carrier, you can track [2] using the link in your account. Delivery to ${location} normally takes three business days. Please contact us if the tracking page does not update within 24 hours.`,
      items: [
        ['Choose the best option for blank [1].', ['will', 'has', 'was', 'would have'], 0, 'The scheduled future action requires “will leave”. | Hành động dự kiến trong tương lai dùng “will leave”.'],
        ['Choose the best option for blank [2].', ['it', 'them', 'its', 'itself'], 0, '“It” refers to the singular package. | “It” thay cho danh từ số ít “the package”.'],
        ['What is the purpose of the message?', ['To confirm a shipment schedule', 'To request a refund', 'To advertise a warehouse', 'To change an address'], 0, 'The message tells the customer when the order will ship and how to track it. | Tin nhắn xác nhận lịch gửi hàng và cách theo dõi.'],
        ['How long does delivery normally take?', ['One day', 'Two days', 'Three business days', 'One week'], 2, 'The message gives an estimated delivery time of three business days. | Thời gian giao dự kiến là ba ngày làm việc.'],
        ['When should the customer contact the company?', ['Before placing an order', 'If tracking does not update within 24 hours', 'Immediately after delivery', 'When visiting the warehouse'], 1, 'The final sentence gives this instruction. | Câu cuối đưa ra hướng dẫn này.'],
      ],
    };
  }

  if (kind === 3) {
    return {
      topic: 'memos',
      difficulty: 700,
      context: `MEMORANDUM\nTo: All ${company} supervisors\nFrom: ${person}\n\nThe revised remote-work policy [1] effect on ${date}. Supervisors are responsible [2] explaining the scheduling rules to their teams. Employees may work remotely up to two days per week, provided that their managers approve the requested days in advance.`,
      items: [
        ['Choose the best option for blank [1].', ['takes', 'makes', 'does', 'brings'], 0, 'The fixed expression is “take effect”. | Cụm cố định đúng là “take effect”.'],
        ['Choose the best option for blank [2].', ['to', 'of', 'for', 'with'], 2, 'The fixed pattern is “be responsible for” followed by a gerund. | Cấu trúc đúng là “be responsible for” + V-ing.'],
        ['Who is the memo addressed to?', ['All customers', `All ${company} supervisors`, 'Only new employees', 'Building technicians'], 1, 'The recipient line names all supervisors. | Dòng người nhận ghi rõ tất cả quản lý.'],
        ['How often may employees work remotely?', ['Every day', 'One day per month', 'Up to two days per week', 'Only on weekends'], 2, 'The policy permits up to two remote days each week. | Chính sách cho phép tối đa hai ngày làm từ xa mỗi tuần.'],
        ['What is required before remote days are taken?', ['Customer approval', 'Advance manager approval', 'A medical certificate', 'A new computer'], 1, 'Managers must approve the requested days in advance. | Quản lý phải duyệt trước những ngày được yêu cầu.'],
      ],
    };
  }

  return {
    topic: 'events',
    difficulty: 700,
    context: `${company} COMMUNITY DAY\n\nOur annual community event [1] held at ${location} Central Park on ${date}. Volunteers will help prepare food packages for local families. Please arrive early [2] registration and bring a reusable water bottle. ${person} will lead a short safety briefing at 8:30 A.M.`,
    items: [
      ['Choose the best option for blank [1].', ['will be', 'has', 'was being', 'to be'], 0, 'A future passive form is required: “will be held”. | Cần dạng bị động tương lai “will be held”.'],
      ['Choose the best option for blank [2].', ['for', 'by', 'with', 'from'], 0, '“For” correctly expresses the purpose of arriving early. | “For” diễn tả mục đích đến sớm để đăng ký.'],
      ['What will volunteers prepare?', ['Office furniture', 'Food packages', 'Marketing reports', 'Travel documents'], 1, 'The announcement says volunteers will prepare food packages. | Thông báo cho biết tình nguyện viên sẽ chuẩn bị các gói thực phẩm.'],
      ['What should volunteers bring?', ['A laptop', 'A printed ticket', 'A reusable water bottle', 'A safety uniform'], 2, 'Participants are asked to bring a reusable water bottle. | Người tham gia được yêu cầu mang bình nước tái sử dụng.'],
      ['What will happen at 8:30 A.M.?', ['Registration will close', 'Lunch will begin', 'A safety briefing will begin', 'The park will open'], 2, `The text says ${person} will lead a safety briefing at 8:30 A.M. | Bài đọc cho biết buổi hướng dẫn an toàn bắt đầu lúc 8:30.`],
    ],
  };
}

const part6 = [];
for (let passageIndex = 0; passageIndex < 40; passageIndex += 1) {
  const variant = Math.floor(passageIndex / 5);
  const passage = part6Passage(passageIndex % 5, variant);
  passage.items.forEach((item, itemIndex) => {
    part6.push(question(
      `local-p6-${String(passageIndex * 5 + itemIndex + 1).padStart(3, '0')}`,
      6,
      passage.topic,
      passage.difficulty,
      item[0], item[1], item[2], item[3],
      { context: passage.context },
    ));
  });
}

function part7Passage(kind, i) {
  const company = companies[i];
  const date = dates[i];
  const location = locations[i];
  const person = people[i];
  const amount = 85 + i * 10;
  const code = `EP${24 + i}`;

  if (kind === 0) {
    return {
      topic: 'reservations',
      difficulty: 600,
      context: `RIVERSIDE HOTEL - BOOKING CONFIRMATION\nGuest: ${person}\nLocation: ${location}\nCheck-in: ${date}, after 3:00 P.M.\nRoom: Business King\nRate: $${amount} per night\n\nBreakfast and wireless Internet are included. Cancellations made at least 48 hours before check-in are free. The airport shuttle must be reserved by noon on the day before arrival.`,
      items: [
        ['What is the purpose of the document?', ['To confirm a hotel booking', 'To advertise a restaurant', 'To request payment for a flight', 'To announce a meeting'], 0, 'The heading and booking details show that this is a hotel confirmation. | Tiêu đề và thông tin đặt phòng cho thấy đây là xác nhận khách sạn.'],
        ['What is included in the room rate?', ['Dinner and parking', 'Breakfast and Internet', 'Airport tickets', 'Laundry service'], 1, 'Breakfast and wireless Internet are explicitly included. | Bữa sáng và Internet không dây được bao gồm.'],
        ['When can the guest check in?', ['Before noon', 'After 3:00 P.M.', 'Only at midnight', 'Two days early'], 1, 'The confirmation lists check-in after 3:00 P.M. | Xác nhận ghi giờ nhận phòng sau 3 giờ chiều.'],
        ['How can the guest avoid a cancellation fee?', ['Cancel at least 48 hours early', 'Call after check-in', 'Reserve the shuttle', 'Change the room type'], 0, 'Cancellations at least 48 hours before check-in are free. | Hủy trước ít nhất 48 giờ sẽ không mất phí.'],
        ['What requires an advance reservation?', ['Breakfast', 'Wireless Internet', 'The airport shuttle', 'The business room'], 2, 'The airport shuttle must be reserved by noon before arrival. | Xe đưa đón sân bay phải được đặt trước.'],
      ],
    };
  }

  if (kind === 1) {
    return {
      topic: 'jobs',
      difficulty: 650,
      context: `${company} IS HIRING: OPERATIONS COORDINATOR\nLocation: ${location}\n\nThe successful candidate will organize delivery schedules, communicate with suppliers, and prepare weekly reports. Applicants need at least two years of office experience and strong spreadsheet skills. Send a resume and cover letter to careers@${company.toLowerCase()}.example by ${date}. Interviews will take place the following week.`,
      items: [
        ['What position is available?', ['Sales director', 'Operations coordinator', 'Software engineer', 'Hotel manager'], 1, 'The posting is for an operations coordinator. | Tin tuyển dụng dành cho vị trí điều phối vận hành.'],
        ['Which task is part of the job?', ['Designing buildings', 'Organizing delivery schedules', 'Teaching language classes', 'Repairing vehicles'], 1, 'Organizing delivery schedules is listed as a responsibility. | Sắp xếp lịch giao hàng là một nhiệm vụ được nêu.'],
        ['What experience is required?', ['Two years of office experience', 'Five years abroad', 'No previous experience', 'Restaurant experience only'], 0, 'Applicants need at least two years of office experience. | Ứng viên cần ít nhất hai năm kinh nghiệm văn phòng.'],
        ['What must applicants send?', ['A portfolio only', 'A resume and cover letter', 'A training certificate only', 'A weekly report'], 1, 'The posting requests both a resume and a cover letter. | Tin tuyển dụng yêu cầu CV và thư xin việc.'],
        ['When are interviews expected?', ['On the application deadline', 'The following week', 'Next year', 'Before applications open'], 1, 'Interviews will occur in the week after the deadline. | Phỏng vấn diễn ra vào tuần tiếp theo.'],
      ],
    };
  }

  if (kind === 2) {
    return {
      topic: 'advertisements',
      difficulty: 650,
      context: `INTRODUCING THE ${company.toUpperCase()} TRAVEL MUG\nKeep drinks hot for eight hours or cold for twelve. The leak-resistant lid fits most car cup holders, and every mug includes a two-year warranty. Order online before ${date} and use code ${code} to receive 20 percent off. Free delivery is available on orders over $50.`,
      items: [
        ['What product is being advertised?', ['A travel mug', 'A coffee machine', 'A delivery vehicle', 'A refrigerator'], 0, 'The advertisement introduces a travel mug. | Quảng cáo giới thiệu một chiếc cốc du lịch.'],
        ['How long can the mug keep drinks cold?', ['Two hours', 'Eight hours', 'Twelve hours', 'Twenty hours'], 2, 'It keeps cold drinks cold for twelve hours. | Cốc giữ lạnh trong mười hai giờ.'],
        ['What does every mug include?', ['Free coffee', 'A two-year warranty', 'A second lid', 'A gift card'], 1, 'Every mug comes with a two-year warranty. | Mỗi cốc đi kèm bảo hành hai năm.'],
        ['What is the purpose of code ' + code + '?', ['To track delivery', 'To receive a discount', 'To extend the warranty', 'To select a color'], 1, 'The code provides a 20 percent discount. | Mã dùng để nhận giảm giá 20 phần trăm.'],
        ['When is delivery free?', ['For every order', 'For orders over $50', 'Only on ' + date, 'With store pickup'], 1, 'Orders over $50 qualify for free delivery. | Đơn hàng trên 50 đô la được giao miễn phí.'],
      ],
    };
  }

  if (kind === 3) {
    return {
      topic: 'schedules',
      difficulty: 700,
      context: `${company} SMALL BUSINESS FORUM - ${date}\nVenue: ${location} Conference Center\n9:00 A.M. Opening remarks\n9:30 A.M. Building a digital brand - ${person}\n11:00 A.M. Finance for growing companies\n12:15 P.M. Lunch in Hall B\n1:30 P.M. Supplier negotiation workshop\n3:00 P.M. Networking reception\n\nAttendees must show their registration code at the entrance.`,
      items: [
        ['Where will the forum take place?', [`${location} Conference Center`, `${company} headquarters`, 'Hall A Restaurant', 'The city library'], 0, 'The venue is listed directly below the event date. | Địa điểm được ghi ngay dưới ngày tổ chức.'],
        ['Who will speak about digital branding?', [person, 'A finance officer', 'A supplier', 'The reception manager'], 0, `${person} is named beside the digital-brand session. | ${person} được ghi cạnh phiên về thương hiệu số.`],
        ['What begins at 11:00 A.M.?', ['Opening remarks', 'A finance session', 'Lunch', 'Networking'], 1, 'The finance session is scheduled for 11:00 A.M. | Phiên tài chính bắt đầu lúc 11 giờ.'],
        ['Where will lunch be served?', ['At the entrance', 'In Hall B', 'At headquarters', 'In the workshop room'], 1, 'The schedule places lunch in Hall B. | Lịch ghi bữa trưa ở Hội trường B.'],
        ['What must attendees present?', ['A passport', 'A supplier invoice', 'A registration code', 'A printed resume'], 2, 'A registration code is required at the entrance. | Người tham dự phải xuất trình mã đăng ký ở lối vào.'],
      ],
    };
  }

  const order = 7200 + i * 23;
  return {
    topic: 'customer-service',
    difficulty: 700,
    context: `From: support@${company.toLowerCase()}.example\nTo: ${person}\nSubject: Update on order #${order}\n\nThank you for contacting us about your delayed order. Severe weather prevented the carrier from reaching the ${location} distribution center yesterday. The package is now expected to arrive on ${date}. We have refunded the express-delivery charge to your original payment method. The refund may take three to five business days to appear.`,
    items: [
      ['Why was the message sent?', ['To explain an order delay', 'To advertise a new product', 'To request a product review', 'To confirm a job interview'], 0, 'The message explains why an order was delayed and gives a new date. | Email giải thích việc đơn hàng bị chậm và cung cấp ngày mới.'],
      ['What caused the delay?', ['A payment problem', 'Severe weather', 'An incorrect address', 'A product shortage'], 1, 'Severe weather stopped the carrier from reaching the center. | Thời tiết xấu khiến đơn vị vận chuyển không đến được trung tâm.'],
      ['What has the company refunded?', ['The full order price', 'The express-delivery charge', 'A membership fee', 'A warranty charge'], 1, 'The express-delivery charge was refunded. | Phí giao hàng nhanh đã được hoàn lại.'],
      ['How will the refund be paid?', ['By store credit', 'By check', 'To the original payment method', 'In cash at the warehouse'], 2, 'The refund goes to the original payment method. | Khoản hoàn tiền được trả về phương thức thanh toán ban đầu.'],
      ['How long may the refund take to appear?', ['One hour', 'One day', 'Three to five business days', 'Two weeks exactly'], 2, 'The message states three to five business days. | Email nêu thời gian từ ba đến năm ngày làm việc.'],
    ],
  };
}

const part7 = [];
for (let passageIndex = 0; passageIndex < 40; passageIndex += 1) {
  const variant = Math.floor(passageIndex / 5);
  const passage = part7Passage(passageIndex % 5, variant);
  passage.items.forEach((item, itemIndex) => {
    part7.push(question(
      `local-p7-${String(passageIndex * 5 + itemIndex + 1).padStart(3, '0')}`,
      7,
      passage.topic,
      passage.difficulty,
      item[0], item[1], item[2], item[3],
      { context: passage.context },
    ));
  });
}

function part3Passage(kind, i) {
  const company = companies[i];
  const date = dates[i];
  const location = locations[i];
  const person = people[i];

  if (kind === 0) return {
    topic: 'meetings', difficulty: 600,
    transcript: `Woman: Are you ready to discuss the quarterly budget on ${date}?\nMan: I have a client call that morning. Could we meet at two in the afternoon instead?\nWoman: Yes. Conference Room B is available then. I will update the calendar invitation now.`,
    items: [
      ['What are the speakers planning to discuss?', ['A client complaint', 'A quarterly budget', 'A training course', 'A delivery route'], 1, 'They are arranging a discussion about the quarterly budget. | Hai người đang sắp xếp cuộc họp về ngân sách quý.'],
      ['Why does the man want to change the meeting time?', ['He has a client call', 'He will be out of town', 'The room is being repaired', 'The report is incomplete'], 0, 'The man says he has a client call that morning. | Người đàn ông có cuộc gọi với khách hàng vào buổi sáng.'],
      ['When will the speakers most likely meet?', ['At 9 A.M.', 'At noon', 'At 2 P.M.', 'At 5 P.M.'], 2, 'The man suggests two in the afternoon and the woman agrees. | Hai người đồng ý gặp lúc 2 giờ chiều.'],
      ['Where will the meeting take place?', ['Conference Room B', 'A client office', 'The cafeteria', 'A hotel lobby'], 0, 'The woman says Conference Room B is available. | Người phụ nữ cho biết Phòng họp B còn trống.'],
      ['What will the woman probably do next?', ['Call a supplier', 'Update the calendar invitation', 'Prepare lunch', 'Cancel the budget review'], 1, 'She says she will update the invitation immediately. | Cô ấy sẽ cập nhật lời mời trên lịch.'],
    ],
  };

  if (kind === 1) return {
    topic: 'shipping', difficulty: 650,
    transcript: `Man: Hello, I am calling about an order from ${company}. It was supposed to arrive in ${location} yesterday.\nWoman: Let me check. The carrier reported a weather delay, but the package is now scheduled for ${date}.\nMan: I paid for express delivery.\nWoman: I understand. I will refund that charge to your card.`,
    items: [
      ['Why is the man calling?', ['To place a new order', 'To ask about a late delivery', 'To change a product color', 'To apply for a job'], 1, 'He is calling because his order did not arrive as expected. | Anh ấy gọi vì đơn hàng đến trễ.'],
      ['What caused the delay?', ['Bad weather', 'A payment issue', 'A wrong address', 'Low inventory'], 0, 'The carrier reported a weather delay. | Đơn vị vận chuyển báo chậm do thời tiết.'],
      ['What does the woman say about the package?', [`It will arrive on ${date}`, 'It was returned', 'It is at the store', 'It has not been shipped'], 0, `The new delivery date is ${date}. | Ngày giao hàng mới là ${date}.`],
      ['What service did the man purchase?', ['Gift wrapping', 'Express delivery', 'Installation', 'Insurance'], 1, 'The man states that he paid for express delivery. | Người đàn ông đã trả phí giao hàng nhanh.'],
      ['What will the woman do?', ['Send a replacement', 'Refund the delivery charge', 'Call the weather office', 'Cancel the order'], 1, 'She offers to refund the express-delivery charge. | Cô ấy sẽ hoàn lại phí giao hàng nhanh.'],
    ],
  };

  if (kind === 2) return {
    topic: 'travel', difficulty: 650,
    transcript: `Woman: Welcome to the ${location} Grand Hotel. How may I help you?\nMan: I have a reservation under ${person}, but my flight arrives after ten tonight.\nWoman: That is fine. I will note your late arrival. Would you also like me to reserve the airport shuttle?\nMan: Yes, please. My flight lands at nine thirty.`,
    items: [
      ['Where does the conversation take place?', ['At a hotel', 'At a bank', 'At a factory', 'At a restaurant'], 0, 'The woman welcomes the guest to a hotel. | Người phụ nữ chào khách tại khách sạn.'],
      ['What is the man concerned about?', ['The room price', 'A late arrival', 'A missing passport', 'The breakfast menu'], 1, 'His flight arrives late, so he will reach the hotel after ten. | Chuyến bay đến muộn nên anh ấy tới khách sạn sau 10 giờ.'],
      ['What will the woman add to the reservation?', ['A second room', 'A late-arrival note', 'A free dinner', 'An earlier checkout'], 1, 'She says she will note his late arrival. | Cô ấy sẽ ghi chú việc khách đến muộn.'],
      ['What additional service does the woman offer?', ['Laundry service', 'A city tour', 'An airport shuttle', 'Room service'], 2, 'She offers to reserve the airport shuttle. | Cô ấy đề nghị đặt xe đưa đón sân bay.'],
      ['When does the flight land?', ['At 8:30', 'At 9:00', 'At 9:30', 'At 10:30'], 2, 'The man says the flight lands at nine thirty. | Chuyến bay hạ cánh lúc 9 giờ 30.'],
    ],
  };

  if (kind === 3) return {
    topic: 'technology', difficulty: 700,
    transcript: `Man: The printer on the third floor has stopped working again.\nWoman: Did you submit a request to the technology team?\nMan: Yes, but ${person} said the replacement part will not arrive until ${date}.\nWoman: In that case, use the printer beside the reception desk. I will let the rest of the ${company} staff know.`,
    items: [
      ['What problem do the speakers discuss?', ['A broken printer', 'A missing invoice', 'A slow elevator', 'A lost key'], 0, 'The printer on the third floor is not working. | Máy in ở tầng ba bị hỏng.'],
      ['Who has been contacted?', ['The finance department', 'The technology team', 'A customer', 'The building owner'], 1, 'The man submitted a request to the technology team. | Người đàn ông đã gửi yêu cầu cho nhóm công nghệ.'],
      ['Why will the repair be delayed?', ['The office is closed', 'A part has not arrived', 'No request was submitted', 'The printer is in use'], 1, 'The needed replacement part will arrive later. | Linh kiện thay thế chưa tới.'],
      ['Which printer should employees use?', ['The one on the third floor', 'The one beside reception', 'The one in the warehouse', 'The one at home'], 1, 'The woman recommends the printer beside reception. | Người phụ nữ đề nghị dùng máy in cạnh quầy lễ tân.'],
      ['What will the woman probably do next?', ['Order paper', 'Inform the staff', 'Repair the printer herself', 'Call a customer'], 1, 'She says she will tell the rest of the staff. | Cô ấy sẽ thông báo cho các nhân viên khác.'],
    ],
  };

  return {
    topic: 'training', difficulty: 700,
    transcript: `Woman: Have you registered for the presentation workshop on ${date}?\nMan: Not yet. Is there still space in the afternoon session?\nWoman: Yes, but registration closes today. The workshop will be held at the ${company} training center in ${location}.\nMan: Great. I will sign up during my lunch break.`,
    items: [
      ['What are the speakers discussing?', ['A presentation workshop', 'A customer survey', 'A job interview', 'A product launch'], 0, 'They are discussing registration for a presentation workshop. | Hai người đang nói về hội thảo kỹ năng thuyết trình.'],
      ['Which session interests the man?', ['The morning session', 'The afternoon session', 'The weekend session', 'The online session'], 1, 'He asks whether the afternoon session still has space. | Anh ấy quan tâm đến buổi chiều.'],
      ['When does registration close?', ['Today', 'Tomorrow', `On ${date}`, 'Next month'], 0, 'The woman says registration closes today. | Người phụ nữ nói đăng ký đóng hôm nay.'],
      ['Where will the workshop be held?', [`At the ${company} training center`, 'At a hotel', 'At the man’s office', 'At a university'], 0, 'The woman names the company training center. | Địa điểm là trung tâm đào tạo của công ty.'],
      ['When will the man probably register?', ['Before breakfast', 'During lunch', 'After the workshop', 'Next week'], 1, 'He plans to sign up during his lunch break. | Anh ấy sẽ đăng ký trong giờ nghỉ trưa.'],
    ],
  };
}

function part4Passage(kind, i) {
  const company = companies[i];
  const date = dates[i];
  const location = locations[i];
  const person = people[i];

  if (kind === 0) return {
    topic: 'announcements', difficulty: 600,
    transcript: `Attention, ${company} employees. The ${location} office will close at three o'clock on ${date} so that the electrical system can be inspected. Please save your work and shut down all computers before leaving. Staff who normally work until five may complete their remaining hours from home.`,
    items: [
      ['Who is the announcement for?', [`${company} employees`, 'Hotel guests', 'Airline passengers', 'Job applicants'], 0, 'The opening addresses company employees. | Phần mở đầu hướng tới nhân viên công ty.'],
      ['Why will the office close early?', ['For an electrical inspection', 'For a holiday party', 'For staff training', 'For a customer visit'], 0, 'The electrical system will be inspected. | Hệ thống điện sẽ được kiểm tra.'],
      ['At what time will the office close?', ['At 2:00', 'At 3:00', 'At 4:00', 'At 5:00'], 1, 'The announcement gives a closing time of three o’clock. | Văn phòng đóng cửa lúc 3 giờ.'],
      ['What should staff do before leaving?', ['Move the furniture', 'Shut down computers', 'Submit expense reports', 'Call customers'], 1, 'Employees should save work and shut down computers. | Nhân viên cần lưu công việc và tắt máy tính.'],
      ['Where may employees finish their hours?', ['At home', 'At a cafe', 'At another branch', 'At the inspection site'], 0, 'The remaining hours may be completed from home. | Nhân viên có thể hoàn thành giờ làm tại nhà.'],
    ],
  };

  if (kind === 1) return {
    topic: 'advertisements', difficulty: 650,
    transcript: `This week only, visit the ${company} Home Store in ${location} for our annual office sale. Desks are twenty percent off, and desk chairs are fifteen percent off. Customers who spend more than two hundred dollars will receive free delivery. The sale ends on ${date}, so shop early for the best selection.`,
    items: [
      ['What is being advertised?', ['An office-furniture sale', 'A training course', 'A moving service', 'A business conference'], 0, 'The message advertises discounts on office furniture. | Bài nói quảng cáo giảm giá nội thất văn phòng.'],
      ['Which item is discounted by twenty percent?', ['Desk chairs', 'Desks', 'Lamps', 'Computers'], 1, 'Desks are twenty percent off. | Bàn làm việc được giảm 20 phần trăm.'],
      ['What do customers receive when spending over $200?', ['A free chair', 'Free delivery', 'A store membership', 'An extra discount'], 1, 'Orders over $200 include free delivery. | Đơn trên 200 đô la được giao miễn phí.'],
      ['When does the sale end?', [date, 'Today at noon', 'Next year', 'At the end of the month'], 0, `The sale ends on ${date}. | Đợt giảm giá kết thúc vào ${date}.`],
      ['Why are listeners advised to shop early?', ['The store closes at noon', 'To get the best selection', 'Delivery takes a month', 'Prices rise each morning'], 1, 'Shopping early provides the best selection. | Mua sớm giúp có nhiều lựa chọn nhất.'],
    ],
  };

  if (kind === 2) return {
    topic: 'airport', difficulty: 650,
    transcript: `May I have your attention, please. Flight 482 to ${location} will now depart from Gate 16 instead of Gate 12. Boarding will begin at six forty-five, approximately twenty minutes later than scheduled. Passengers who need assistance should speak with an airline representative at the information desk.`,
    items: [
      ['Where would this announcement most likely be heard?', ['At an airport', 'At a restaurant', 'At a bank', 'At a factory'], 0, 'The message concerns a flight, gate, and boarding. | Thông báo về chuyến bay, cửa ra máy bay và giờ lên máy bay.'],
      ['What has changed?', ['The destination', 'The gate number', 'The airline', 'The ticket price'], 1, 'The departure gate changed from 12 to 16. | Cửa ra máy bay đổi từ 12 sang 16.'],
      ['What is the new gate?', ['Gate 6', 'Gate 12', 'Gate 16', 'Gate 45'], 2, 'The flight will depart from Gate 16. | Chuyến bay khởi hành ở cửa 16.'],
      ['When will boarding begin?', ['At 6:25', 'At 6:45', 'At 7:05', 'At 7:45'], 1, 'Boarding begins at six forty-five. | Giờ lên máy bay là 6 giờ 45.'],
      ['Who should go to the information desk?', ['Passengers needing assistance', 'All flight attendants', 'Passengers buying food', 'Airport drivers'], 0, 'Passengers who need assistance are directed there. | Hành khách cần hỗ trợ nên tới quầy thông tin.'],
    ],
  };

  if (kind === 3) return {
    topic: 'events', difficulty: 700,
    transcript: `Welcome to the ${company} Small Business Forum in ${location}. Our first speaker, ${person}, will begin at nine thirty with a talk on digital marketing. The finance seminar has moved from Hall A to Hall C. Lunch will be served outside the main auditorium at twelve fifteen. Please keep your name badge visible throughout the day.`,
    items: [
      ['What event are listeners attending?', ['A small business forum', 'A music festival', 'A university exam', 'A product sale'], 0, 'The speaker welcomes listeners to a small business forum. | Người nói chào mừng người nghe tới diễn đàn doanh nghiệp nhỏ.'],
      ['What will the first speaker discuss?', ['Digital marketing', 'Office safety', 'Hotel management', 'International shipping'], 0, 'The first talk is about digital marketing. | Bài nói đầu tiên về tiếp thị số.'],
      ['Where will the finance seminar take place?', ['Hall A', 'Hall B', 'Hall C', 'The auditorium'], 2, 'The seminar has moved to Hall C. | Hội thảo tài chính chuyển sang Hội trường C.'],
      ['When will lunch be served?', ['At 9:30', 'At 11:00', 'At 12:15', 'At 1:30'], 2, 'Lunch is scheduled for twelve fifteen. | Bữa trưa diễn ra lúc 12 giờ 15.'],
      ['What are attendees asked to do?', ['Keep name badges visible', 'Turn in a report', 'Leave before lunch', 'Move to Hall A'], 0, 'Attendees should keep their badges visible all day. | Người tham dự cần đeo thẻ tên trong suốt ngày.'],
    ],
  };

  return {
    topic: 'voicemail', difficulty: 700,
    transcript: `Hello, this message is for ${person}. This is Daniel from the ${company} repair center. Your laptop is ready to be collected. We replaced the battery and updated the operating system. Our ${location} counter is open until seven this evening, but it will close at five on ${date}. Please bring your repair receipt when you come.`,
    items: [
      ['Why is the speaker calling?', ['A laptop repair is complete', 'A payment is overdue', 'A meeting was canceled', 'A new job is available'], 0, 'The speaker says the repaired laptop is ready. | Người nói báo máy tính đã sửa xong.'],
      ['What part was replaced?', ['The screen', 'The keyboard', 'The battery', 'The camera'], 2, 'The repair center replaced the battery. | Trung tâm đã thay pin.'],
      ['What else was done?', ['Files were deleted', 'The operating system was updated', 'A printer was installed', 'The laptop was exchanged'], 1, 'The operating system was updated. | Hệ điều hành đã được cập nhật.'],
      ['Until what time is the counter open today?', ['Five', 'Six', 'Seven', 'Eight'], 2, 'The counter is open until seven this evening. | Quầy mở tới 7 giờ tối nay.'],
      ['What should the customer bring?', ['A repair receipt', 'A passport', 'A new battery', 'A warranty advertisement'], 0, 'The message asks the customer to bring the repair receipt. | Khách hàng cần mang phiếu sửa chữa.'],
    ],
  };
}

const listening = [];
for (const part of [3, 4]) {
  for (let passageIndex = 0; passageIndex < 20; passageIndex += 1) {
    const variant = Math.floor(passageIndex / 5);
    const passage = part === 3 ? part3Passage(passageIndex % 5, variant) : part4Passage(passageIndex % 5, variant);
    passage.items.forEach((item, itemIndex) => {
      const offset = part === 3 ? 0 : 100;
      listening.push(question(
        `local-listening-${String(offset + passageIndex * 5 + itemIndex + 1).padStart(3, '0')}`,
        part,
        passage.topic,
        passage.difficulty,
        item[0], item[1], item[2], item[3],
        { type: 'listening', transcript: passage.transcript, tags: ['listening', `part-${part}`, passage.topic] },
      ));
    });
  }
}

const allQuestions = [...part5, ...part6, ...part7, ...listening];

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join('|') : String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function writeCsv(part, rows) {
  const headers = ['id', 'question', 'choiceA', 'choiceB', 'choiceC', 'choiceD', 'correctAnswer', 'explanation', 'part', 'type', 'topic', 'difficulty', 'context', 'transcript'];
  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push([
      row.id,
      row.question,
      ...row.choices,
      ['A', 'B', 'C', 'D'][row.correctAnswer],
      row.explanation,
      row.part,
      row.type,
      row.topic,
      row.difficulty,
      row.context ?? '',
      row.transcript ?? '',
    ].map(csvEscape).join(','));
  });
  const fileName = part === 'listening' ? 'toeic_listening_200.csv' : `toeic_part${part}_200.csv`;
  fs.writeFileSync(path.join(root, fileName), `${lines.join('\n')}\n`, 'utf8');
}

fs.mkdirSync(generatedDir, { recursive: true });
fs.writeFileSync(path.join(generatedDir, 'toeic-questions.json'), `${JSON.stringify(allQuestions, null, 2)}\n`, 'utf8');
writeCsv(5, part5);
writeCsv(6, part6);
writeCsv(7, part7);
writeCsv('listening', listening);

console.log(`Generated ${part5.length} Part 5, ${part6.length} Part 6, ${part7.length} Part 7, and ${listening.length} listening questions.`);
