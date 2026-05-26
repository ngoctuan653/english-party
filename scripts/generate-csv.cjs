const fs = require('fs');
const path = require('path');

// Helper to escape CSV values
function toCsvRow(arr) {
  return arr.map(val => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }).join(',');
}

// 100 Vocabulary Words: 10 topics * 5 levels * 2 words per combination
const VOCABULARY_DATA = [
  // --- BUSINESS ---
  // 500
  {
    word: 'Partner', pronunciation: 'ˈpɑːtnə(r)', partOfSpeech: 'noun',
    definition: 'A person or organization that takes part in an undertaking with another.',
    definitionNative: 'Đối tác, cộng sự',
    example: 'Our business partner in Japan helped us launch the new office.',
    exampleTranslation: 'Đối tác kinh doanh của chúng tôi tại Nhật Bản đã giúp chúng tôi thành lập văn phòng mới.',
    topic: 'business', difficulty: 500, synonyms: 'associate,colleague,ally'
  },
  {
    word: 'Contract', pronunciation: 'ˈkɒntrækt', partOfSpeech: 'noun',
    definition: 'A written or spoken agreement, especially one concerning employment, sales, or tenancy.',
    definitionNative: 'Hợp đồng, khế ước',
    example: 'Please read the terms of the contract before signing it.',
    exampleTranslation: 'Vui lòng đọc các điều khoản của hợp đồng trước khi ký.',
    topic: 'business', difficulty: 500, synonyms: 'agreement,deal,treaty'
  },
  // 600
  {
    word: 'Agreement', pronunciation: 'əˈɡriːmənt', partOfSpeech: 'noun',
    definition: 'A negotiated and typically legally binding arrangement between parties.',
    definitionNative: 'Sự đồng ý, thỏa thuận',
    example: 'Both companies signed a mutual agreement to share research data.',
    exampleTranslation: 'Cả hai công ty đã ký một thỏa thuận chung để chia sẻ dữ liệu nghiên cứu.',
    topic: 'business', difficulty: 600, synonyms: 'accord,settlement,contract'
  },
  {
    word: 'Executive', pronunciation: 'ɪɡˈzekjətɪv', partOfSpeech: 'noun',
    definition: 'A person with senior managerial responsibility in a business organization.',
    definitionNative: 'Người điều hành, giám đốc',
    example: 'The executive decided to hire more staff to meet the production goals.',
    exampleTranslation: 'Người điều hành đã quyết định thuê thêm nhân viên để đáp ứng các mục tiêu sản xuất.',
    topic: 'business', difficulty: 600, synonyms: 'director,manager,administrator'
  },
  // 700
  {
    word: 'Negotiate', pronunciation: 'nɪˈɡəʊʃɪeɪt', partOfSpeech: 'verb',
    definition: 'Obtain or bring about by discussion.',
    definitionNative: 'Đàm phán, thương lượng',
    example: 'We hope to negotiate a better deal with our main supplier.',
    exampleTranslation: 'Chúng tôi hy vọng sẽ thương lượng được một thỏa thuận tốt hơn với nhà cung cấp chính.',
    topic: 'business', difficulty: 700, synonyms: 'bargain,compromise,discuss'
  },
  {
    word: 'Transaction', pronunciation: 'trænˈzækʃn', partOfSpeech: 'noun',
    definition: 'An instance of buying or selling something; a business deal.',
    definitionNative: 'Giao dịch',
    example: 'The financial transaction was processed smoothly by the bank.',
    exampleTranslation: 'Giao dịch tài chính đã được ngân hàng xử lý một cách suôn sẻ.',
    topic: 'business', difficulty: 700, synonyms: 'deal,sale,trade'
  },
  // 800
  {
    word: 'Merge', pronunciation: 'mɜːdʒ', partOfSpeech: 'verb',
    definition: 'Combine or cause to combine to form a single entity.',
    definitionNative: 'Sáp nhập, hợp nhất',
    example: 'The two pharmaceutical companies planned to merge next year.',
    exampleTranslation: 'Hai công ty dược phẩm có kế hoạch sáp nhập vào năm tới.',
    topic: 'business', difficulty: 800, synonyms: 'combine,unite,join'
  },
  {
    word: 'Venture', pronunciation: 'ˈventʃə(r)', partOfSpeech: 'noun',
    definition: 'A business enterprise, typically one that involves risk.',
    definitionNative: 'Dự án kinh doanh mạo hiểm, liên doanh',
    example: 'Their joint venture into solar energy proved to be highly profitable.',
    exampleTranslation: 'Liên doanh của họ vào năng lượng mặt trời đã chứng minh là rất có lãi.',
    topic: 'business', difficulty: 800, synonyms: 'enterprise,project,undertaking'
  },
  // 900
  {
    word: 'Conglomerate', pronunciation: 'kənˈɡlɒmərət', partOfSpeech: 'noun',
    definition: 'A large corporation run as a single multinational entity, composed of diverse companies.',
    definitionNative: 'Tập đoàn đa ngành, tập đoàn kinh tế',
    example: 'The media conglomerate acquired three digital publishing platforms.',
    exampleTranslation: 'Tập đoàn truyền thông đã mua lại ba nền tảng xuất bản kỹ thuật số.',
    topic: 'business', difficulty: 900, synonyms: 'corporation,multinational,enterprise'
  },
  {
    word: 'Litigation', pronunciation: 'ˌlɪtɪˈɡeɪʃn', partOfSpeech: 'noun',
    definition: 'The process of taking legal action.',
    definitionNative: 'Sự tranh chấp, quá trình kiện tụng',
    example: 'The company settled the patent litigation out of court to save costs.',
    exampleTranslation: 'Công ty đã giải quyết tranh chấp bằng sáng chế ngoài tòa án để tiết kiệm chi phí.',
    topic: 'business', difficulty: 900, synonyms: 'lawsuit,legal action,prosecution'
  },

  // --- MEETINGS ---
  // 500
  {
    word: 'Agenda', pronunciation: 'əˈdʒendə', partOfSpeech: 'noun',
    definition: 'A list of items to be discussed at a formal meeting.',
    definitionNative: 'Chương trình nghị sự, lịch trình cuộc họp',
    example: 'The first item on the agenda is the approval of last month\'s minutes.',
    exampleTranslation: 'Mục đầu tiên trong chương trình nghị sự là thông qua biên bản cuộc họp tháng trước.',
    topic: 'meetings', difficulty: 500, synonyms: 'schedule,program,plan'
  },
  {
    word: 'Present', pronunciation: 'prɪˈzent', partOfSpeech: 'verb',
    definition: 'Show or offer something for others to scrutinize or consider.',
    definitionNative: 'Trình bày, thuyết trình',
    example: 'The team leader will present the new project design to the board.',
    exampleTranslation: 'Trưởng nhóm sẽ thuyết trình thiết kế dự án mới trước hội đồng quản trị.',
    topic: 'meetings', difficulty: 500, synonyms: 'display,introduce,show'
  },
  // 600
  {
    word: 'Session', pronunciation: 'ˈseʃn', partOfSpeech: 'noun',
    definition: 'A meeting of an official body, or a period spent doing a particular activity.',
    definitionNative: 'Phiên họp, buổi hội thảo',
    example: 'Please attend the training session on the new software this afternoon.',
    exampleTranslation: 'Vui lòng tham dự buổi đào tạo về phần mềm mới vào chiều nay.',
    topic: 'meetings', difficulty: 600, synonyms: 'period,meeting,class'
  },
  {
    word: 'Seminar', pronunciation: 'ˈsemɪnɑː(r)', partOfSpeech: 'noun',
    definition: 'A conference or other meeting for discussion or training.',
    definitionNative: 'Hội thảo, chuyên đề',
    example: 'The marketing seminar was attended by over one hundred local business owners.',
    exampleTranslation: 'Hội thảo tiếp thị đã có sự tham dự của hơn một trăm chủ doanh nghiệp địa phương.',
    topic: 'meetings', difficulty: 600, synonyms: 'workshop,conference,lecture'
  },
  // 700
  {
    word: 'Collaborate', pronunciation: 'kəˈlæbəreɪt', partOfSpeech: 'verb',
    definition: 'Work jointly on an activity or project, especially to produce something.',
    definitionNative: 'Hợp tác, cộng tác',
    example: 'Our team will collaborate with the design department on this campaign.',
    exampleTranslation: 'Nhóm của chúng tôi sẽ hợp tác với bộ phận thiết kế trong chiến dịch này.',
    topic: 'meetings', difficulty: 700, synonyms: 'cooperate,team up,combine'
  },
  {
    word: 'Postpone', pronunciation: 'pəʊˈspəʊn', partOfSpeech: 'verb',
    definition: 'Cause or arrange for something to take place at a time later than first scheduled.',
    definitionNative: 'Trì hoãn, hoãn lại',
    example: 'We had to postpone the meeting because the main director was sick.',
    exampleTranslation: 'Chúng tôi phải hoãn cuộc họp vì giám đốc chính bị ốm.',
    topic: 'meetings', difficulty: 700, synonyms: 'delay,defer,put off'
  },
  // 800
  {
    word: 'Adjourn', pronunciation: 'əˈdʒɜːn', partOfSpeech: 'verb',
    definition: 'Break off a meeting with the intention of resuming it later.',
    definitionNative: 'Hoãn, kết thúc tạm thời cuộc họp',
    example: 'Let\'s adjourn this session until tomorrow morning at nine.',
    exampleTranslation: 'Hãy hoãn phiên họp này cho đến chín giờ sáng mai.',
    topic: 'meetings', difficulty: 800, synonyms: 'suspend,pause,postpone'
  },
  {
    word: 'Consensus', pronunciation: 'kənˈsensəs', partOfSpeech: 'noun',
    definition: 'A general agreement among a group of people.',
    definitionNative: 'Sự đồng thuận, nhất trí',
    example: 'After hours of debate, we finally reached a consensus on the new budget.',
    exampleTranslation: 'Sau nhiều giờ tranh luận, chúng tôi cuối cùng đã đạt được sự đồng thuận về ngân sách mới.',
    topic: 'meetings', difficulty: 800, synonyms: 'agreement,harmony,unanimity'
  },
  // 900
  {
    word: 'Convene', pronunciation: 'kənˈviːn', partOfSpeech: 'verb',
    definition: 'Come or bring together for a meeting or activity; assemble.',
    definitionNative: 'Triệu tập, nhóm họp',
    example: 'The committee will convene next week to finalize the company policies.',
    exampleTranslation: 'Ủy ban sẽ triệu tập vào tuần tới để hoàn thiện các chính sách của công ty.',
    topic: 'meetings', difficulty: 900, synonyms: 'summon,assemble,gather'
  },
  {
    word: 'Unanimity', pronunciation: 'ˌjuːnəˈnɪməti', partOfSpeech: 'noun',
    definition: 'Agreement by all people involved; consensus.',
    definitionNative: 'Sự nhất trí hoàn toàn',
    example: 'The board passed the resolution with absolute unanimity.',
    exampleTranslation: 'Hội đồng quản trị đã thông qua nghị quyết với sự nhất trí hoàn toàn.',
    topic: 'meetings', difficulty: 900, synonyms: 'accord,consensus,agreement'
  },

  // --- OFFICE ---
  // 500
  {
    word: 'Document', pronunciation: 'ˈdɒkjumənt', partOfSpeech: 'noun',
    definition: 'A piece of written, printed, or electronic matter that provides information or evidence.',
    definitionNative: 'Tài liệu, hồ sơ',
    example: 'Please send the signed document back to the human resources department.',
    exampleTranslation: 'Vui lòng gửi lại tài liệu đã ký cho bộ phận nhân sự.',
    topic: 'office', difficulty: 500, synonyms: 'file,paper,record'
  },
  {
    word: 'Submit', pronunciation: 'səbˈmɪt', partOfSpeech: 'verb',
    definition: 'Present a proposal, application, or other document for consideration or judgment.',
    definitionNative: 'Nộp, đệ trình',
    example: 'All employees must submit their expense reports by the end of the week.',
    exampleTranslation: 'Tất cả nhân viên phải nộp báo cáo chi phí của họ trước cuối tuần.',
    topic: 'office', difficulty: 500, synonyms: 'present,hand in,tender'
  },
  // 600
  {
    word: 'Employee', pronunciation: 'ɪmˈplɔɪiː', partOfSpeech: 'noun',
    definition: 'A person employed for wages or salary, especially at non-executive level.',
    definitionNative: 'Nhân viên, người lao động',
    example: 'Every new employee is required to complete the orientation program.',
    exampleTranslation: 'Mỗi nhân viên mới đều phải hoàn thành chương trình định hướng.',
    topic: 'office', difficulty: 600, synonyms: 'worker,staff member,hire'
  },
  {
    word: 'Coordinate', pronunciation: 'kəʊˈɔːdɪneɪt', partOfSpeech: 'verb',
    definition: 'Bring the different elements of a complex activity or organization into a relationship that will ensure efficiency.',
    definitionNative: 'Phối hợp, điều phối',
    example: 'We need to coordinate our efforts to finish the project on time.',
    exampleTranslation: 'Chúng ta cần phối hợp các nỗ lực để hoàn thành dự án đúng hạn.',
    topic: 'office', difficulty: 600, synonyms: 'organize,harmonize,integrate'
  },
  // 700
  {
    word: 'Delegate', pronunciation: 'ˈdelɪɡət', partOfSpeech: 'verb',
    definition: 'Entrust a task or responsibility to another person, typically one who is less senior.',
    definitionNative: 'Ủy thác, phân công công việc',
    example: 'An effective manager knows when to delegate tasks to assistants.',
    exampleTranslation: 'Một nhà quản lý hiệu quả biết khi nào nên phân công nhiệm vụ cho trợ lý.',
    topic: 'office', difficulty: 700, synonyms: 'assign,entrust,transfer'
  },
  {
    word: 'Supervise', pronunciation: 'ˈsuːpəvaɪz', partOfSpeech: 'verb',
    definition: 'Observe and direct the execution of a task, project, or activity.',
    definitionNative: 'Giám sát, quản lý',
    example: 'A senior engineer was appointed to supervise the construction work.',
    exampleTranslation: 'Một kỹ sư cao cấp đã được bổ nhiệm để giám sát công việc xây dựng.',
    topic: 'office', difficulty: 700, synonyms: 'oversee,manage,monitor'
  },
  // 800
  {
    word: 'Personnel', pronunciation: 'ˌpɜːsəˈnel', partOfSpeech: 'noun',
    definition: 'People employed in an organization or engaged in an organized undertaking.',
    definitionNative: 'Nhân sự, toàn bộ nhân viên',
    example: 'Only authorized personnel are allowed inside the server room.',
    exampleTranslation: 'Chỉ nhân sự có thẩm quyền mới được phép vào trong phòng máy chủ.',
    topic: 'office', difficulty: 800, synonyms: 'staff,workforce,employees'
  },
  {
    word: 'Workflow', pronunciation: 'ˈwɜːkfləʊ', partOfSpeech: 'noun',
    definition: 'The sequence of industrial, administrative, or other processes through which a piece of work passes from initiation to completion.',
    definitionNative: 'Quy trình công việc',
    example: 'The new management system significantly improved our daily office workflow.',
    exampleTranslation: 'Hệ thống quản lý mới đã cải thiện đáng kể quy trình công việc văn phòng hàng ngày của chúng tôi.',
    topic: 'office', difficulty: 800, synonyms: 'process,procedure,routine'
  },
  // 900
  {
    word: 'Hierarchy', pronunciation: 'ˈhaɪərɑːki', partOfSpeech: 'noun',
    definition: 'A system in which members of an organization or society are ranked according to relative status or authority.',
    definitionNative: 'Hệ thống cấp bậc, thứ bậc',
    example: 'The firm has a strict corporate hierarchy, with several levels of management.',
    exampleTranslation: 'Công ty có một hệ thống cấp bậc nghiêm ngặt, với nhiều cấp quản lý.',
    topic: 'office', difficulty: 900, synonyms: 'pecking order,ranking,gradation'
  },
  {
    word: 'Bureaucracy', pronunciation: 'bjʊəˈrɒkrəsi', partOfSpeech: 'noun',
    definition: 'A system of government or administration in which most of the important decisions are made by state officials rather than by elected representatives, characterized by complex rules.',
    definitionNative: 'Thủ tục hành chính phức tạp, quan liêu',
    example: 'We had to deal with a lot of administrative bureaucracy to get the business permit.',
    exampleTranslation: 'Chúng tôi phải giải quyết rất nhiều thủ tục hành chính phức tạp để có được giấy phép kinh doanh.',
    topic: 'office', difficulty: 900, synonyms: 'red tape,administration,officialdom'
  },

  // --- FINANCE ---
  // 500
  {
    word: 'Budget', pronunciation: 'ˈbʌdʒɪt', partOfSpeech: 'noun',
    definition: 'An estimate of income and expenditure for a set period of time.',
    definitionNative: 'Ngân sách',
    example: 'The marketing team operates on a very tight annual budget.',
    exampleTranslation: 'Đội ngũ tiếp thị hoạt động với ngân sách hàng năm rất eo hẹp.',
    topic: 'finance', difficulty: 500, synonyms: 'financial plan,allocation,funds'
  },
  {
    word: 'Expense', pronunciation: 'ɪkˈspens', partOfSpeech: 'noun',
    definition: 'The cost required for something; the money spent on something.',
    definitionNative: 'Chi phí, khoản chi tiêu',
    example: 'The company reimburses employees for any travel expenses incurred.',
    exampleTranslation: 'Công ty hoàn trả cho nhân viên bất kỳ chi phí đi lại nào phát sinh.',
    topic: 'finance', difficulty: 500, synonyms: 'cost,expenditure,outlay'
  },
  // 600
  {
    word: 'Profit', pronunciation: 'ˈprɒfɪt', partOfSpeech: 'noun',
    definition: 'A financial gain, especially the difference between the amount earned and the amount spent in buying, operating, or producing something.',
    definitionNative: 'Lợi nhuận, tiền lãi',
    example: 'The retail chain reported a record profit for the third consecutive quarter.',
    exampleTranslation: 'Chuỗi bán lẻ đã báo cáo lợi nhuận kỷ lục trong quý thứ ba liên tiếp.',
    topic: 'finance', difficulty: 600, synonyms: 'gain,earnings,yield'
  },
  {
    word: 'Revenue', pronunciation: 'ˈrevənjuː', partOfSpeech: 'noun',
    definition: 'Income, especially when of a company or organization and of a substantial nature.',
    definitionNative: 'Doanh thu',
    example: 'The expansion of online sales boosted the firm\'s quarterly revenue.',
    exampleTranslation: 'Việc mở rộng bán hàng trực tuyến đã thúc đẩy doanh thu hàng quý của công ty.',
    topic: 'finance', difficulty: 600, synonyms: 'income,turnover,proceeds'
  },
  // 700
  {
    word: 'Evaluate', pronunciation: 'ɪˈvæljueɪt', partOfSpeech: 'verb',
    definition: 'Form an idea of the amount, number, or value of; assess.',
    definitionNative: 'Đánh giá, định giá',
    example: 'Financial analysts were hired to evaluate the investment project.',
    exampleTranslation: 'Các nhà phân tích tài chính đã được thuê để đánh giá dự án đầu tư.',
    topic: 'finance', difficulty: 700, synonyms: 'assess,appraise,estimate'
  },
  {
    word: 'Calculate', pronunciation: 'ˈkælkjuleɪt', partOfSpeech: 'verb',
    definition: 'Determine the amount or number of something mathematically.',
    definitionNative: 'Tính toán',
    example: 'We need to calculate the interest rates before signing the loan contract.',
    exampleTranslation: 'Chúng ta cần tính toán lãi suất trước khi ký hợp đồng vay.',
    topic: 'finance', difficulty: 700, synonyms: 'compute,reckon,work out'
  },
  // 800
  {
    word: 'Deficit', pronunciation: 'ˈdefɪsɪt', partOfSpeech: 'noun',
    definition: 'The amount by which something, especially a sum of money, is too small.',
    definitionNative: 'Sự thâm hụt, thâm hụt tài chính',
    example: 'The government is taking measures to reduce the current account deficit.',
    exampleTranslation: 'Chính phủ đang thực hiện các biện pháp để giảm thâm hụt tài khoản vãng lai.',
    topic: 'finance', difficulty: 800, synonyms: 'shortfall,shortage,loss'
  },
  {
    word: 'Asset', pronunciation: 'ˈæset', partOfSpeech: 'noun',
    definition: 'A useful or valuable quality, person, or thing; property owned by a person or company.',
    definitionNative: 'Tài sản',
    example: 'Intellectual property is a key asset of this technology firm.',
    exampleTranslation: 'Sở hữu trí tuệ là một tài sản chính của công ty công nghệ này.',
    topic: 'finance', difficulty: 800, synonyms: 'property,resource,holding'
  },
  // 900
  {
    word: 'Liability', pronunciation: 'ˌlaɪəˈbɪləti', partOfSpeech: 'noun',
    definition: 'The state of being responsible for something, especially by law, or financial debts.',
    definitionNative: 'Nghĩa vụ pháp lý, khoản nợ phải trả',
    example: 'The company balance sheet lists both assets and liabilities.',
    exampleTranslation: 'Bảng cân đối kế toán của công ty liệt kê cả tài sản và nợ phải trả.',
    topic: 'finance', difficulty: 900, synonyms: 'debt,obligation,responsibility'
  },
  {
    word: 'Depreciation', pronunciation: 'dɪˌpriːʃiˈeɪʃn', partOfSpeech: 'noun',
    definition: 'A reduction in the value of an asset over time, especially due to wear and tear.',
    definitionNative: 'Sự khấu hao, giảm giá trị tài sản',
    example: 'Computers show rapid depreciation, losing half their value within a year.',
    exampleTranslation: 'Máy tính có tốc độ khấu hao nhanh, mất nửa giá trị trong vòng một năm.',
    topic: 'finance', difficulty: 900, synonyms: 'devaluation,wear and tear,drop in value'
  },

  // --- MARKETING ---
  // 500
  {
    word: 'Brand', pronunciation: 'brænd', partOfSpeech: 'noun',
    definition: 'A type of product manufactured by a particular company under a particular name.',
    definitionNative: 'Thương hiệu, nhãn hiệu',
    example: 'Consumers recognize this brand for its durability and good service.',
    exampleTranslation: 'Người tiêu dùng nhận ra thương hiệu này vì độ bền và dịch vụ tốt.',
    topic: 'marketing', difficulty: 500, synonyms: 'make,label,trademark'
  },
  {
    word: 'Target', pronunciation: 'ˈtɑːɡɪt', partOfSpeech: 'noun',
    definition: 'A person, object, or place selected as the aim or focus of attention.',
    definitionNative: 'Mục tiêu, đối tượng hướng tới',
    example: 'Young professionals are our primary target for the new fitness app.',
    exampleTranslation: 'Các chuyên gia trẻ tuổi là mục tiêu chính của chúng tôi cho ứng dụng thể dục mới.',
    topic: 'marketing', difficulty: 500, synonyms: 'goal,objective,aim'
  },
  // 600
  {
    word: 'Campaign', pronunciation: 'kæmˈpeɪn', partOfSpeech: 'noun',
    definition: 'An organized course of action to achieve a particular goal, especially advertising.',
    definitionNative: 'Chiến dịch, chiến dịch quảng cáo',
    example: 'The email marketing campaign generated hundreds of new sales leads.',
    exampleTranslation: 'Chiến dịch tiếp thị qua email đã tạo ra hàng trăm khách hàng tiềm năng mới.',
    topic: 'marketing', difficulty: 600, synonyms: 'drive,crusade,effort'
  },
  {
    word: 'Feedback', pronunciation: 'ˈfiːdbæk', partOfSpeech: 'noun',
    definition: 'Information about reactions to a product or service, used as a basis for improvement.',
    definitionNative: 'Phản hồi, ý kiến nhận xét',
    example: 'We analyzed the customer feedback to optimize our service features.',
    exampleTranslation: 'Chúng tôi đã phân tích phản hồi của khách hàng để tối ưu hóa các tính năng dịch vụ.',
    topic: 'marketing', difficulty: 600, synonyms: 'response,comments,reviews'
  },
  // 700
  {
    word: 'Strategic', pronunciation: 'strəˈtiːdʒɪk', partOfSpeech: 'adjective',
    definition: 'Relating to the identification of long-term or overall aims and the means of achieving them.',
    definitionNative: 'Mang tính chiến lược',
    example: 'The company made a strategic decision to expand into European markets.',
    exampleTranslation: 'Công ty đã đưa ra quyết định chiến lược để mở rộng sang thị trường châu Âu.',
    topic: 'marketing', difficulty: 700, synonyms: 'tactical,planned,calculated'
  },
  {
    word: 'Innovative', pronunciation: 'ˈɪnəveɪtɪv', partOfSpeech: 'adjective',
    definition: 'Introducing new ideas or methods; original and creative.',
    definitionNative: 'Sáng tạo, đổi mới',
    example: 'Our agency created an innovative promotional video that went viral.',
    exampleTranslation: 'Đại lý của chúng tôi đã tạo ra một video quảng cáo sáng tạo được lan truyền rộng rãi.',
    topic: 'marketing', difficulty: 700, synonyms: 'creative,original,novel'
  },
  // 800
  {
    word: 'Advertise', pronunciation: 'ˈædvətaɪz', partOfSpeech: 'verb',
    definition: 'Describe or draw attention to a product or service in order to promote sales.',
    definitionNative: 'Quảng cáo',
    example: 'It is highly effective to advertise products on social media platforms.',
    exampleTranslation: 'Quảng cáo sản phẩm trên các nền tảng mạng xã hội mang lại hiệu quả rất cao.',
    topic: 'marketing', difficulty: 800, synonyms: 'promote,publicize,broadcast'
  },
  {
    word: 'Consumer', pronunciation: 'kənˈsjuːmə(r)', partOfSpeech: 'noun',
    definition: 'A person who purchases goods and services for personal use.',
    definitionNative: 'Người tiêu dùng',
    example: 'Consumer behavior has changed significantly with the rise of online shops.',
    exampleTranslation: 'Hành vi của người tiêu dùng đã thay đổi đáng kể với sự phát triển của các cửa hàng trực tuyến.',
    topic: 'marketing', difficulty: 800, synonyms: 'buyer,customer,purchaser'
  },
  // 900
  {
    word: 'Saturation', pronunciation: 'ˌsætʃəˈreɪʃn', partOfSpeech: 'noun',
    definition: 'The state that occurs when no more of something can be absorbed, combined with, or accepted.',
    definitionNative: 'Sự bão hòa (thị trường)',
    example: 'Market saturation has made it difficult for new smartphone brands to emerge.',
    exampleTranslation: 'Sự bão hòa thị trường đã khiến các thương hiệu điện thoại thông minh mới khó xuất hiện.',
    topic: 'marketing', difficulty: 900, synonyms: 'overflow,surplus,glut'
  },
  {
    word: 'Demographics', pronunciation: 'ˌdeməˈɡræfɪks', partOfSpeech: 'noun',
    definition: 'Statistical data relating to the population and particular groups within it.',
    definitionNative: 'Số liệu nhân khẩu học',
    example: 'The marketing report details the demographics of our primary online buyers.',
    exampleTranslation: 'Báo cáo tiếp thị chi tiết số liệu nhân khẩu học của những người mua hàng trực tuyến chính của chúng tôi.',
    topic: 'marketing', difficulty: 900, synonyms: 'population statistics,user profile'
  },

  // --- TRAVEL ---
  // 500
  {
    word: 'Ticket', pronunciation: 'ˈtɪkɪt', partOfSpeech: 'noun',
    definition: 'A piece of paper or voucher that shows that one has paid for a journey or entry.',
    definitionNative: 'Vé (máy bay, tàu, xe)',
    example: 'Remember to print your boarding ticket before going to the train station.',
    exampleTranslation: 'Hãy nhớ in vé lên tàu trước khi đến ga tàu.',
    topic: 'travel', difficulty: 500, synonyms: 'pass,voucher,coupon'
  },
  {
    word: 'Flight', pronunciation: 'flaɪt', partOfSpeech: 'noun',
    definition: 'An act of passing through the air by a plane, or a scheduled journey.',
    definitionNative: 'Chuyến bay',
    example: 'Her flight to Chicago was delayed by three hours due to heavy rain.',
    exampleTranslation: 'Chuyến bay của cô ấy đến Chicago đã bị hoãn ba tiếng do mưa lớn.',
    topic: 'travel', difficulty: 500, synonyms: 'air journey,trip,voyage'
  },
  // 600
  {
    word: 'Luggage', pronunciation: 'ˈlʌɡɪdʒ', partOfSpeech: 'noun',
    definition: 'Suitcases and bags containing personal belongings for a journey.',
    definitionNative: 'Hành lý',
    example: 'Passengers are requested to keep their luggage with them at all times.',
    exampleTranslation: 'Hành khách được yêu cầu luôn mang theo hành lý bên mình.',
    topic: 'travel', difficulty: 600, synonyms: 'baggage,suitcases,gear'
  },
  {
    word: 'Itinerary', pronunciation: 'aɪˈtɪnərəri', partOfSpeech: 'noun',
    definition: 'A planned route or journey details, including dates and times.',
    definitionNative: 'Lịch trình chuyến đi',
    example: 'The travel agent sent us the detailed travel itinerary for our tour.',
    exampleTranslation: 'Đại lý du lịch đã gửi cho chúng tôi lịch trình chi tiết cho chuyến tham quan của chúng tôi.',
    topic: 'travel', difficulty: 600, synonyms: 'schedule,route,plan'
  },
  // 700
  {
    word: 'Destination', pronunciation: 'ˌdestɪˈneɪʃn', partOfSpeech: 'noun',
    definition: 'The place to which someone or something is going or being sent.',
    definitionNative: 'Điểm đến, nơi đến',
    example: 'Paris remains the most popular travel destination in Europe.',
    exampleTranslation: 'Paris vẫn là điểm đến du lịch phổ biến nhất ở châu Âu.',
    topic: 'travel', difficulty: 700, synonyms: 'goal,terminus,stop'
  },
  {
    word: 'Reservation', pronunciation: 'ˌrezəˈveɪʃn', partOfSpeech: 'noun',
    definition: 'An arrangement to secure something, especially a room or seat, in advance.',
    definitionNative: 'Sự đặt trước, đặt chỗ',
    example: 'I made a dinner reservation for four people at the Italian restaurant.',
    exampleTranslation: 'Tôi đã đặt bàn ăn tối cho bốn người tại nhà hàng Ý.',
    topic: 'travel', difficulty: 700, synonyms: 'booking,appointment,booking slot'
  },
  // 800
  {
    word: 'Transit', pronunciation: 'ˈtrænzɪt', partOfSpeech: 'noun',
    definition: 'The carrying of people or things from one place to another, or passing through a place.',
    definitionNative: 'Sự quá cảnh, đi qua',
    example: 'We had a five-hour transit at the Tokyo airport before flying to London.',
    exampleTranslation: 'Chúng tôi đã quá cảnh năm tiếng tại sân bay Tokyo trước khi bay đi London.',
    topic: 'travel', difficulty: 800, synonyms: 'passage,journey,movement'
  },
  {
    word: 'Accommodate', pronunciation: 'əˈkɒmədeɪt', partOfSpeech: 'verb',
    definition: 'Provide lodging or sufficient space for someone.',
    definitionNative: 'Cung cấp chỗ ăn ở, chứa được',
    example: 'The hotel is large enough to accommodate up to five hundred guests.',
    exampleTranslation: 'Khách sạn đủ lớn để cung cấp chỗ ở cho tối đa năm trăm khách.',
    topic: 'travel', difficulty: 800, synonyms: 'lodge,house,quarter'
  },
  // 900
  {
    word: 'Expedition', pronunciation: 'ˌekspəˈdɪʃn', partOfSpeech: 'noun',
    definition: 'A journey undertaken by a group of people with a particular purpose, especially exploration or research.',
    definitionNative: 'Cuộc thám hiểm, chuyến đi thám hiểm',
    example: 'The scientific expedition discovered several unknown species in the rainforest.',
    exampleTranslation: 'Cuộc thám hiểm khoa học đã phát hiện ra một số loài chưa từng biết trong rừng nhiệt đới.',
    topic: 'travel', difficulty: 900, synonyms: 'journey,voyage,exploration'
  },
  {
    word: 'Disembarkation', pronunciation: 'ˌdɪsˌembɑːˈkeɪʃn', partOfSpeech: 'noun',
    definition: 'The process of leaving a ship or aircraft after a journey.',
    definitionNative: 'Sự xuống tàu, xuống máy bay',
    example: 'Passengers must show their passports immediately upon disembarkation.',
    exampleTranslation: 'Khách hàng phải xuất trình hộ chiếu ngay sau khi xuống máy bay.',
    topic: 'travel', difficulty: 900, synonyms: 'landing,debarkation,departure'
  },

  // --- TECHNOLOGY ---
  // 500
  {
    word: 'System', pronunciation: 'ˈsɪstəm', partOfSpeech: 'noun',
    definition: 'A set of things working together as parts of a mechanism or an interconnecting network.',
    definitionNative: 'Hệ thống',
    example: 'The computer system crashed due to a power outage.',
    exampleTranslation: 'Hệ thống máy tính đã bị hỏng do mất điện.',
    topic: 'technology', difficulty: 500, synonyms: 'network,mechanism,structure'
  },
  {
    word: 'Software', pronunciation: 'ˈsɒftweə(r)', partOfSpeech: 'noun',
    definition: 'The programs and other operating information used by a computer.',
    definitionNative: 'Phần mềm',
    example: 'We need to install the latest antivirus software on all office devices.',
    exampleTranslation: 'Chúng tôi cần cài đặt phần mềm diệt vi-rút mới nhất trên tất cả các thiết bị văn phòng.',
    topic: 'technology', difficulty: 500, synonyms: 'program,applications,code'
  },
  // 600
  {
    word: 'Program', pronunciation: 'ˈprəʊɡræm', partOfSpeech: 'noun',
    definition: 'A series of coded software instructions to control the operation of a computer.',
    definitionNative: 'Chương trình',
    example: 'This program helps office workers manage their tasks more efficiently.',
    exampleTranslation: 'Chương trình này giúp nhân viên văn phòng quản lý công việc của họ hiệu quả hơn.',
    topic: 'technology', difficulty: 600, synonyms: 'application,software,system'
  },
  {
    word: 'Network', pronunciation: 'ˈnetwɜːk', partOfSpeech: 'noun',
    definition: 'A group of two or more computer systems linked together.',
    definitionNative: 'Mạng lưới, mạng máy tính',
    example: 'The company security team monitors our internal network for any threats.',
    exampleTranslation: 'Đội ngũ bảo mật công ty giám sát mạng lưới nội bộ của chúng tôi để phát hiện bất kỳ mối đe dọa nào.',
    topic: 'technology', difficulty: 600, synonyms: 'system,connection,web'
  },
  // 700
  {
    word: 'Secure', pronunciation: 'sɪˈkjʊə(r)', partOfSpeech: 'adjective',
    definition: 'Protected against attack or other criminal activity; safe.',
    definitionNative: 'Bảo mật, an toàn',
    example: 'Please make sure you are using a secure server connection for transactions.',
    exampleTranslation: 'Vui lòng đảm bảo bạn đang sử dụng kết nối máy chủ bảo mật để giao dịch.',
    topic: 'technology', difficulty: 700, synonyms: 'safe,protected,guarded'
  },
  {
    word: 'Database', pronunciation: 'ˈdeɪtəbeɪs', partOfSpeech: 'noun',
    definition: 'A structured set of data held in a computer, especially one that is accessible in various ways.',
    definitionNative: 'Cơ sở dữ liệu',
    example: 'All customer profile records are stored in a secure SQL database.',
    exampleTranslation: 'Tất cả các hồ sơ thông tin khách hàng đều được lưu trữ trong một cơ sở dữ liệu SQL bảo mật.',
    topic: 'technology', difficulty: 700, synonyms: 'data storage,data bank,archive'
  },
  // 800
  {
    word: 'Implement', pronunciation: 'ˈɪmplɪment', partOfSpeech: 'verb',
    definition: 'Put a plan or system into effect.',
    definitionNative: 'Thực hiện, triển khai áp dụng',
    example: 'The IT department decided to implement a two-factor authentication system.',
    exampleTranslation: 'Bộ phận CNTT đã quyết định triển khai hệ thống xác thực hai yếu tố.',
    topic: 'technology', difficulty: 800, synonyms: 'execute,apply,enforce'
  },
  {
    word: 'Optimize', pronunciation: 'ˈɒptɪmaɪz', partOfSpeech: 'verb',
    definition: 'Make the best or most effective use of a situation or resource; speed up program execution.',
    definitionNative: 'Tối ưu hóa',
    example: 'Developers worked hard to optimize the website code for mobile users.',
    exampleTranslation: 'Các lập trình viên đã làm việc chăm chỉ để tối ưu hóa mã nguồn trang web cho người dùng di động.',
    topic: 'technology', difficulty: 800, synonyms: 'streamline,improve,perfect'
  },
  // 900
  {
    word: 'Encryption', pronunciation: 'ɪnˈkrɪpʃn', partOfSpeech: 'noun',
    definition: 'The process of converting information or data into a code, especially to prevent unauthorized access.',
    definitionNative: 'Sự mã hóa bảo mật',
    example: 'Advanced encryption standards prevent external users from reading our emails.',
    exampleTranslation: 'Tiêu chuẩn mã hóa nâng cao ngăn chặn người dùng bên ngoài đọc email của chúng tôi.',
    topic: 'technology', difficulty: 900, synonyms: 'coding,cipher,security lock'
  },
  {
    word: 'Compatibility', pronunciation: 'kəmˌpætəˈbɪləti', partOfSpeech: 'noun',
    definition: 'A state in which two things are able to exist or occur together without problems or conflict.',
    definitionNative: 'Tính tương thích',
    example: 'The software developer tested the application compatibility with older operating systems.',
    exampleTranslation: 'Lập trình viên phần mềm đã kiểm tra tính tương thích của ứng dụng với các hệ điều hành cũ hơn.',
    topic: 'technology', difficulty: 900, synonyms: 'harmony,accord,suitability'
  },

  // --- SHIPPING ---
  // 500
  {
    word: 'Deliver', pronunciation: 'dɪˈlɪvə(r)', partOfSpeech: 'verb',
    definition: 'Bring and hand over a letter, parcel, or goods to the proper recipient.',
    definitionNative: 'Giao hàng',
    example: 'The local courier promised to deliver the package by tomorrow noon.',
    exampleTranslation: 'Người đưa thư địa phương đã hứa sẽ giao gói hàng trước trưa mai.',
    topic: 'shipping', difficulty: 500, synonyms: 'hand over,bring,transport'
  },
  {
    word: 'Cargo', pronunciation: 'ˈkɑːɡəʊ', partOfSpeech: 'noun',
    definition: 'Goods carried on a ship, aircraft, or motor vehicle.',
    definitionNative: 'Hàng hóa (vận tải)',
    example: 'The cargo ship was loaded with containers of electronic goods.',
    exampleTranslation: 'Tàu chở hàng đã được bốc xếp các công-te-nơ hàng điện tử.',
    topic: 'shipping', difficulty: 500, synonyms: 'freight,goods,shipment'
  },
  // 600
  {
    word: 'Carrier', pronunciation: 'ˈkæriə(r)', partOfSpeech: 'noun',
    definition: 'A person or company that undertakes the transport of goods or passengers.',
    definitionNative: 'Nhà vận chuyển, hãng vận tải',
    example: 'We need to select a reliable shipping carrier for our international exports.',
    exampleTranslation: 'Chúng tôi cần chọn một nhà vận chuyển đáng tin cậy cho các mặt hàng xuất khẩu quốc tế.',
    topic: 'shipping', difficulty: 600, synonyms: 'shipper,transporter,courier'
  },
  {
    word: 'Transport', pronunciation: 'ˈtrænspɔːt', partOfSpeech: 'verb',
    definition: 'Take or carry people or goods from one place to another by vehicle.',
    definitionNative: 'Vận chuyển, chuyên chở',
    example: 'Trucks are used to transport materials from the factory to the warehouse.',
    exampleTranslation: 'Xe tải được sử dụng để vận chuyển vật liệu từ nhà máy đến nhà kho.',
    topic: 'shipping', difficulty: 600, synonyms: 'carry,convey,move'
  },
  // 700
  {
    word: 'Customs', pronunciation: 'ˈkʌstəmz', partOfSpeech: 'noun',
    definition: 'The official department that administers and collects duties on imported goods.',
    definitionNative: 'Hải quan, thuế hải quan',
    example: 'The shipment of foreign parts is currently held up at customs.',
    exampleTranslation: 'Lô hàng phụ tùng nước ngoài hiện đang bị giữ lại tại hải quan.',
    topic: 'shipping', difficulty: 700, synonyms: 'border control,import duty'
  },
  {
    word: 'Shipment', pronunciation: 'ˈʃɪpmənt', partOfSpeech: 'noun',
    definition: 'A batch of goods destined for or delivered to a customer.',
    definitionNative: 'Sự vận chuyển, lô hàng',
    example: 'The warehouse manager confirmed that the shipment had arrived safely.',
    exampleTranslation: 'Quản lý kho đã xác nhận rằng lô hàng đã đến nơi an toàn.',
    topic: 'shipping', difficulty: 700, synonyms: 'delivery,cargo,consignment'
  },
  // 800
  {
    word: 'Inventory', pronunciation: 'ˈɪnvəntri', partOfSpeech: 'noun',
    definition: 'A complete list of items such as property, goods in stock.',
    definitionNative: 'Hàng tồn kho, bảng kiểm kê',
    example: 'We perform a full inventory check at the warehouse twice a year.',
    exampleTranslation: 'Chúng tôi thực hiện kiểm tra hàng tồn kho đầy đủ tại nhà kho hai lần một năm.',
    topic: 'shipping', difficulty: 800, synonyms: 'stock,supply,list'
  },
  {
    word: 'Dispatch', pronunciation: 'dɪˈspætʃ', partOfSpeech: 'verb',
    definition: 'Send off to a destination or for a purpose.',
    definitionNative: 'Gửi đi, phái đi, điều phối hàng',
    example: 'The shipping center will dispatch your order early tomorrow morning.',
    exampleTranslation: 'Trung tâm vận chuyển sẽ gửi đơn hàng của bạn đi vào sáng sớm mai.',
    topic: 'shipping', difficulty: 800, synonyms: 'send,forward,ship'
  },
  // 900
  {
    word: 'Consignment', pronunciation: 'kənˈsaɪnmənt', partOfSpeech: 'noun',
    definition: 'A batch of goods sent by water, land, or air, typically to an agent for sale.',
    definitionNative: 'Lô hàng ký gửi',
    example: 'We received a large consignment of office chairs from the manufacturer.',
    exampleTranslation: 'Chúng tôi đã nhận được một lô hàng ký gửi lớn ghế văn phòng từ nhà sản xuất.',
    topic: 'shipping', difficulty: 900, synonyms: 'shipment,delivery,batch'
  },
  {
    word: 'Logistics', pronunciation: 'ləˈdʒɪstɪks', partOfSpeech: 'noun',
    definition: 'The detailed organization and implementation of a complex operation, specifically transport.',
    definitionNative: 'Hậu cần, dịch vụ logistics',
    example: 'The logistics manager coordinated the delivery routes across ten countries.',
    exampleTranslation: 'Trưởng bộ phận hậu cần đã điều phối các tuyến đường giao hàng trên mười quốc gia.',
    topic: 'shipping', difficulty: 900, synonyms: 'management,coordination,organization'
  },

  // --- HOTEL ---
  // 500
  {
    word: 'Room', pronunciation: 'ruːm', partOfSpeech: 'noun',
    definition: 'A part of the inside of a building that is divided from other parts by walls.',
    definitionNative: 'Phòng khách sạn',
    example: 'She booked a double room with a sea view for three nights.',
    exampleTranslation: 'Cô ấy đã đặt một phòng đôi hướng biển trong ba đêm.',
    topic: 'hotel', difficulty: 500, synonyms: 'chamber,suite,space'
  },
  {
    word: 'Guest', pronunciation: 'ɡest', partOfSpeech: 'noun',
    definition: 'A person who is invited to visit someone\'s home or stay at a hotel.',
    definitionNative: 'Khách, khách lưu trú',
    example: 'The hotel reception desk welcomes guests twenty-four hours a day.',
    exampleTranslation: 'Quầy tiếp tân của khách sạn chào đón khách lưu trú hai mươi tư giờ một ngày.',
    topic: 'hotel', difficulty: 500, synonyms: 'visitor,customer,patron'
  },
  // 600
  {
    word: 'Lobby', pronunciation: 'ˈlɒbi', partOfSpeech: 'noun',
    definition: 'A large entrance hall or reception area in a public building, especially in a hotel.',
    definitionNative: 'Sảnh chờ, hành lang',
    example: 'Let\'s meet in the hotel lobby near the reception desk at five.',
    exampleTranslation: 'Hãy gặp nhau ở sảnh chờ khách sạn gần quầy tiếp tân lúc năm giờ.',
    topic: 'hotel', difficulty: 600, synonyms: 'foyer,hall,reception'
  },
  {
    word: 'Service', pronunciation: 'ˈsɜːvɪs', partOfSpeech: 'noun',
    definition: 'The action of helping or doing work for someone, or room maintenance.',
    definitionNative: 'Dịch vụ, sự phục vụ',
    example: 'This five-star hotel is famous for its exceptional room service.',
    exampleTranslation: 'Khách sạn năm sao này nổi tiếng với dịch vụ phục vụ phòng đặc biệt.',
    topic: 'hotel', difficulty: 600, synonyms: 'assistance,maintenance,care'
  },
  // 700
  {
    word: 'Facility', pronunciation: 'fəˈsɪləti', partOfSpeech: 'noun',
    definition: 'A place, amenity, or piece of equipment provided for a particular purpose.',
    definitionNative: 'Cơ sở vật chất, trang thiết bị',
    example: 'The hotel offers a wide range of facilities, including an indoor pool and a gym.',
    exampleTranslation: 'Khách sạn cung cấp nhiều loại cơ sở vật chất, bao gồm hồ bơi trong nhà và phòng tập thể dục.',
    topic: 'hotel', difficulty: 700, synonyms: 'amenity,installation,equipment'
  },
  {
    word: 'Check-in', pronunciation: 'ˈtʃek ɪn', partOfSpeech: 'noun',
    definition: 'The act of registering at a hotel or airport upon arrival.',
    definitionNative: 'Thủ tục nhận phòng, check-in',
    example: 'The standard check-in time at this resort is two o\'clock in the afternoon.',
    exampleTranslation: 'Thời gian nhận phòng tiêu chuẩn tại khu nghỉ dưỡng này là hai giờ chiều.',
    topic: 'hotel', difficulty: 700, synonyms: 'registration,arrival procedure'
  },
  // 800
  {
    word: 'Amenity', pronunciation: 'əˈmiːnəti', partOfSpeech: 'noun',
    definition: 'A desirable or useful feature or facility of a building or place.',
    definitionNative: 'Tiện nghi, dịch vụ đi kèm',
    example: 'Free Wi-Fi and breakfast are standard amenities at this hotel.',
    exampleTranslation: 'Wi-Fi miễn phí và bữa sáng là những tiện nghi tiêu chuẩn tại khách sạn này.',
    topic: 'hotel', difficulty: 800, synonyms: 'convenience,facility,benefit'
  },
  {
    word: 'Concierge', pronunciation: 'kɔːnˈsiːeəʒ', partOfSpeech: 'noun',
    definition: 'A hotel staff member who assists guests with bookings, tours, and information.',
    definitionNative: 'Nhân viên hỗ trợ khách hàng, người phục vụ phòng',
    example: 'The concierge recommended a great local seafood restaurant down the street.',
    exampleTranslation: 'Nhân viên hỗ trợ khách hàng đã giới thiệu một nhà hàng hải sản địa phương tuyệt vời ở cuối phố.',
    topic: 'hotel', difficulty: 800, synonyms: 'doorkeeper,porter,guest assistant'
  },
  // 900
  {
    word: 'Hospitality', pronunciation: 'ˌhɒspɪˈtæləti', partOfSpeech: 'noun',
    definition: 'The friendly and generous reception and entertainment of guests, visitors, or strangers.',
    definitionNative: 'Lòng hiếu khách, ngành dịch vụ khách sạn',
    example: 'We were deeply impressed by the warm hospitality of the resort staff.',
    exampleTranslation: 'Chúng tôi đã bị ấn tượng sâu sắc bởi lòng hiếu khách nồng hậu của nhân viên khu nghỉ dưỡng.',
    topic: 'hotel', difficulty: 900, synonyms: 'friendliness,welcome,accommodation service'
  },
  {
    word: 'Occupancy', pronunciation: 'ˈɒkjupənsi', partOfSpeech: 'noun',
    definition: 'The proportion of rooms or beds used in a hotel over a specific period.',
    definitionNative: 'Tỷ lệ lấp đầy phòng, tỷ lệ sử dụng',
    example: 'The hotel reached a ninety percent occupancy rate during the summer holidays.',
    exampleTranslation: 'Khách sạn đạt tỷ lệ lấp đầy phòng chín mươi phần trăm trong các kỳ nghỉ hè.',
    topic: 'hotel', difficulty: 900, synonyms: 'tenancy,possession,use rate'
  },

  // --- EMAIL ---
  // 500
  {
    word: 'Send', pronunciation: 'send', partOfSpeech: 'verb',
    definition: 'Cause to go or be taken to a particular destination, especially electronic messages.',
    definitionNative: 'Gửi',
    example: 'Please send me the weekly sales report via email as soon as possible.',
    exampleTranslation: 'Vui lòng gửi cho tôi báo cáo doanh số hàng tuần qua email càng sớm càng tốt.',
    topic: 'email', difficulty: 500, synonyms: 'transmit,dispatch,mail'
  },
  {
    word: 'Message', pronunciation: 'ˈmesɪdʒ', partOfSpeech: 'noun',
    definition: 'A verbal, written, or recorded communication sent to or left for a recipient.',
    definitionNative: 'Tin nhắn, thông điệp',
    example: 'I left a message for the sales team regarding the client\'s request.',
    exampleTranslation: 'Tôi đã để lại một tin nhắn cho đội ngũ bán hàng liên quan đến yêu cầu của khách hàng.',
    topic: 'email', difficulty: 500, synonyms: 'note,memo,communication'
  },
  // 600
  {
    word: 'Attachment', pronunciation: 'əˈtætʃmənt', partOfSpeech: 'noun',
    definition: 'An extra part or document that is added or joined to something, specifically an email.',
    definitionNative: 'Tập tin đính kèm',
    example: 'Please find the marketing presentation in the email attachment.',
    exampleTranslation: 'Vui lòng tìm bản thuyết trình tiếp thị trong tệp đính kèm email.',
    topic: 'email', difficulty: 600, synonyms: 'added file,appendix,supplement'
  },
  {
    word: 'Address', pronunciation: 'əˈdres', partOfSpeech: 'noun',
    definition: 'The particulars of the place where someone lives or an electronic mail location.',
    definitionNative: 'Địa chỉ (email/nhà)',
    example: 'Double-check the recipient\'s email address before hitting send.',
    exampleTranslation: 'Kiểm tra kỹ địa chỉ email của người nhận trước khi nhấn gửi.',
    topic: 'email', difficulty: 600, synonyms: 'location,mail ID,destination'
  },
  // 700
  {
    word: 'Subject', pronunciation: 'ˈsʌbdʒɪkt', partOfSpeech: 'noun',
    definition: 'A person or thing that is being discussed, described, or dealt with; the title line of an email.',
    definitionNative: 'Chủ đề, tiêu đề email',
    example: 'Make sure your email subject line is clear and descriptive.',
    exampleTranslation: 'Đảm bảo dòng tiêu đề email của bạn rõ ràng và mô tả đúng nội dung.',
    topic: 'email', difficulty: 700, synonyms: 'topic,heading,theme'
  },
  {
    word: 'Reply', pronunciation: 'rɪˈplaɪ', partOfSpeech: 'verb',
    definition: 'Say or write something as an answer to a question or message.',
    definitionNative: 'Trả lời, phản hồi',
    example: 'The customer service officer will reply to your inquiry within twenty-four hours.',
    exampleTranslation: 'Nhân viên dịch vụ khách hàng sẽ trả lời câu hỏi của bạn trong vòng hai mươi tư giờ.',
    topic: 'email', difficulty: 700, synonyms: 'answer,respond,return'
  },
  // 800
  {
    word: 'Forward', pronunciation: 'ˈfɔːwəd', partOfSpeech: 'verb',
    definition: 'Send an email or letter on to a further destination.',
    definitionNative: 'Chuyển tiếp (email)',
    example: 'Could you please forward that feedback email directly to the developer team?',
    exampleTranslation: 'Bạn có thể vui lòng chuyển tiếp email phản hồi đó trực tiếp đến đội ngũ lập trình được không?',
    topic: 'email', difficulty: 800, synonyms: 'resend,pass on,redirect'
  },
  {
    word: 'Confirm', pronunciation: 'kənˈfɜːm', partOfSpeech: 'verb',
    definition: 'Establish the truth or correctness of something, or verify an arrangement.',
    definitionNative: 'Xác nhận',
    example: 'The client sent an email to confirm the meeting details for tomorrow.',
    exampleTranslation: 'Khách hàng đã gửi email để xác nhận chi tiết cuộc họp cho ngày mai.',
    topic: 'email', difficulty: 800, synonyms: 'verify,validate,approve'
  },
  // 900
  {
    word: 'Correspondence', pronunciation: 'ˌkɒrəˈspɒndəns', partOfSpeech: 'noun',
    definition: 'Communication by exchanging letters or emails.',
    definitionNative: 'Thư từ giao dịch, sự tương lạc qua lại',
    example: 'We keep a digital record of all email correspondence with external contractors.',
    exampleTranslation: 'Chúng tôi giữ một hồ sơ kỹ thuật số về tất cả các thư từ giao dịch qua email với các nhà thầu bên ngoài.',
    topic: 'email', difficulty: 900, synonyms: 'communication,letters,exchanges'
  },
  {
    word: 'Recipient', pronunciation: 'rɪˈsɪpiənt', partOfSpeech: 'noun',
    definition: 'A person who receives or is awarded something, specifically an email.',
    definitionNative: 'Người nhận',
    example: 'The email bounce message indicates that the recipient does not exist.',
    exampleTranslation: 'Tin nhắn email bị trả lại chỉ ra rằng người nhận không tồn tại.',
    topic: 'email', difficulty: 900, synonyms: 'receiver,addressee,acceptor'
  }
];

// 100 Grammar Questions: 10 topics * 5 levels * 2 questions per combination
const QUESTIONS_DATA = [
  // --- BUSINESS ---
  // 500
  {
    question: 'The new manager has asked _____ employees to submit their reports by Friday.',
    choiceA: 'he', choiceB: 'him', choiceC: 'his', choiceD: 'himself',
    correctAnswer: 'C',
    explanation: 'The possessive adjective "his" is required before the noun "employees" to show ownership.',
    explanationVi: 'Dịch nghĩa: Quản lý mới đã yêu cầu nhân viên của mình nộp báo cáo trước thứ Sáu. | Giải thích: Tính từ sở hữu "his" được yêu cầu đứng trước danh từ "employees" để chỉ sự sở hữu.',
    part: 5, topic: 'business', difficulty: 500
  },
  {
    question: 'Please review the contract carefully _____ signing the final document.',
    choiceA: 'before', choiceB: 'between', choiceC: 'among', choiceD: 'during',
    correctAnswer: 'A',
    explanation: 'The preposition "before" logically fits here to describe an action occurring prior to signing.',
    explanationVi: 'Dịch nghĩa: Vui lòng xem xét kỹ hợp đồng trước khi ký tài liệu cuối cùng. | Giải thích: Giới từ "before" phù hợp về mặt logic ở đây để mô tả một hành động xảy ra trước khi ký.',
    part: 5, topic: 'business', difficulty: 500
  },
  // 600
  {
    question: 'The management team _____ the new business strategy at yesterday\'s general meeting.',
    choiceA: 'discusses', choiceB: 'discussed', choiceC: 'discussing', choiceD: 'will discuss',
    correctAnswer: 'B',
    explanation: 'The adverb "yesterday" indicates a past action, requiring the simple past tense "discussed".',
    explanationVi: 'Dịch nghĩa: Ban quản lý đã thảo luận về chiến lược kinh doanh mới tại cuộc họp toàn thể ngày hôm qua. | Giải thích: Trạng từ "yesterday" chỉ một hành động trong quá khứ, yêu cầu thì quá khứ đơn "discussed".',
    part: 5, topic: 'business', difficulty: 600
  },
  {
    question: 'If the supplier _____ the contract terms, we will search for another partner.',
    choiceA: 'violates', choiceB: 'violated', choiceC: 'will violate', choiceD: 'violating',
    correctAnswer: 'A',
    explanation: 'This is a first conditional sentence. The "if" clause uses the simple present tense ("violates") for future possibility.',
    explanationVi: 'Dịch nghĩa: Nếu nhà cung cấp vi phạm các điều khoản hợp đồng, chúng tôi sẽ tìm kiếm đối tác khác. | Giải thích: Đây là câu điều kiện loại 1. Mệnh đề "if" sử dụng thì hiện tại đơn ("violates") cho khả năng xảy ra trong tương lai.',
    part: 5, topic: 'business', difficulty: 600
  },
  // 700
  {
    question: 'Our legal consultants will help us negotiate the terms _____ we sign the final agreement.',
    choiceA: 'so', choiceB: 'so that', choiceC: 'before', choiceD: 'in order to',
    correctAnswer: 'C',
    explanation: '"before" acts as a temporal conjunction connecting the main clause with the subordinate clause.',
    explanationVi: 'Dịch nghĩa: Các cố vấn pháp lý của chúng tôi sẽ giúp chúng tôi thương lượng các điều khoản trước khi chúng tôi ký thỏa thuận cuối cùng. | Giải thích: "before" đóng vai trò là một liên từ chỉ thời gian nối mệnh đề chính với mệnh đề phụ.',
    part: 5, topic: 'business', difficulty: 700
  },
  {
    question: 'The transaction was completed _____ because all required files had been submitted.',
    choiceA: 'quick', choiceB: 'quickly', choiceC: 'quickness', choiceD: 'quicker',
    correctAnswer: 'B',
    explanation: 'The adverb "quickly" is required to modify the passive verb phrase "was completed".',
    explanationVi: 'Dịch nghĩa: Giao dịch đã được hoàn thành nhanh chóng vì tất cả các hồ sơ yêu cầu đã được nộp. | Giải thích: Trạng từ "quickly" là cần thiết để bổ nghĩa cho cụm động từ bị động "was completed".',
    part: 5, topic: 'business', difficulty: 700
  },
  // 800
  {
    question: '_____ the unexpected decline in sales, the executive board approved the new venture.',
    choiceA: 'Although', choiceB: 'Despite', choiceC: 'Because', choiceD: 'Unless',
    correctAnswer: 'B',
    explanation: '"Despite" is a preposition and must be followed by a noun phrase ("the unexpected decline in sales").',
    explanationVi: 'Dịch nghĩa: Bất chấp sự sụt giảm doanh số ngoài dự kiến, ban điều hành vẫn phê duyệt liên doanh mới. | Giải thích: "Despite" là một giới từ và phải được theo sau bởi một cụm danh từ ("the unexpected decline in sales").',
    part: 5, topic: 'business', difficulty: 800
  },
  {
    question: 'The legal team worked late so that the contract _____ ready for the morning meeting.',
    choiceA: 'is', choiceB: 'will be', choiceC: 'would be', choiceD: 'had been',
    correctAnswer: 'C',
    explanation: 'The phrase "so that" introduces a purpose clause. Because the main clause is in the past tense ("worked"), we use "would be".',
    explanationVi: 'Dịch nghĩa: Nhóm pháp lý đã làm việc muộn để hợp đồng sẵn sàng cho cuộc họp buổi sáng. | Giải thích: Cụm từ "so that" giới thiệu một mệnh đề chỉ mục đích. Vì mệnh đề chính ở thì quá khứ ("worked"), chúng ta dùng "would be".',
    part: 5, topic: 'business', difficulty: 800
  },
  // 900
  {
    question: 'Had the two conglomerates negotiated more patiently, they _____ a mutually beneficial deal.',
    choiceA: 'would reach', choiceB: 'will reach', choiceC: 'would have reached', choiceD: 'reached',
    correctAnswer: 'C',
    explanation: 'This is an inverted third conditional sentence. The condition "Had they negotiated" matches with "would have reached".',
    explanationVi: 'Dịch nghĩa: Nếu hai tập đoàn đàm phán kiên nhẫn hơn, họ đã đạt được một thỏa thuận đôi bên cùng có lợi. | Giải thích: Đây là câu điều kiện loại 3 đảo ngữ. Điều kiện "Had they negotiated" đi kèm với "would have reached".',
    part: 5, topic: 'business', difficulty: 900
  },
  {
    question: 'The litigation process, _____ length was unexpected, cost the corporation millions of dollars.',
    choiceA: 'which', choiceB: 'whose', choiceC: 'that', choiceD: 'whom',
    correctAnswer: 'B',
    explanation: 'The relative pronoun "whose" is used to denote possession relative to "the litigation process".',
    explanationVi: 'Dịch nghĩa: Quá trình kiện tụng, có thời gian kéo dài ngoài dự kiến, đã tiêu tốn của tập đoàn hàng triệu đô la. | Giải thích: Đại từ quan hệ "whose" được sử dụng để chỉ sự sở hữu liên quan đến danh từ "the litigation process".',
    part: 5, topic: 'business', difficulty: 900
  },

  // --- MEETINGS ---
  // 500
  {
    question: 'Please print the agenda for the meeting _____ distribute it to all attendees.',
    choiceA: 'but', choiceB: 'and', choiceC: 'or', choiceD: 'so',
    correctAnswer: 'B',
    explanation: 'The coordinating conjunction "and" connects two parallel instructions in the imperative mood.',
    explanationVi: 'Dịch nghĩa: Vui lòng in chương trình nghị sự cho cuộc họp và phân phát cho tất cả những người tham dự. | Giải thích: Liên từ kết hợp "and" kết nối hai chỉ dẫn song song ở câu mệnh lệnh.',
    part: 5, topic: 'meetings', difficulty: 500
  },
  {
    question: 'Ms. Davis will present her research results _____ the conference tomorrow afternoon.',
    choiceA: 'on', choiceB: 'at', choiceC: 'with', choiceD: 'for',
    correctAnswer: 'B',
    explanation: 'The preposition "at" is used to refer to a specific event or location, such as "at the conference".',
    explanationVi: 'Dịch nghĩa: Cô Davis sẽ trình bày kết quả nghiên cứu của mình tại hội nghị vào chiều mai. | Giải thích: Giới từ "at" được sử dụng để chỉ một sự kiện hoặc địa điểm cụ thể, chẳng hạn như "at the conference".',
    part: 5, topic: 'meetings', difficulty: 500
  },
  // 600
  {
    question: 'All members of the committee _____ to attend the special training session next Monday.',
    choiceA: 'require', choiceB: 'are required', choiceC: 'requiring', choiceD: 'have required',
    correctAnswer: 'B',
    explanation: 'The passive construction "are required" is needed here because the subject receives the action of being required.',
    explanationVi: 'Dịch nghĩa: Tất cả các thành viên của ủy ban được yêu cầu tham dự buổi đào tạo đặc biệt vào thứ Hai tới. | Giải thích: Cấu trúc bị động "are required" là cần thiết ở đây vì chủ ngữ nhận hành động bị yêu cầu.',
    part: 5, topic: 'meetings', difficulty: 600
  },
  {
    question: 'The seminar on digital marketing was _____ attended by local business representatives.',
    choiceA: 'wide', choiceB: 'widely', choiceC: 'width', choiceD: 'widen',
    correctAnswer: 'B',
    explanation: 'The adverb "widely" modifies the participle/adjective "attended".',
    explanationVi: 'Dịch nghĩa: Hội thảo về tiếp thị kỹ thuật số đã có sự tham dự rộng rãi của các đại diện doanh nghiệp địa phương. | Giải thích: Trạng từ "widely" bổ nghĩa cho phân từ/tính từ "attended".',
    part: 5, topic: 'meetings', difficulty: 600
  },
  // 700
  {
    question: 'Although we want to collaborate, we must postpone the meeting _____ we have more data.',
    choiceA: 'until', choiceB: 'since', choiceC: 'during', choiceD: 'while',
    correctAnswer: 'A',
    explanation: '"until" is a conjunction indicating the point in time up to which the postponement will last.',
    explanationVi: 'Dịch nghĩa: Mặc dù chúng tôi muốn hợp tác, chúng tôi phải hoãn cuộc họp cho đến khi chúng tôi có thêm dữ liệu. | Giải thích: "until" là liên từ chỉ thời điểm kéo dài cho đến khi hành động trì hoãn kết thúc.',
    part: 5, topic: 'meetings', difficulty: 700
  },
  {
    question: 'The chairperson decided _____ the meeting because several board members were absent.',
    choiceA: 'postpone', choiceB: 'to postpone', choiceC: 'postponed', choiceD: 'postponing',
    correctAnswer: 'B',
    explanation: 'The verb "decide" is followed by an infinitive verb phrase starting with "to".',
    explanationVi: 'Dịch nghĩa: Chủ tịch đã quyết định hoãn cuộc họp vì một số thành viên hội đồng quản trị vắng mặt. | Giải thích: Động từ "decide" được theo sau bởi một cụm động từ nguyên mẫu bắt đầu bằng "to".',
    part: 5, topic: 'meetings', difficulty: 700
  },
  // 800
  {
    question: '_____ the meeting was adjourned, the marketing director stayed to speak with the CEO.',
    choiceA: 'After', choiceB: 'During', choiceC: 'Despite', choiceD: 'In order to',
    correctAnswer: 'A',
    explanation: 'The temporal conjunction "After" logically introduces the clause that occurred before the director\'s discussion.',
    explanationVi: 'Dịch nghĩa: Sau khi cuộc họp kết thúc, giám đốc tiếp thị đã ở lại để nói chuyện với CEO. | Giải thích: Liên từ chỉ thời gian "After" giới thiệu một cách hợp lý mệnh đề xảy ra trước cuộc thảo luận của giám đốc.',
    part: 5, topic: 'meetings', difficulty: 800
  },
  {
    question: 'They were able to reach a consensus, _____ pleased the board of directors.',
    choiceA: 'who', choiceB: 'which', choiceC: 'that', choiceD: 'whom',
    correctAnswer: 'B',
    explanation: 'The relative pronoun "which" is used here to modify the entire preceding clause ("They were able to reach a consensus").',
    explanationVi: 'Dịch nghĩa: Họ đã có thể đạt được sự đồng thuận, điều này làm hài lòng ban giám đốc. | Giải thích: Đại từ quan hệ "which" được dùng ở đây để bổ nghĩa cho toàn bộ mệnh đề đi trước ("They were able to reach a consensus").',
    part: 5, topic: 'meetings', difficulty: 800
  },
  // 900
  {
    question: 'No sooner had the committee convened than the members _____ to vote on the resolution.',
    choiceA: 'decide', choiceB: 'decided', choiceC: 'had decided', choiceD: 'will decide',
    correctAnswer: 'B',
    explanation: 'The structure "No sooner had + past perfect + than + simple past" is used to show two actions happening in quick succession.',
    explanationVi: 'Dịch nghĩa: Ngay sau khi ủy ban họp, các thành viên đã quyết định bỏ phiếu cho nghị quyết. | Giải thích: Cấu trúc "No sooner had + quá khứ hoàn thành + than + quá khứ đơn" được dùng để chỉ hai hành động xảy ra liên tiếp nhanh chóng.',
    part: 5, topic: 'meetings', difficulty: 900
  },
  {
    question: 'Only by achieving absolute unanimity _____ the board pass the complex corporate revision.',
    choiceA: 'the board can', choiceB: 'can the board', choiceC: 'the board did', choiceD: 'did the board can',
    correctAnswer: 'B',
    explanation: 'This sentence requires inversion because it begins with the limiting phrase "Only by...". The auxiliary "can" precedes the subject.',
    explanationVi: 'Dịch nghĩa: Chỉ bằng cách đạt được sự nhất trí hoàn toàn, hội đồng quản trị mới có thể thông qua bản sửa đổi phức tạp của công ty. | Giải thích: Câu này yêu cầu đảo ngữ vì nó bắt đầu bằng cụm từ hạn chế "Only by...". Trợ động từ "can" đứng trước chủ ngữ.',
    part: 5, topic: 'meetings', difficulty: 900
  },

  // --- OFFICE ---
  // 500
  {
    question: 'Please submit the document directly _____ the human resources department.',
    choiceA: 'at', choiceB: 'to', choiceC: 'in', choiceD: 'for',
    correctAnswer: 'B',
    explanation: 'The verb "submit" is typically paired with the preposition "to" when indicating the recipient of the submission.',
    explanationVi: 'Dịch nghĩa: Vui lòng nộp tài liệu trực tiếp cho bộ phận nhân sự. | Giải thích: Động từ "submit" thường được đi kèm với giới từ "to" khi chỉ người nhận hồ sơ nộp.',
    part: 5, topic: 'office', difficulty: 500
  },
  {
    question: 'Mr. Green is _____ employee who works in our sales department.',
    choiceA: 'a', choiceB: 'an', choiceC: 'the', choiceD: 'some',
    correctAnswer: 'B',
    explanation: 'The indefinite article "an" is required before the singular countable noun "employee" because it begins with a vowel sound.',
    explanationVi: 'Dịch nghĩa: Ông Green là một nhân viên làm việc trong bộ phận bán hàng của chúng tôi. | Giải thích: Mạo từ bất định "an" là cần thiết trước danh từ đếm được số ít "employee" vì nó bắt đầu bằng một nguyên âm.',
    part: 5, topic: 'office', difficulty: 500
  },
  // 600
  {
    question: 'The HR department is planning _____ the new employees next week.',
    choiceA: 'train', choiceB: 'to train', choiceC: 'trained', choiceD: 'training',
    correctAnswer: 'B',
    explanation: 'The verb "plan" is followed by a to-infinitive construction.',
    explanationVi: 'Dịch nghĩa: Bộ phận nhân sự đang lên kế hoạch đào tạo nhân viên mới vào tuần tới. | Giải thích: Động từ "plan" được theo sau bởi cấu trúc động từ nguyên mẫu có "to".',
    part: 5, topic: 'office', difficulty: 600
  },
  {
    question: 'The secretary _____ coordinated the logistics for the upcoming corporate training event.',
    choiceA: 'efficiency', choiceB: 'efficient', choiceC: 'efficiently', choiceD: 'efficiencies',
    correctAnswer: 'C',
    explanation: 'The adverb "efficiently" is required to modify the verb "coordinated".',
    explanationVi: 'Dịch nghĩa: Thư ký đã điều phối hiệu quả công tác hậu cần cho sự kiện đào tạo sắp tới của công ty. | Giải thích: Trạng từ "efficiently" là cần thiết để bổ nghĩa cho động từ "coordinated".',
    part: 5, topic: 'office', difficulty: 600
  },
  // 700
  {
    question: 'Rather than doing everything himself, the manager decided _____ the tasks to his team.',
    choiceA: 'delegate', choiceB: 'to delegate', choiceC: 'delegated', choiceD: 'delegating',
    correctAnswer: 'B',
    explanation: 'The verb "decide" requires a to-infinitive complement ("to delegate").',
    explanationVi: 'Dịch nghĩa: Thay vì tự mình làm mọi việc, người quản lý quyết định phân công nhiệm vụ cho nhóm của mình. | Giải thích: Động từ "decide" yêu cầu bổ ngữ động từ nguyên mẫu có "to" ("to delegate").',
    part: 5, topic: 'office', difficulty: 700
  },
  {
    question: 'Ms. White will supervise the team while the director _____ away on a business trip.',
    choiceA: 'is', choiceB: 'will be', choiceC: 'was', choiceD: 'has been',
    correctAnswer: 'A',
    explanation: 'In time clauses introduced by "while", we use the simple present tense ("is") to refer to future time.',
    explanationVi: 'Dịch nghĩa: Cô White sẽ giám sát nhóm trong khi giám đốc đi công tác. | Giải thích: Trong các mệnh đề thời gian giới thiệu bởi "while", chúng ta sử dụng thì hiện tại đơn ("is") để chỉ thời gian tương lai.',
    part: 5, topic: 'office', difficulty: 700
  },
  // 800
  {
    question: 'The human resources division hired additional personnel _____ improve the workflow.',
    choiceA: 'so that', choiceB: 'in order to', choiceC: 'because of', choiceD: 'although',
    correctAnswer: 'B',
    explanation: 'The prepositional phrase "in order to" is followed by the base form of the verb "improve" to indicate purpose.',
    explanationVi: 'Dịch nghĩa: Bộ phận nhân sự đã thuê thêm nhân viên để cải thiện quy trình làm việc. | Giải thích: Cụm từ giới từ "in order to" được theo sau bởi dạng nguyên mẫu của động từ "improve" để chỉ mục đích.',
    part: 5, topic: 'office', difficulty: 800
  },
  {
    question: 'All office staff must follow the guidelines, _____ of their positions in the firm.',
    choiceA: 'regard', choiceB: 'regards', choiceC: 'regardless', choiceD: 'regarding',
    correctAnswer: 'C',
    explanation: 'The compound prepositional phrase "regardless of" means without paying attention to something.',
    explanationVi: 'Dịch nghĩa: Tất cả nhân viên văn phòng phải tuân theo hướng dẫn, bất kể vị trí của họ trong công ty. | Giải thích: Cụm giới từ ghép "regardless of" có nghĩa là bất kể, không quan tâm đến điều gì.',
    part: 5, topic: 'office', difficulty: 800
  },
  // 900
  {
    question: 'The CEO insisted that the administrative bureaucracy _____ simplified to boost efficiency.',
    choiceA: 'is', choiceB: 'be', choiceC: 'was', choiceD: 'should have been',
    correctAnswer: 'B',
    explanation: 'The verb "insist" triggers the subjunctive mood in the following "that" clause, requiring the base form of the verb ("be simplified").',
    explanationVi: 'Dịch nghĩa: CEO đã nhấn mạnh rằng thủ tục hành chính phức tạp cần được đơn giản hóa để tăng hiệu quả. | Giải thích: Động từ "insist" kích hoạt thức giả định trong mệnh đề "that" theo sau, yêu cầu động từ ở dạng nguyên thể ("be simplified").',
    part: 5, topic: 'office', difficulty: 900
  },
  {
    question: 'Scarcely had the new personnel system been introduced when the office workflow _____ disrupted.',
    choiceA: 'is', choiceB: 'was', choiceC: 'had been', choiceD: 'would be',
    correctAnswer: 'B',
    explanation: 'The structure "Scarcely had + past perfect + when + simple past" indicates that one event happened immediately after another.',
    explanationVi: 'Dịch nghĩa: Hệ thống nhân sự mới vừa được giới thiệu thì quy trình làm việc của văn phòng đã bị gián đoạn. | Giải thích: Cấu trúc "Scarcely had + quá khứ hoàn thành + when + quá khứ đơn" chỉ ra rằng một sự kiện đã xảy ra ngay sau một sự kiện khác.',
    part: 5, topic: 'office', difficulty: 900
  },

  // --- FINANCE ---
  // 500
  {
    question: 'The finance department approved the budget _____ the upcoming marketing project.',
    choiceA: 'for', choiceB: 'at', choiceC: 'with', choiceD: 'to',
    correctAnswer: 'A',
    explanation: 'The preposition "for" is used to show the purpose or target of the budget allocation.',
    explanationVi: 'Dịch nghĩa: Bộ phận tài chính đã phê duyệt ngân sách cho dự án tiếp thị sắp tới. | Giải thích: Giới từ "for" được sử dụng để chỉ mục đích hoặc đối tượng của việc phân bổ ngân sách.',
    part: 5, topic: 'finance', difficulty: 500
  },
  {
    question: 'Travel expenses should _____ submitted directly to the accounting office.',
    choiceA: 'be', choiceB: 'is', choiceC: 'have', choiceD: 'are',
    correctAnswer: 'A',
    explanation: 'The modal verb "should" must be followed by the base passive form "be" + past participle.',
    explanationVi: 'Dịch nghĩa: Chi phí đi lại nên được nộp trực tiếp cho phòng kế toán. | Giải thích: Động từ khuyết thiếu "should" phải được theo sau bởi dạng bị động nguyên mẫu "be" + quá khứ phân từ.',
    part: 5, topic: 'finance', difficulty: 500
  },
  // 600
  {
    question: 'The retail chain reported a significant increase in profit _____ last quarter.',
    choiceA: 'during', choiceB: 'while', choiceC: 'between', choiceD: 'throughout',
    correctAnswer: 'A',
    explanation: 'The preposition "during" is used to specify the period of time in which the increase occurred.',
    explanationVi: 'Dịch nghĩa: Chuỗi bán lẻ đã báo cáo lợi nhuận tăng đáng kể trong quý trước. | Giải thích: Giới từ "during" được sử dụng để chỉ khoảng thời gian xảy ra sự gia tăng.',
    part: 5, topic: 'finance', difficulty: 600
  },
  {
    question: 'Our quarterly revenue has grown _____ because of the successful product launch.',
    choiceA: 'substantial', choiceB: 'substantially', choiceC: 'substantiated', choiceD: 'substance',
    correctAnswer: 'B',
    explanation: 'The adverb "substantially" is required to modify the verb phrase "has grown".',
    explanationVi: 'Dịch nghĩa: Doanh thu hàng quý của chúng tôi đã tăng trưởng đáng kể nhờ sự ra mắt sản phẩm thành công. | Giải thích: Trạng từ "substantially" là cần thiết để bổ nghĩa cho cụm động từ "has grown".',
    part: 5, topic: 'finance', difficulty: 600
  },
  // 700
  {
    question: 'We need to evaluate the financial details before _____ on the investment.',
    choiceA: 'decide', choiceB: 'deciding', choiceC: 'decided', choiceD: 'decides',
    correctAnswer: 'B',
    explanation: 'After the preposition "before", the gerund form "deciding" is required.',
    explanationVi: 'Dịch nghĩa: Chúng ta cần đánh giá các chi tiết tài chính trước khi quyết định đầu tư. | Giải thích: Sau giới từ "before", dạng danh động từ "deciding" là bắt buộc.',
    part: 5, topic: 'finance', difficulty: 700
  },
  {
    question: 'The financial analyst calculated the total expenses _____ the final report.',
    choiceA: 'write', choiceB: 'writing', choiceC: 'to write', choiceD: 'written',
    correctAnswer: 'C',
    explanation: 'The infinitive "to write" is used here to indicate the purpose of calculating the expenses.',
    explanationVi: 'Dịch nghĩa: Nhà phân tích tài chính đã tính toán tổng chi phí để viết báo cáo cuối cùng. | Giải thích: Động từ nguyên mẫu "to write" được dùng ở đây để chỉ mục đích của việc tính toán chi phí.',
    part: 5, topic: 'finance', difficulty: 700
  },
  // 800
  {
    question: '_____ the government cuts taxes, the company\'s net profits will not increase.',
    choiceA: 'Unless', choiceB: 'Although', choiceC: 'Because', choiceD: 'Despite',
    correctAnswer: 'A',
    explanation: '"Unless" is equivalent to "if... not", which fits the negative conditional meaning of this sentence.',
    explanationVi: 'Dịch nghĩa: Trừ khi chính phủ cắt giảm thuế, lợi nhuận ròng của công ty sẽ không tăng. | Giải thích: "Unless" tương đương với "if... not" (trừ khi), phù hợp với ý nghĩa điều kiện phủ định của câu này.',
    part: 5, topic: 'finance', difficulty: 800
  },
  {
    question: 'The corporation purchased the asset, _____ value has doubled over the past year.',
    choiceA: 'which', choiceB: 'whose', choiceC: 'that', choiceD: 'whom',
    correctAnswer: 'B',
    explanation: 'The relative pronoun "whose" is used to show possession relative to the noun "the asset".',
    explanationVi: 'Dịch nghĩa: Tập đoàn đã mua tài sản có giá trị tăng gấp đôi trong năm qua. | Giải thích: Đại từ quan hệ "whose" được sử dụng để chỉ sự sở hữu liên quan đến danh từ "the asset".',
    part: 5, topic: 'finance', difficulty: 800
  },
  // 900
  {
    question: 'Had the corporation balanced its liabilities, the budget deficit _____ by the auditors.',
    choiceA: 'would not notice', choiceB: 'will not have been noticed', choiceC: 'would not have been noticed', choiceD: 'had not been noticed',
    correctAnswer: 'C',
    explanation: 'This is an inverted third conditional sentence. The passive result clause requires "would not have been noticed".',
    explanationVi: 'Dịch nghĩa: Nếu tập đoàn cân đối được các khoản nợ phải trả, sự thâm hụt ngân sách đã không bị các kiểm toán viên phát hiện. | Giải thích: Đây là câu điều kiện loại 3 đảo ngữ. Mệnh đề kết quả ở thể bị động yêu cầu "would not have been noticed".',
    part: 5, topic: 'finance', difficulty: 900
  },
  {
    question: 'The company\'s equipment is subject to rapid depreciation, _____ requires regular asset audits.',
    choiceA: 'whose', choiceB: 'which', choiceC: 'what', choiceD: 'that',
    correctAnswer: 'B',
    explanation: 'The relative pronoun "which" is used with a comma to add non-restrictive information modifying the preceding clause.',
    explanationVi: 'Dịch nghĩa: Thiết bị của công ty có xu hướng khấu hao nhanh, điều này đòi hỏi phải kiểm toán tài sản thường xuyên. | Giải thích: Đại từ quan hệ "which" được dùng kèm dấu phẩy để bổ sung thông tin không hạn chế bổ nghĩa cho mệnh đề đi trước.',
    part: 5, topic: 'finance', difficulty: 900
  },

  // --- MARKETING ---
  // 500
  {
    question: 'Our brand is famous _____ its high-quality electronic appliances.',
    choiceA: 'for', choiceB: 'with', choiceC: 'at', choiceD: 'about',
    correctAnswer: 'A',
    explanation: 'The adjective "famous" is typically paired with the preposition "for" to state the reason for fame.',
    explanationVi: 'Dịch nghĩa: Thương hiệu của chúng tôi nổi tiếng về các thiết bị điện tử chất lượng cao. | Giải thích: Tính từ "famous" thường đi với giới từ "for" để chỉ lý do nổi tiếng.',
    part: 5, topic: 'marketing', difficulty: 500
  },
  {
    question: 'The marketing team set a new sales target _____ the second quarter.',
    choiceA: 'in', choiceB: 'on', choiceC: 'for', choiceD: 'with',
    correctAnswer: 'C',
    explanation: 'The preposition "for" is appropriate here to designate the period intended for the target.',
    explanationVi: 'Dịch nghĩa: Đội ngũ tiếp thị đã đặt ra mục tiêu doanh số mới cho quý hai. | Giải thích: Giới từ "for" phù hợp ở đây để chỉ khoảng thời gian hướng tới của mục tiêu.',
    part: 5, topic: 'marketing', difficulty: 500
  },
  // 600
  {
    question: 'The advertising campaign _____ designed by a famous marketing agency last month.',
    choiceA: 'is', choiceB: 'was', choiceC: 'were', choiceD: 'being',
    correctAnswer: 'B',
    explanation: 'The singular noun "campaign" and the past indicator "last month" require the past passive auxiliary "was".',
    explanationVi: 'Dịch nghĩa: Chiến dịch quảng cáo đã được thiết kế bởi một công ty tiếp thị nổi tiếng vào tháng trước. | Giải thích: Danh từ số ít "campaign" và trạng ngữ chỉ quá khứ "last month" yêu cầu trợ động từ bị động quá khứ "was".',
    part: 5, topic: 'marketing', difficulty: 600
  },
  {
    question: 'We received valuable feedback from consumers who _____ our new fitness app.',
    choiceA: 'tests', choiceB: 'tested', choiceC: 'testing', choiceD: 'will test',
    correctAnswer: 'B',
    explanation: 'The verb "tested" is in the simple past tense, which aligns with the past action of receiving feedback.',
    explanationVi: 'Dịch nghĩa: Chúng tôi đã nhận được phản hồi quý giá từ những người tiêu dùng đã thử nghiệm ứng dụng thể dục mới của chúng tôi. | Giải thích: Động từ "tested" ở thì quá khứ đơn, phù hợp với hành động đã nhận được phản hồi trong quá khứ.',
    part: 5, topic: 'marketing', difficulty: 600
  },
  // 700
  {
    question: 'The executives made a strategic decision _____ online marketing channels.',
    choiceA: 'expand', choiceB: 'to expand', choiceC: 'expanded', choiceD: 'expanding',
    correctAnswer: 'B',
    explanation: 'The noun "decision" is followed by a to-infinitive phrase to specify the content of the decision.',
    explanationVi: 'Dịch nghĩa: Ban điều hành đã đưa ra quyết định chiến lược nhằm mở rộng các kênh tiếp thị trực tuyến. | Giải thích: Danh từ "decision" được theo sau bởi cụm động từ nguyên mẫu có "to" để chỉ nội dung quyết định.',
    part: 5, topic: 'marketing', difficulty: 700
  },
  {
    question: 'The creative designer proposed an _____ campaign to attract younger consumers.',
    choiceA: 'innovate', choiceB: 'innovation', choiceC: 'innovative', choiceD: 'innovatively',
    correctAnswer: 'C',
    explanation: 'The adjective "innovative" is required to modify the singular noun "campaign".',
    explanationVi: 'Dịch nghĩa: Nhà thiết kế sáng tạo đã đề xuất một chiến dịch đổi mới để thu hút người tiêu dùng trẻ tuổi hơn. | Giải thích: Tính từ "innovative" là cần thiết để bổ nghĩa cho danh từ số ít "campaign".',
    part: 5, topic: 'marketing', difficulty: 700
  },
  // 800
  {
    question: 'We decided to advertise our new products on social media _____ television.',
    choiceA: 'instead of', choiceB: 'because of', choiceC: 'according to', choiceD: 'in addition to',
    correctAnswer: 'A',
    explanation: 'The phrase "instead of" shows substitution, meaning they chose social media rather than television.',
    explanationVi: 'Dịch nghĩa: Chúng tôi quyết định quảng cáo sản phẩm mới của mình trên mạng xã hội thay vì truyền hình. | Giải thích: Cụm từ "instead of" chỉ sự thay thế, có nghĩa là họ chọn mạng xã hội thay vì truyền hình.',
    part: 5, topic: 'marketing', difficulty: 800
  },
  {
    question: 'The firm analyzed consumer demographics _____ creating the new advertisement.',
    choiceA: 'before', choiceB: 'during', choiceC: 'between', choiceD: 'under',
    correctAnswer: 'A',
    explanation: 'The preposition "before" is logically followed by the gerund "creating" to indicate chronological order.',
    explanationVi: 'Dịch nghĩa: Công ty đã phân tích nhân khẩu học của người tiêu dùng trước khi tạo ra quảng cáo mới. | Giải thích: Giới từ "before" được theo sau một cách hợp lý bởi danh động từ "creating" để chỉ trình tự thời gian.',
    part: 5, topic: 'marketing', difficulty: 800
  },
  // 900
  {
    question: 'Not only did the marketing agency analyze demographics, but it also _____ market saturation.',
    choiceA: 'predicts', choiceB: 'predicted', choiceC: 'predicting', choiceD: 'will predict',
    correctAnswer: 'B',
    explanation: 'Due to the past auxiliary inversion "did... analyze" in the first clause, the second clause must match in the simple past tense ("predicted").',
    explanationVi: 'Dịch nghĩa: Công ty tiếp thị không chỉ phân tích nhân khẩu học mà còn dự báo sự bão hòa của thị trường. | Giải thích: Do có sự đảo ngữ trợ động từ quá khứ "did... analyze" ở mệnh đề đầu, mệnh đề thứ hai phải hòa hợp ở thì quá khứ đơn ("predicted").',
    part: 5, topic: 'marketing', difficulty: 900
  },
  {
    question: 'The company reached market saturation, _____ forced it to redesign its branding strategy.',
    choiceA: 'whose', choiceB: 'which', choiceC: 'what', choiceD: 'that',
    correctAnswer: 'B',
    explanation: 'The non-restrictive relative pronoun "which" refers to the entire situation in the preceding clause.',
    explanationVi: 'Dịch nghĩa: Công ty đã đạt đến điểm bão hòa thị trường, điều này buộc họ phải thiết kế lại chiến lược thương hiệu. | Giải thích: Đại từ quan hệ không giới hạn "which" chỉ toàn bộ tình huống được nói ở mệnh đề đi trước.',
    part: 5, topic: 'marketing', difficulty: 900
  },

  // --- TRAVEL ---
  // 500
  {
    question: 'Please show your train ticket _____ the officer at the gate.',
    choiceA: 'for', choiceB: 'to', choiceC: 'with', choiceD: 'at',
    correctAnswer: 'B',
    explanation: 'The verb phrase "show something to someone" requires the preposition "to".',
    explanationVi: 'Dịch nghĩa: Vui lòng xuất trình vé tàu của bạn cho nhân viên tại cổng. | Giải thích: Cấu trúc động từ "show something to someone" yêu cầu giới từ "to".',
    part: 5, topic: 'travel', difficulty: 500
  },
  {
    question: 'The morning flight to New York _____ on time despite the bad weather.',
    choiceA: 'arrive', choiceB: 'arrived', choiceC: 'arriving', choiceD: 'will arrive',
    correctAnswer: 'B',
    explanation: 'The simple past tense "arrived" is appropriate here to describe a completed action in the past.',
    explanationVi: 'Dịch nghĩa: Chuyến bay buổi sáng đến New York đã đến đúng giờ bất chấp thời tiết xấu. | Giải thích: Thì quá khứ đơn "arrived" phù hợp ở đây để mô tả một hành động đã hoàn thành trong quá khứ.',
    part: 5, topic: 'travel', difficulty: 500
  },
  // 600
  {
    question: 'Passengers must check their luggage _____ boarding the international flight.',
    choiceA: 'before', choiceB: 'until', choiceC: 'during', choiceD: 'since',
    correctAnswer: 'A',
    explanation: 'The preposition "before" is followed by the gerund "boarding" to denote sequence.',
    explanationVi: 'Dịch nghĩa: Hành khách phải ký gửi hành lý trước khi lên chuyến bay quốc tế. | Giải thích: Giới từ "before" được theo sau bởi danh động từ "boarding" để chỉ trình tự.',
    part: 5, topic: 'travel', difficulty: 600
  },
  {
    question: 'The travel agent sent the detailed itinerary _____ the customers yesterday.',
    choiceA: 'at', choiceB: 'to', choiceC: 'by', choiceD: 'for',
    correctAnswer: 'B',
    explanation: 'The verb "send" takes the preposition "to" to identify the recipient of the itinerary.',
    explanationVi: 'Dịch nghĩa: Đại lý du lịch đã gửi lịch trình chi tiết cho khách hàng vào ngày hôm qua. | Giải thích: Động từ "send" đi kèm với giới từ "to" để xác định người nhận lịch trình.',
    part: 5, topic: 'travel', difficulty: 600
  },
  // 700
  {
    question: 'Our final destination _____ after twelve hours of flying across the ocean.',
    choiceA: 'reached', choiceB: 'was reached', choiceC: 'reaching', choiceD: 'is reaching',
    correctAnswer: 'B',
    explanation: 'The subject "destination" is passive, so the past passive voice "was reached" is required.',
    explanationVi: 'Dịch nghĩa: Điểm đến cuối cùng của chúng tôi đã được tiếp cận sau mười hai giờ bay qua đại dương. | Giải thích: Chủ ngữ "destination" ở thể bị động, do đó yêu cầu thể bị động ở quá khứ "was reached".',
    part: 5, topic: 'travel', difficulty: 700
  },
  {
    question: 'We decided to make a hotel reservation _____ any accommodation problems.',
    choiceA: 'so that', choiceB: 'to avoid', choiceC: 'because of', choiceD: 'in order that',
    correctAnswer: 'B',
    explanation: 'The infinitive phrase "to avoid" expresses the purpose of making a hotel reservation.',
    explanationVi: 'Dịch nghĩa: Chúng tôi quyết định đặt phòng khách sạn để tránh các vấn đề về chỗ ở. | Giải thích: Cụm động từ nguyên mẫu "to avoid" thể hiện mục đích của việc đặt phòng khách sạn.',
    part: 5, topic: 'travel', difficulty: 700
  },
  // 800
  {
    question: '_____ the transit passengers wait in the lounge, they can access the free Wi-Fi.',
    choiceA: 'While', choiceB: 'During', choiceC: 'Despite', choiceD: 'Although',
    correctAnswer: 'A',
    explanation: '"While" is a conjunction that introduces a clause representing a simultaneous action.',
    explanationVi: 'Dịch nghĩa: Trong khi hành khách quá cảnh chờ ở phòng chờ, họ có thể truy cập Wi-Fi miễn phí. | Giải thích: "While" là liên từ giới thiệu một mệnh đề biểu thị một hành động diễn ra song song.',
    part: 5, topic: 'travel', difficulty: 800
  },
  {
    question: 'The resort is large enough to accommodate all guests, _____ are from Europe.',
    choiceA: 'most of who', choiceB: 'most of whom', choiceC: 'whom most', choiceD: 'most of which',
    correctAnswer: 'B',
    explanation: 'The pronoun "whom" is required after the preposition "of" when referring to people ("guests").',
    explanationVi: 'Dịch nghĩa: Khu nghỉ dưỡng đủ lớn để chứa tất cả các vị khách, hầu hết trong số họ đến từ châu Âu. | Giải thích: Đại từ "whom" là cần thiết sau giới từ "of" khi đề cập đến người ("guests").',
    part: 5, topic: 'travel', difficulty: 800
  },
  // 900
  {
    question: 'Should the expedition team face severe blizzards, they _____ the journey immediately.',
    choiceA: 'cancel', choiceB: 'would cancel', choiceC: 'will cancel', choiceD: 'had cancelled',
    correctAnswer: 'C',
    explanation: 'This is an inverted first conditional sentence starting with "Should". The result clause uses the future "will cancel".',
    explanationVi: 'Dịch nghĩa: Nếu đội thám hiểm gặp bão tuyết dữ dội, họ sẽ hủy chuyến đi ngay lập tức. | Giải thích: Đây là câu điều kiện loại 1 đảo ngữ bắt đầu bằng "Should". Mệnh đề kết quả sử dụng thì tương lai "will cancel".',
    part: 5, topic: 'travel', difficulty: 900
  },
  {
    question: 'The disembarkation process, the details of which _____ outlined in the guide, took over an hour.',
    choiceA: 'is', choiceB: 'were', choiceC: 'was', choiceD: 'are',
    correctAnswer: 'B',
    explanation: 'The relative clause subject "the details" is plural, which requires the plural past verb "were".',
    explanationVi: 'Dịch nghĩa: Quá trình xuống máy bay, mà các chi tiết của nó đã được phác thảo trong hướng dẫn, mất hơn một giờ. | Giải thích: Chủ ngữ của mệnh đề quan hệ "the details" ở số nhiều, do đó yêu cầu động từ quá khứ số nhiều "were".',
    part: 5, topic: 'travel', difficulty: 900
  },

  // --- TECHNOLOGY ---
  // 500
  {
    question: 'The new system allows users _____ log in with their fingerprint.',
    choiceA: 'to', choiceB: 'for', choiceC: 'at', choiceD: 'with',
    correctAnswer: 'A',
    explanation: 'The verb structure "allow someone to do something" requires the infinitive marker "to".',
    explanationVi: 'Dịch nghĩa: Hệ thống mới cho phép người dùng đăng nhập bằng vân tay của họ. | Giải thích: Cấu trúc động từ "allow someone to do something" yêu cầu từ nguyên mẫu "to".',
    part: 5, topic: 'technology', difficulty: 500
  },
  {
    question: 'The company will update its software _____ Friday evening.',
    choiceA: 'on', choiceB: 'at', choiceC: 'in', choiceD: 'with',
    correctAnswer: 'A',
    explanation: 'The preposition "on" is used before specific days of the week, such as "on Friday".',
    explanationVi: 'Dịch nghĩa: Công ty sẽ cập nhật phần mềm của mình vào tối thứ Sáu. | Giải thích: Giới từ "on" được sử dụng trước các ngày cụ thể trong tuần, như "on Friday".',
    part: 5, topic: 'technology', difficulty: 500
  },
  // 600
  {
    question: 'The computer program _____ executed automatically after the system reboot.',
    choiceA: 'is', choiceB: 'was', choiceC: 'were', choiceD: 'being',
    correctAnswer: 'B',
    explanation: 'The past event of the system reboot indicates the program "was executed" (past passive).',
    explanationVi: 'Dịch nghĩa: Chương trình máy tính đã được thực thi tự động sau khi khởi động lại hệ thống. | Giải thích: Sự kiện khởi động lại hệ thống ở quá khứ chỉ ra rằng chương trình "was executed" (bị động quá khứ).',
    part: 5, topic: 'technology', difficulty: 600
  },
  {
    question: 'The internal network was secured _____ by the IT cybersecurity experts.',
    choiceA: 'complete', choiceB: 'completely', choiceC: 'completion', choiceD: 'completing',
    correctAnswer: 'B',
    explanation: 'The adverb "completely" modifies the passive verb phrase "was secured".',
    explanationVi: 'Dịch nghĩa: Mạng nội bộ đã được bảo mật hoàn toàn bởi các chuyên gia an ninh mạng CNTT. | Giải thích: Trạng từ "completely" bổ nghĩa cho cụm động từ bị động "was secured".',
    part: 5, topic: 'technology', difficulty: 600
  },
  // 700
  {
    question: 'Please secure the database before _____ the server update.',
    choiceA: 'start', choiceB: 'starting', choiceC: 'started', choiceD: 'starts',
    correctAnswer: 'B',
    explanation: 'The preposition "before" is followed by the gerund "starting" to denote chronology.',
    explanationVi: 'Dịch nghĩa: Vui lòng bảo mật cơ sở dữ liệu trước khi bắt đầu cập nhật máy chủ. | Giải thích: Giới từ "before" được theo sau bởi danh động từ "starting" để chỉ thời gian.',
    part: 5, topic: 'technology', difficulty: 700
  },
  {
    question: 'We need to migrate all customer profiles to a secure database _____ prevent data loss.',
    choiceA: 'so that', choiceB: 'in order to', choiceC: 'because of', choiceD: 'although',
    correctAnswer: 'B',
    explanation: 'The phrase "in order to" is followed by the base verb "prevent" to express purpose.',
    explanationVi: 'Dịch nghĩa: Chúng ta cần di chuyển tất cả hồ sơ khách hàng sang cơ sở dữ liệu bảo mật để ngăn ngừa mất mát dữ liệu. | Giải thích: Cụm từ "in order to" được theo sau bởi động từ nguyên mẫu "prevent" để chỉ mục đích.',
    part: 5, topic: 'technology', difficulty: 700
  },
  // 800
  {
    question: 'The IT department decided to implement a firewall _____ protect the server network.',
    choiceA: 'so that', choiceB: 'in order to', choiceC: 'because of', choiceD: 'as long as',
    correctAnswer: 'B',
    explanation: 'The infinitive phrase "in order to" expresses purpose and fits before the verb "protect".',
    explanationVi: 'Dịch nghĩa: Bộ phận CNTT đã quyết định triển khai tường lửa để bảo vệ mạng máy chủ. | Giải thích: Cụm động từ nguyên mẫu "in order to" thể hiện mục đích và đứng trước động từ "protect".',
    part: 5, topic: 'technology', difficulty: 800
  },
  {
    question: 'The system was optimized, _____ made the website load much faster.',
    choiceA: 'whose', choiceB: 'which', choiceC: 'that', choiceD: 'what',
    correctAnswer: 'B',
    explanation: 'The relative pronoun "which" is used after a comma to refer to the entire preceding clause.',
    explanationVi: 'Dịch nghĩa: Hệ thống đã được tối ưu hóa, giúp trang web tải nhanh hơn nhiều. | Giải thích: Đại từ quan hệ "which" được dùng sau dấu phẩy để chỉ toàn bộ mệnh đề đi trước.',
    part: 5, topic: 'technology', difficulty: 800
  },
  // 900
  {
    question: 'Were the encryption codes _____ updated, the server database would not have been compromised.',
    choiceA: 'regular', choiceB: 'regularly', choiceC: 'regularity', choiceD: 'regularize',
    correctAnswer: 'B',
    explanation: 'This is an inverted third conditional sentence. The adverb "regularly" modifies the participle "updated".',
    explanationVi: 'Dịch nghĩa: Nếu các mã hóa được cập nhật thường xuyên, cơ sở dữ liệu máy chủ đã không bị xâm nhập. | Giải thích: Đây là câu điều kiện loại 3 đảo ngữ. Trạng từ "regularly" bổ nghĩa cho phân từ "updated".',
    part: 5, topic: 'technology', difficulty: 900
  },
  {
    question: 'The software compatibility issue, _____ we had warned the team, caused the system crash.',
    choiceA: 'which', choiceB: 'about which', choiceC: 'whose', choiceD: 'that',
    correctAnswer: 'B',
    explanation: 'The relative clause requires the preposition "about" because we warn someone "about" something ("about which").',
    explanationVi: 'Dịch nghĩa: Vấn đề tương thích phần mềm, mà chúng tôi đã cảnh báo cho nhóm, đã khiến hệ thống bị hỏng. | Giải thích: Mệnh đề quan hệ yêu cầu giới từ "about" vì cấu trúc là cảnh báo ai đó "về" cái gì ("about which").',
    part: 5, topic: 'technology', difficulty: 900
  },

  // --- SHIPPING ---
  // 500
  {
    question: 'The courier will deliver the package directly _____ your house.',
    choiceA: 'to', choiceB: 'at', choiceC: 'in', choiceD: 'for',
    correctAnswer: 'A',
    explanation: 'The verb "deliver" takes the preposition "to" to indicate destination.',
    explanationVi: 'Dịch nghĩa: Người giao hàng sẽ giao gói hàng trực tiếp đến nhà bạn. | Giải thích: Động từ "deliver" đi với giới từ "to" để chỉ nơi đến.',
    part: 5, topic: 'shipping', difficulty: 500
  },
  {
    question: 'The cargo ship has already _____ from the port.',
    choiceA: 'depart', choiceB: 'departed', choiceC: 'departing', choiceD: 'departs',
    correctAnswer: 'B',
    explanation: 'The present perfect auxiliary "has" requires the past participle "departed" to indicate completion.',
    explanationVi: 'Dịch nghĩa: Tàu chở hàng đã khởi hành từ cảng. | Giải thích: Trợ động từ hoàn thành "has" yêu cầu phân từ quá khứ "departed" để chỉ hành động đã hoàn thành.',
    part: 5, topic: 'shipping', difficulty: 500
  },
  // 600
  {
    question: 'The shipping carrier _____ the goods early yesterday morning.',
    choiceA: 'transport', choiceB: 'transported', choiceC: 'transporting', choiceD: 'will transport',
    correctAnswer: 'B',
    explanation: 'The simple past tense "transported" matches the past time expression "yesterday morning".',
    explanationVi: 'Dịch nghĩa: Hãng vận tải đã vận chuyển hàng hóa vào sáng sớm ngày hôm qua. | Giải thích: Thì quá khứ đơn "transported" phù hợp với cụm từ chỉ thời gian quá khứ "yesterday morning".',
    part: 5, topic: 'shipping', difficulty: 600
  },
  {
    question: 'We need to select a reliable transport carrier _____ avoid shipping delays.',
    choiceA: 'so that', choiceB: 'to', choiceC: 'because', choiceD: 'although',
    correctAnswer: 'B',
    explanation: 'The preposition "to" acts as an infinitive of purpose, short for "in order to".',
    explanationVi: 'Dịch nghĩa: Chúng ta cần chọn một hãng vận tải đáng tin cậy để tránh chậm trễ vận chuyển. | Giải thích: Giới từ "to" đóng vai trò là động từ chỉ mục đích, viết tắt của "in order to".',
    part: 5, topic: 'shipping', difficulty: 600
  },
  // 700
  {
    question: 'The shipment was inspected by customs officers before it _____ cleared.',
    choiceA: 'is', choiceB: 'was', choiceC: 'were', choiceD: 'has been',
    correctAnswer: 'B',
    explanation: 'The past events of the sentence require the past passive voice "was cleared" for the singular noun "it".',
    explanationVi: 'Dịch nghĩa: Lô hàng đã được kiểm tra bởi các nhân viên hải quan trước khi thông quan. | Giải thích: Sự kiện trong quá khứ yêu cầu thể bị động ở quá khứ "was cleared" cho danh từ số ít "it".',
    part: 5, topic: 'shipping', difficulty: 700
  },
  {
    question: 'Please check the customs regulations before _____ the electronic components.',
    choiceA: 'import', choiceB: 'importing', choiceC: 'imported', choiceD: 'imports',
    correctAnswer: 'B',
    explanation: 'After the preposition "before", the gerund form "importing" is required.',
    explanationVi: 'Dịch nghĩa: Vui lòng kiểm tra các quy định hải quan trước khi nhập khẩu các linh kiện điện tử. | Giải thích: Sau giới từ "before", dạng danh động từ "importing" là bắt buộc.',
    part: 5, topic: 'shipping', difficulty: 700
  },
  // 800
  {
    question: 'The warehouse manager performed an inventory check _____ verify the stock levels.',
    choiceA: 'so that', choiceB: 'in order to', choiceC: 'because of', choiceD: 'although',
    correctAnswer: 'B',
    explanation: 'The purpose phrase "in order to" is followed by the base verb "verify".',
    explanationVi: 'Dịch nghĩa: Quản lý kho đã thực hiện kiểm tra hàng tồn kho để xác minh mức độ tồn kho. | Giải thích: Cụm từ chỉ mục đích "in order to" được theo sau bởi động từ nguyên mẫu "verify".',
    part: 5, topic: 'shipping', difficulty: 800
  },
  {
    question: 'The package was dispatched yesterday, _____ means it should arrive tomorrow.',
    choiceA: 'whose', choiceB: 'which', choiceC: 'that', choiceD: 'what',
    correctAnswer: 'B',
    explanation: 'The relative pronoun "which" is used here to modify the entire preceding clause.',
    explanationVi: 'Dịch nghĩa: Gói hàng đã được gửi đi ngày hôm qua, có nghĩa là nó sẽ đến vào ngày mai. | Giải thích: Đại từ quan hệ "which" được sử dụng ở đây để bổ nghĩa cho toàn bộ mệnh đề đi trước.',
    part: 5, topic: 'shipping', difficulty: 800
  },
  // 900
  {
    question: 'Only after the logistics manager had verified the consignments _____ the shipment leave the port.',
    choiceA: 'the ship did', choiceB: 'did the ship', choiceC: 'the ship would', choiceD: 'would the ship did',
    correctAnswer: 'B',
    explanation: 'The sentence starts with "Only after...", which triggers inversion. The auxiliary "did" comes before the subject.',
    explanationVi: 'Dịch nghĩa: Chỉ sau khi người quản lý hậu cần xác minh các lô hàng ký gửi, tàu mới rời cảng. | Giải thích: Câu bắt đầu bằng "Only after...", kích hoạt hiện tượng đảo ngữ. Trợ động từ "did" đứng trước chủ ngữ.',
    part: 5, topic: 'shipping', difficulty: 900
  },
  {
    question: 'The cargo consignment, the delivery of which _____ delayed by customs, finally arrived.',
    choiceA: 'is', choiceB: 'was', choiceC: 'were', choiceD: 'are',
    correctAnswer: 'B',
    explanation: 'The relative clause subject "the delivery" is singular, requiring the singular past verb "was".',
    explanationVi: 'Dịch nghĩa: Lô hàng ký gửi, có việc giao hàng bị trì hoãn bởi hải quan, cuối cùng đã đến nơi. | Giải thích: Relative clause subject "the delivery" is singular, requiring the singular past verb "was".',
    part: 5, topic: 'shipping', difficulty: 900
  },

  // --- HOTEL ---
  // 500
  {
    question: 'The guest checked into _____ room at three o\'clock.',
    choiceA: 'he', choiceB: 'him', choiceC: 'his', choiceD: 'himself',
    correctAnswer: 'C',
    explanation: 'The possessive adjective "his" is required before the noun "room".',
    explanationVi: 'Dịch nghĩa: Khách đã nhận phòng của mình lúc ba giờ. | Giải thích: Tính từ sở hữu "his" được yêu cầu đứng trước danh từ "room".',
    part: 5, topic: 'hotel', difficulty: 500
  },
  {
    question: 'The hotel receptionist welcomed the guests _____ the lobby.',
    choiceA: 'on', choiceB: 'at', choiceC: 'in', choiceD: 'with',
    correctAnswer: 'C',
    explanation: 'We use the preposition "in" for enclosed spaces like "in the lobby".',
    explanationVi: 'Dịch nghĩa: Lễ tân khách sạn đã chào đón khách tại sảnh chờ. | Giải thích: Chúng ta sử dụng giới từ "in" cho các không gian khép kín như "in the lobby".',
    part: 5, topic: 'hotel', difficulty: 500
  },
  // 600
  {
    question: 'The room service _____ prepared by the hotel chef last night.',
    choiceA: 'is', choiceB: 'was', choiceC: 'were', choiceD: 'being',
    correctAnswer: 'B',
    explanation: 'The past indicator "last night" requires the past passive auxiliary verb "was".',
    explanationVi: 'Dịch nghĩa: Dịch vụ phòng đã được chuẩn bị bởi đầu bếp khách sạn vào tối qua. | Giải thích: Trạng từ chỉ thời gian quá khứ "last night" yêu cầu trợ động từ bị động quá khứ "was".',
    part: 5, topic: 'hotel', difficulty: 600
  },
  {
    question: 'The lobby was _____ decorated for the annual holiday conference.',
    choiceA: 'beautiful', choiceB: 'beautifully', choiceC: 'beauty', choiceD: 'beautify',
    correctAnswer: 'B',
    explanation: 'The adverb "beautifully" is needed to modify the participle "decorated".',
    explanationVi: 'Dịch nghĩa: Sảnh chờ đã được trang trí đẹp mắt cho hội nghị kỳ nghỉ thường niên. | Giải thích: Trạng từ "beautifully" là cần thiết để bổ nghĩa cho phân từ "decorated".',
    part: 5, topic: 'hotel', difficulty: 600
  },
  // 700
  {
    question: 'The tourist completed the check-in process before _____ the hotel facilities.',
    choiceA: 'use', choiceB: 'using', choiceC: 'used', choiceD: 'uses',
    correctAnswer: 'B',
    explanation: 'The preposition "before" is followed by the gerund form "using".',
    explanationVi: 'Dịch nghĩa: Khách du lịch đã hoàn thành thủ tục nhận phòng trước khi sử dụng các dịch vụ của khách sạn. | Giải thích: Giới từ "before" được theo sau bởi dạng danh động từ "using".',
    part: 5, topic: 'hotel', difficulty: 700
  },
  {
    question: 'We had to wait at the reception _____ the hotel was fully booked.',
    choiceA: 'because', choiceB: 'although', choiceC: 'unless', choiceD: 'despite',
    correctAnswer: 'A',
    explanation: 'The conjunction "because" introduces a clause explaining the reason for waiting.',
    explanationVi: 'Dịch nghĩa: Chúng tôi đã phải đợi ở quầy tiếp tân vì khách sạn đã được đặt kín phòng. | Giải thích: Liên từ "because" giới thiệu mệnh đề giải thích lý do phải chờ đợi.',
    part: 5, topic: 'hotel', difficulty: 700
  },
  // 800
  {
    question: 'The hotel provides free breakfast, _____ is a standard amenity for business guests.',
    choiceA: 'who', choiceB: 'which', choiceC: 'that', choiceD: 'whose',
    correctAnswer: 'B',
    explanation: 'The relative pronoun "which" is used after a comma to refer to the non-human noun phrase "free breakfast".',
    explanationVi: 'Dịch nghĩa: Khách sạn cung cấp bữa sáng miễn phí, đây là một tiện nghi tiêu chuẩn cho khách đi công tác. | Giải thích: Đại từ quan hệ "which" được dùng sau dấu phẩy để chỉ cụm danh từ chỉ vật "free breakfast".',
    part: 5, topic: 'hotel', difficulty: 800
  },
  {
    question: 'The concierge assisted the guest _____ booking a tour around the city.',
    choiceA: 'with', choiceB: 'at', choiceC: 'for', choiceD: 'about',
    correctAnswer: 'A',
    explanation: 'The verb phrase "assist someone with something" requires the preposition "with".',
    explanationVi: 'Dịch nghĩa: Nhân viên hỗ trợ đã giúp khách đặt một chuyến tham quan quanh thành phố. | Giải thích: Cấu trúc động từ "assist someone with something" yêu cầu giới từ "with".',
    part: 5, topic: 'hotel', difficulty: 800
  },
  // 900
  {
    question: 'Had the resort managed its bookings better, its occupancy rate _____ higher.',
    choiceA: 'would be', choiceB: 'will be', choiceC: 'would have been', choiceD: 'had been',
    correctAnswer: 'C',
    explanation: 'This is an inverted third conditional sentence. The result clause requires "would have been".',
    explanationVi: 'Dịch nghĩa: Nếu khu nghỉ dưỡng quản lý việc đặt phòng tốt hơn, tỷ lệ lấp đầy phòng của nó đã cao hơn. | Giải thích: Đây là câu điều kiện loại 3 đảo ngữ. Mệnh đề kết quả yêu cầu "would have been".',
    part: 5, topic: 'hotel', difficulty: 900
  },
  {
    question: 'The hospitality seminar, _____ speakers are industry leaders, starts next Tuesday.',
    choiceA: 'who', choiceB: 'whose', choiceC: 'whom', choiceD: 'which',
    correctAnswer: 'B',
    explanation: 'The possessive relative pronoun "whose" modifies the noun "speakers" showing relation to "the hospitality seminar".',
    explanationVi: 'Dịch nghĩa: Hội thảo ngành dịch vụ, có các diễn giả là những người dẫn đầu ngành, bắt đầu vào thứ Ba tới. | Giải thích: Đại từ quan hệ sở hữu "whose" bổ nghĩa cho danh từ "speakers" chỉ mối quan hệ với "the hospitality seminar".',
    part: 5, topic: 'hotel', difficulty: 900
  },

  // --- EMAIL ---
  // 500
  {
    question: 'Please send your reply _____ the marketing director as soon as possible.',
    choiceA: 'at', choiceB: 'to', choiceC: 'with', choiceD: 'for',
    correctAnswer: 'B',
    explanation: 'The noun "reply" takes the preposition "to" to indicate the recipient of the reply.',
    explanationVi: 'Dịch nghĩa: Vui lòng gửi câu trả lời của bạn cho giám đốc tiếp thị càng sớm càng tốt. | Giải thích: Danh từ "reply" đi với giới từ "to" để chỉ người nhận phản hồi.',
    part: 5, topic: 'email', difficulty: 500
  },
  {
    question: 'I received an email message _____ Mr. Smith about the budget.',
    choiceA: 'from', choiceB: 'at', choiceC: 'to', choiceD: 'by',
    correctAnswer: 'A',
    explanation: 'The preposition "from" indicates the source or sender of the message.',
    explanationVi: 'Dịch nghĩa: Tôi đã nhận được một tin nhắn email từ ông Smith về ngân sách. | Giải thích: Giới từ "from" chỉ nguồn hoặc người gửi tin nhắn.',
    part: 5, topic: 'email', difficulty: 500
  },
  // 600
  {
    question: 'The attachment _____ sent to the wrong email address yesterday.',
    choiceA: 'is', choiceB: 'was', choiceC: 'were', choiceD: 'being',
    correctAnswer: 'B',
    explanation: 'The past indicator "yesterday" requires the singular past passive verb "was".',
    explanationVi: 'Dịch nghĩa: Tệp đính kèm đã được gửi đến sai địa chỉ email ngày hôm qua. | Giải thích: Trạng từ quá khứ "yesterday" yêu cầu động từ bị động quá khứ số ít "was".',
    part: 5, topic: 'email', difficulty: 600
  },
  {
    question: 'The administrative assistant _____ replied to the customer inquiry.',
    choiceA: 'prompt', choiceB: 'promptly', choiceC: 'promptness', choiceD: 'prompts',
    correctAnswer: 'B',
    explanation: 'The adverb "promptly" modifies the verb "replied".',
    explanationVi: 'Dịch nghĩa: Trợ lý hành chính đã phản hồi nhanh chóng câu hỏi của khách hàng. | Giải thích: Trạng từ "promptly" bổ nghĩa cho động từ "replied".',
    part: 5, topic: 'email', difficulty: 600
  },
  // 700
  {
    question: 'Please check the subject line before _____ the email message.',
    choiceA: 'send', choiceB: 'sending', choiceC: 'sent', choiceD: 'sends',
    correctAnswer: 'B',
    explanation: 'After the preposition "before", the gerund form "sending" is required.',
    explanationVi: 'Dịch nghĩa: Vui lòng kiểm tra dòng tiêu đề trước khi gửi tin nhắn email. | Giải thích: Sau giới từ "before", dạng danh động từ "sending" là bắt buộc.',
    part: 5, topic: 'email', difficulty: 700
  },
  {
    question: 'Mr. Black replied to the client _____ confirm the receipt of files.',
    choiceA: 'so that', choiceB: 'to', choiceC: 'because of', choiceD: 'although',
    correctAnswer: 'B',
    explanation: 'The preposition "to" acts as an infinitive of purpose, meaning "in order to".',
    explanationVi: 'Dịch nghĩa: Ông Black đã trả lời khách hàng để xác nhận việc nhận tài liệu. | Giải thích: Giới từ "to" đóng vai trò là động từ chỉ mục đích, có nghĩa là "để".',
    part: 5, topic: 'email', difficulty: 700
  },
  // 800
  {
    question: 'We confirmed the order details _____ the client had sent the confirmation email.',
    choiceA: 'after', choiceB: 'during', choiceC: 'despite', choiceD: 'unless',
    correctAnswer: 'A',
    explanation: 'The temporal conjunction "after" logically introduces the action that occurred first.',
    explanationVi: 'Dịch nghĩa: Chúng tôi đã xác nhận chi tiết đơn hàng sau khi khách hàng gửi email xác nhận. | Giải thích: Liên từ chỉ thời gian "after" giới thiệu một cách hợp lý hành động đã xảy ra trước.',
    part: 5, topic: 'email', difficulty: 800
  },
  {
    question: 'The email was forwarded to the marketing team, _____ was a good decision.',
    choiceA: 'who', choiceB: 'which', choiceC: 'that', choiceD: 'whom',
    correctAnswer: 'B',
    explanation: 'The relative pronoun "which" refers to the entire action of forwarding the email.',
    explanationVi: 'Dịch nghĩa: Email đã được chuyển tiếp đến đội ngũ tiếp thị, đó là một quyết định sáng suốt. | Giải thích: Đại từ quan hệ "which" chỉ toàn bộ hành động chuyển tiếp email.',
    part: 5, topic: 'email', difficulty: 800
  },
  // 900
  {
    question: 'Should you not receive any reply, please forward this correspondence to the _____ recipient.',
    choiceA: 'intend', choiceB: 'intended', choiceC: 'intention', choiceD: 'intending',
    correctAnswer: 'B',
    explanation: 'The past participle adjective "intended" modifies the noun "recipient", meaning the planned receiver.',
    explanationVi: 'Dịch nghĩa: Nếu bạn không nhận được bất kỳ phản hồi nào, vui lòng chuyển tiếp thư từ này cho người nhận dự kiến. | Giải thích: Tính từ phân từ quá khứ "intended" bổ nghĩa cho danh từ "recipient", có nghĩa là người nhận dự kiến.',
    part: 5, topic: 'email', difficulty: 900
  },
  {
    question: 'The email correspondence, the recipient of which _____ unknown, was returned to sender.',
    choiceA: 'is', choiceB: 'were', choiceC: 'was', choiceD: 'are',
    correctAnswer: 'C',
    explanation: 'The relative clause subject is the singular noun phrase "the recipient", requiring the singular past verb "was".',
    explanationVi: 'Dịch nghĩa: Thư từ giao dịch qua email, có người nhận không xác định, đã bị trả lại cho người gửi. | Giải thích: Chủ ngữ của mệnh đề quan hệ là cụm danh từ số ít "the recipient", yêu cầu động từ quá khứ số ít "was".',
    part: 5, topic: 'email', difficulty: 900
  }
];

// File writing function
function writeCsvFiles() {
  // 1. Vocabulary CSV
  const vocabHeaders = ['word', 'pronunciation', 'partOfSpeech', 'definition', 'definitionNative', 'example', 'exampleTranslation', 'topic', 'difficulty', 'synonyms'];
  const vocabLines = [vocabHeaders.join(',')];
  for (const item of VOCABULARY_DATA) {
    const row = [
      item.word,
      item.pronunciation,
      item.partOfSpeech,
      item.definition,
      item.definitionNative,
      item.example,
      item.exampleTranslation,
      item.topic,
      item.difficulty,
      item.synonyms
    ];
    vocabLines.push(toCsvRow(row));
  }
  
  const vocabCsvPath = path.join(__dirname, '..', 'vocabulary_100.csv');
  fs.writeFileSync(vocabCsvPath, vocabLines.join('\n'), 'utf8');
  console.log(`Successfully generated ${VOCABULARY_DATA.length} vocabulary words at ${vocabCsvPath}`);

  // 2. Questions CSV
  const questionHeaders = ['question', 'choiceA', 'choiceB', 'choiceC', 'choiceD', 'correctAnswer', 'explanation', 'explanationVi', 'part', 'topic', 'difficulty'];
  const questionLines = [questionHeaders.join(',')];
  for (const item of QUESTIONS_DATA) {
    const row = [
      item.question,
      item.choiceA,
      item.choiceB,
      item.choiceC,
      item.choiceD,
      item.correctAnswer,
      item.explanation,
      item.explanationVi,
      item.part,
      item.topic,
      item.difficulty
    ];
    questionLines.push(toCsvRow(row));
  }

  const questionsCsvPath = path.join(__dirname, '..', 'grammar_quiz_100.csv');
  fs.writeFileSync(questionsCsvPath, questionLines.join('\n'), 'utf8');
  console.log(`Successfully generated ${QUESTIONS_DATA.length} grammar questions at ${questionsCsvPath}`);
}

writeCsvFiles();
