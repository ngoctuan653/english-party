import { db } from '@/services/firebase/config';
import { doc, writeBatch, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import type { Question } from '@/types/question';
import type { VocabWord } from '@/types/vocabulary';

// High-quality TOEIC Part 5 Questions
const SEED_QUESTIONS: Omit<Question, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'q_seed_1',
    exam: 'toeic',
    part: 5,
    type: 'mcq',
    topic: 'business',
    difficulty: 700,
    question: 'The board of directors approved the merger because the company had _____ its financial goals for three consecutive years.',
    choices: ['exceed', 'exceeded', 'exceeding', 'excessive'],
    correctAnswer: 1,
    explanation: 'The past perfect tense "had exceeded" is required here to indicate that the action of exceeding financial goals occurred before the board\'s approval in the past. | Thì quá khứ hoàn thành "had exceeded" được yêu cầu ở đây để chỉ ra rằng hành động vượt mục tiêu tài chính đã xảy ra trước sự chấp thuận của hội đồng quản trị trong quá khứ.',
    tags: ['grammar', 'verb-tense', 'past-perfect'],
    isActive: true,
    timesAnswered: 0,
    timesCorrect: 0,
    createdBy: 'system_seed',
  },
  {
    id: 'q_seed_2',
    exam: 'toeic',
    part: 5,
    type: 'mcq',
    topic: 'office',
    difficulty: 600,
    question: 'Please submit your travel expense reports directly to the accounting department _____ next Friday afternoon.',
    choices: ['by', 'until', 'since', 'during'],
    correctAnswer: 0,
    explanation: '"by" is used to specify a deadline (at or before next Friday afternoon), whereas "until" indicates a continuous action leading up to a time. | "by" được dùng để chỉ một hạn chót (vào hoặc trước chiều thứ Sáu tới), trong khi "until" chỉ một hành động liên tục kéo dài cho đến một thời điểm.',
    tags: ['grammar', 'prepositions', 'deadline'],
    isActive: true,
    timesAnswered: 0,
    timesCorrect: 0,
    createdBy: 'system_seed',
  },
  {
    id: 'q_seed_3',
    exam: 'toeic',
    part: 5,
    type: 'mcq',
    topic: 'meetings',
    difficulty: 700,
    question: 'Mr. Henderson chose to delegate the project representation to Ms. Alvarez, who is _____ qualified for the task.',
    choices: ['high', 'highly', 'height', 'higher'],
    explanation: 'We need the adverb "highly" to modify the adjective "qualified". "Highly qualified" is also a common business English collocation. | Chúng ta cần trạng từ "highly" để bổ nghĩa cho tính từ "qualified". "Highly qualified" cũng là một cụm từ tiếng Anh thương mại phổ biến.',
    correctAnswer: 1,
    tags: ['grammar', 'adverbs', 'word-form'],
    isActive: true,
    timesAnswered: 0,
    timesCorrect: 0,
    createdBy: 'system_seed',
  },
  {
    id: 'q_seed_4',
    exam: 'toeic',
    part: 5,
    type: 'mcq',
    topic: 'shipping',
    difficulty: 800,
    question: '_____ the unexpected delay at the customs border, the shipment of electronic parts arrived on schedule.',
    choices: ['Although', 'Despite', 'Because', 'Unless'],
    correctAnswer: 1,
    explanation: '"Despite" is a preposition and must be followed by a noun phrase ("the unexpected delay..."). "Although" would require a full clause with a verb. | "Despite" là một giới từ và phải được theo sau bởi một cụm danh từ ("the unexpected delay..."). "Although" sẽ yêu cầu một mệnh đề đầy đủ có động từ.',
    tags: ['grammar', 'conjunctions', 'prepositions'],
    isActive: true,
    timesAnswered: 0,
    timesCorrect: 0,
    createdBy: 'system_seed',
  },
  {
    id: 'q_seed_5',
    exam: 'toeic',
    part: 5,
    type: 'mcq',
    topic: 'technology',
    difficulty: 700,
    question: 'The software developers worked overnight so that the application update would be _____ functional by morning.',
    choices: ['complete', 'completion', 'completed', 'completely'],
    correctAnswer: 3,
    explanation: 'The adverb "completely" is required to modify the adjective "functional". | Trạng từ "completely" được yêu cầu để bổ nghĩa cho tính từ "functional".',
    tags: ['grammar', 'adverbs', 'word-form'],
    isActive: true,
    timesAnswered: 0,
    timesCorrect: 0,
    createdBy: 'system_seed',
  },
  {
    id: 'q_seed_6',
    exam: 'toeic',
    part: 5,
    type: 'mcq',
    topic: 'finance',
    difficulty: 800,
    question: 'If the manufacturing costs had not escalated, the factory\'s quarterly profits _____ substantially larger.',
    choices: ['would be', 'will be', 'would have been', 'had been'],
    correctAnswer: 2,
    explanation: 'This is a third conditional sentence representing an unreal past situation. The condition "If... had not escalated" matches with the result clause "would have been". | Đây là câu điều kiện loại 3 diễn tả một tình huống không có thật trong quá khứ. Điều kiện "If... had not escalated" đi kèm với mệnh đề kết quả "would have been".',
    tags: ['grammar', 'conditionals', 'past-unreal'],
    isActive: true,
    timesAnswered: 0,
    timesCorrect: 0,
    createdBy: 'system_seed',
  },
  {
    id: 'q_seed_7',
    exam: 'toeic',
    part: 5,
    type: 'mcq',
    topic: 'marketing',
    difficulty: 600,
    question: 'Our new marketing strategy is designed to attract customers who are _____ in energy-efficient household appliances.',
    choices: ['interest', 'interesting', 'interested', 'interests'],
    correctAnswer: 2,
    explanation: 'The phrase "be interested in something" is the correct passive adjective construction to describe a state of curiosity or concern. | Cụm từ "be interested in something" là cấu trúc tính từ bị động chính xác để mô tả trạng thái tò mò hoặc quan tâm.',
    tags: ['grammar', 'adjectives', 'participle-adjectives'],
    isActive: true,
    timesAnswered: 0,
    timesCorrect: 0,
    createdBy: 'system_seed',
  },
  {
    id: 'q_seed_8',
    exam: 'toeic',
    part: 5,
    type: 'mcq',
    topic: 'healthcare',
    difficulty: 700,
    question: 'Dr. Carter advised that patients who undergo physical therapy should perform their exercises _____ to recover quickly.',
    choices: ['regular', 'regularly', 'regularize', 'regularity'],
    correctAnswer: 1,
    explanation: 'The adverb "regularly" is needed to modify the verb "perform" (how they should perform their exercises). | Trạng từ "regularly" là cần thiết để bổ nghĩa cho động từ "perform" (họ nên thực hiện các bài tập của mình như thế nào).',
    tags: ['grammar', 'adverbs', 'word-form'],
    isActive: true,
    timesAnswered: 0,
    timesCorrect: 0,
    createdBy: 'system_seed',
  },
  {
    id: 'q_seed_9',
    exam: 'toeic',
    part: 5,
    type: 'mcq',
    topic: 'education',
    difficulty: 750,
    question: 'The university\'s academic senate proposed a revision to the curriculum guidelines, _____ to make research internships mandatory.',
    choices: ['aimed', 'aiming', 'aims', 'aim'],
    correctAnswer: 1,
    explanation: 'The present participle "aiming" begins a reduced relative clause modifying the proposal/revision, expressing current intention ("which aims to make..."). | Hiện tại phân từ "aiming" bắt đầu một mệnh đề quan hệ rút gọn bổ nghĩa cho đề xuất/sửa đổi, thể hiện mục đích hiện tại ("nhằm mục đích làm cho...").',
    tags: ['grammar', 'participles', 'reduced-relative'],
    isActive: true,
    timesAnswered: 0,
    timesCorrect: 0,
    createdBy: 'system_seed',
  },
  {
    id: 'q_seed_10',
    exam: 'toeic',
    part: 5,
    type: 'mcq',
    topic: 'travel',
    difficulty: 650,
    question: 'Passengers are strictly reminded that they must keep their luggage _____ at all times while in the airport terminal.',
    choices: ['attended', 'attending', 'attendance', 'attention'],
    correctAnswer: 0,
    explanation: 'The passive structure "keep their luggage attended" fits the requirement of the sentence object complement. | Cấu trúc bị động "keep their luggage attended" (giữ hành lý được trông coi) phù hợp với yêu cầu làm tân ngữ bổ trợ trong câu.',
    tags: ['grammar', 'passive', 'past-participle'],
    isActive: true,
    timesAnswered: 0,
    timesCorrect: 0,
    createdBy: 'system_seed',
  },
];

// High-quality TOEIC Vocabulary words with English definitions & Vietnamese translations
const SEED_VOCABULARY: Omit<VocabWord, 'createdAt'>[] = [
  {
    id: 'v_seed_1',
    exam: 'toeic',
    word: 'Collaborate',
    pronunciation: 'kəˈlæbəreɪt',
    partOfSpeech: 'verb',
    definition: 'To work jointly with others or together, especially in an intellectual endeavor.',
    definitionNative: 'Hợp tác, cộng tác',
    example: 'Researchers from several top universities decided to collaborate on the project.',
    exampleTranslation: 'Các nhà nghiên cứu từ một số trường đại học hàng đầu đã quyết định hợp tác trong dự án.',
    topic: 'meetings',
    difficulty: 700,
    synonyms: ['cooperate', 'team up', 'conspire'],
    tags: ['collaboration', 'business-relations'],
    isActive: true,
  },
  {
    id: 'v_seed_2',
    exam: 'toeic',
    word: 'Implement',
    pronunciation: 'ˈɪmplɪment',
    partOfSpeech: 'verb',
    definition: 'To put a decision, plan, or agreement into effect.',
    definitionNative: 'Thi hành, thực hiện, áp dụng',
    example: 'The board voted to implement the new safety regulations starting next month.',
    exampleTranslation: 'Ban giám đốc đã biểu quyết thực hiện các quy định an toàn mới bắt đầu từ tháng tới.',
    topic: 'office',
    difficulty: 700,
    synonyms: ['execute', 'enforce', 'apply', 'carry out'],
    tags: ['actions', 'plans'],
    isActive: true,
  },
  {
    id: 'v_seed_3',
    exam: 'toeic',
    word: 'Innovative',
    pronunciation: 'ˈɪnəveɪtɪv',
    partOfSpeech: 'adjective',
    definition: 'Introducing new ideas or methods; original and creative.',
    definitionNative: 'Sáng tạo, đổi mới, có tính đột phá',
    example: 'The company is famous for its innovative product designs and clever marketing.',
    exampleTranslation: 'Công ty nổi tiếng với các thiết kế sản phẩm sáng tạo và tiếp thị thông minh.',
    topic: 'marketing',
    difficulty: 750,
    synonyms: ['creative', 'original', 'novel', 'revolutionary'],
    tags: ['creativity', 'products'],
    isActive: true,
  },
  {
    id: 'v_seed_4',
    exam: 'toeic',
    word: 'Comply',
    pronunciation: 'kəmˈplaɪ',
    partOfSpeech: 'verb',
    definition: 'To act in accordance with a wish, command, rule, or instruction.',
    definitionNative: 'Tuân thủ, làm theo',
    example: 'All factories must comply with environmental protection standards.',
    exampleTranslation: 'Tất cả các nhà máy phải tuân thủ các tiêu chuẩn bảo vệ môi trường.',
    topic: 'business',
    difficulty: 800,
    synonyms: ['obey', 'adhere', 'conform', 'observe'],
    tags: ['rules', 'regulations'],
    isActive: true,
  },
  {
    id: 'v_seed_5',
    exam: 'toeic',
    word: 'Negotiate',
    pronunciation: 'nɪˈɡəʊʃɪeɪt',
    partOfSpeech: 'verb',
    definition: 'To try to reach an agreement or compromise by discussion with others.',
    definitionNative: 'Thương lượng, đàm phán',
    example: 'Our sales representative managed to negotiate a highly favorable supply contract.',
    exampleTranslation: 'Đại diện bán hàng của chúng tôi đã xoay sở để đàm phán được một hợp đồng cung cấp rất có lợi.',
    topic: 'business',
    difficulty: 700,
    synonyms: ['bargain', 'mediate', 'discuss', 'settle'],
    tags: ['contracts', 'agreements'],
    isActive: true,
  },
  {
    id: 'v_seed_6',
    exam: 'toeic',
    word: 'Acquire',
    pronunciation: 'əˈkwaɪə(r)',
    partOfSpeech: 'verb',
    definition: 'To buy or obtain an asset or object, or to learn a new skill.',
    definitionNative: 'Mua lại, đạt được, thâu tóm',
    example: 'The tech giant plans to acquire a promising artificial intelligence startup.',
    exampleTranslation: 'Gã khổng lồ công nghệ có kế hoạch mua lại một công ty khởi nghiệp trí tuệ nhân tạo đầy hứa hẹn.',
    topic: 'finance',
    difficulty: 800,
    synonyms: ['obtain', 'purchase', 'gain', 'procure'],
    tags: ['finance', 'mergers'],
    isActive: true,
  },
  {
    id: 'v_seed_7',
    exam: 'toeic',
    word: 'Annual',
    pronunciation: 'ˈænjuəl',
    partOfSpeech: 'adjective',
    definition: 'Occurring once every year.',
    definitionNative: 'Thường niên, hàng năm',
    example: 'Employees are looking forward to receiving their bonuses at the annual general meeting.',
    exampleTranslation: 'Nhân viên đang rất mong chờ được nhận tiền thưởng tại cuộc họp đại hội đồng thường niên.',
    topic: 'finance',
    difficulty: 500,
    synonyms: ['yearly', 'every twelve months'],
    tags: ['time', 'events'],
    isActive: true,
  },
  {
    id: 'v_seed_8',
    exam: 'toeic',
    word: 'Agenda',
    pronunciation: 'əˈdʒendə',
    partOfSpeech: 'noun',
    definition: 'A list of items to be discussed at a formal meeting.',
    definitionNative: 'Chương trình nghị sự, lịch trình họp',
    example: 'The budget review is the first item on the agenda for this afternoon\'s board meeting.',
    exampleTranslation: 'Đánh giá ngân sách là mục đầu tiên trong chương trình nghị sự cho cuộc họp hội đồng quản trị chiều nay.',
    topic: 'meetings',
    difficulty: 600,
    synonyms: ['schedule', 'program', 'timetable', 'itinerary'],
    tags: ['meetings', 'planning'],
    isActive: true,
  },
  {
    id: 'v_seed_9',
    exam: 'toeic',
    word: 'Terminate',
    pronunciation: 'ˈtɜːmɪneɪt',
    partOfSpeech: 'verb',
    definition: 'To bring to an end; close or conclude.',
    definitionNative: 'Chấm dứt, hủy bỏ, hoàn thành',
    example: 'Either party has the right to terminate the contract with a 30-day written notice.',
    exampleTranslation: 'Bất kỳ bên nào cũng có quyền chấm dứt hợp đồng với thông báo bằng văn bản trước 30 ngày.',
    topic: 'business',
    difficulty: 800,
    synonyms: ['end', 'cancel', 'conclude', 'finish'],
    tags: ['contracts', 'law'],
    isActive: true,
  },
  {
    id: 'v_seed_10',
    exam: 'toeic',
    word: 'Subsidiary',
    pronunciation: 'səbˈsɪdiəri',
    partOfSpeech: 'noun',
    definition: 'A company controlled by a holding or parent company.',
    definitionNative: 'Công ty con, chi nhánh con',
    example: 'The international conglomerate owns a manufacturing subsidiary in Vietnam.',
    exampleTranslation: 'Tập đoàn quốc tế sở hữu một công ty con sản xuất tại Việt Nam.',
    topic: 'finance',
    difficulty: 850,
    synonyms: ['branch', 'division', 'affiliate'],
    tags: ['companies', 'structure'],
    isActive: true,
  },
  {
    id: 'v_seed_11',
    exam: 'toeic',
    word: 'Delegate',
    pronunciation: 'ˈdelɪɡət',
    partOfSpeech: 'verb',
    definition: 'To entrust a task or responsibility to another person, typically one who is less senior.',
    definitionNative: 'Ủy thác, giao việc, phân quyền',
    example: 'An effective manager knows how to delegate work to team members.',
    exampleTranslation: 'Một người quản lý hiệu quả biết cách ủy thác công việc cho các thành viên trong nhóm.',
    topic: 'office',
    difficulty: 750,
    synonyms: ['assign', 'entrust', 'hand over', 'depute'],
    tags: ['management', 'leadership'],
    isActive: true,
  },
  {
    id: 'v_seed_12',
    exam: 'toeic',
    word: 'Lucrative',
    pronunciation: 'ˈluːkrətɪv',
    partOfSpeech: 'adjective',
    definition: 'Producing a great deal of profit.',
    definitionNative: 'Sinh lợi, có lời, béo bở',
    example: 'The real estate developer secured a lucrative deal to construct the new office complex.',
    exampleTranslation: 'Nhà phát triển bất động sản đã đạt được một thỏa thuận béo bở để xây dựng khu phức hợp văn phòng mới.',
    topic: 'finance',
    difficulty: 800,
    synonyms: ['profitable', 'worthwhile', 'gainful', 'rewarding'],
    tags: ['money', 'deals'],
    isActive: true,
  },
  {
    id: 'v_seed_13',
    exam: 'toeic',
    word: 'Provisional',
    pronunciation: 'prəˈvɪʒənl',
    partOfSpeech: 'adjective',
    definition: 'Arranged or existing for the present, possibly to be changed later.',
    definitionNative: 'Tạm thời, lâm thời',
    example: 'The committee came to a provisional agreement until formal terms could be drafted.',
    exampleTranslation: 'Ủy ban đã đi đến một thỏa thuận tạm thời cho đến khi các điều khoản chính thức được dự thảo.',
    topic: 'meetings',
    difficulty: 800,
    synonyms: ['temporary', 'interim', 'tentative', 'conditional'],
    tags: ['decisions', 'time'],
    isActive: true,
  },
  {
    id: 'v_seed_14',
    exam: 'toeic',
    word: 'Strategic',
    pronunciation: 'strəˈtiːdʒɪk',
    partOfSpeech: 'adjective',
    definition: 'Relating to the identification of long-term or overall aims and interests and the means of achieving them.',
    definitionNative: 'Mang tính chiến lược',
    example: 'Opening an e-commerce channel was a strategic move to boost global sales.',
    exampleTranslation: 'Mở một kênh thương mại điện tử là một bước đi chiến lược nhằm thúc đẩy doanh số bán hàng toàn cầu.',
    topic: 'marketing',
    difficulty: 700,
    synonyms: ['tactical', 'calculated', 'deliberate', 'planned'],
    tags: ['strategy', 'planning'],
    isActive: true,
  },
  {
    id: 'v_seed_15',
    exam: 'toeic',
    word: 'Surplus',
    pronunciation: 'ˈsɜːpləs',
    partOfSpeech: 'noun',
    definition: 'An amount of something left over when requirements have been met; an excess of production or supply.',
    definitionNative: 'Thặng dư, số dư thừa',
    example: 'The government reported a budget surplus of several billion dollars for the fiscal year.',
    exampleTranslation: 'Chính phủ báo cáo thặng dư ngân sách vài tỷ đô la cho năm tài khóa.',
    topic: 'finance',
    difficulty: 800,
    synonyms: ['excess', 'overplus', 'glut', 'remainder'],
    tags: ['finance', 'supplies'],
    isActive: true,
  },
];

/**
 * Seeds the database with high-quality default questions and vocabulary.
 * Merges with existing records to avoid duplicates.
 */
export async function seedDatabase(
  onProgress?: (progress: string) => void
): Promise<{ questionsAdded: number; vocabAdded: number }> {
  let questionsAdded = 0;
  let vocabAdded = 0;

  try {
    // 1. Seed Questions
    if (onProgress) onProgress('Checking for existing questions...');
    const questionsQuery = await getDocs(collection(db, 'questions'));
    const existingQuestionIds = new Set(questionsQuery.docs.map((doc) => doc.id));

    if (onProgress) onProgress('Importing questions...');
    const questionBatch = writeBatch(db);
    let questionBatchCount = 0;

    for (const question of SEED_QUESTIONS) {
      if (!existingQuestionIds.has(question.id)) {
        const docRef = doc(db, 'questions', question.id);
        questionBatch.set(docRef, {
          ...question,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        questionBatchCount++;
        questionsAdded++;
      }
    }

    if (questionBatchCount > 0) {
      await questionBatch.commit();
    }

    // 2. Seed Vocabulary
    if (onProgress) onProgress('Checking for existing vocabulary...');
    const vocabQuery = await getDocs(collection(db, 'vocabulary'));
    const existingVocabIds = new Set(vocabQuery.docs.map((doc) => doc.id));

    if (onProgress) onProgress('Importing vocabulary words...');
    const vocabBatch = writeBatch(db);
    let vocabBatchCount = 0;

    for (const vocab of SEED_VOCABULARY) {
      if (!existingVocabIds.has(vocab.id)) {
        const docRef = doc(db, 'vocabulary', vocab.id);
        vocabBatch.set(docRef, {
          ...vocab,
          createdAt: serverTimestamp(),
        });
        vocabBatchCount++;
        vocabAdded++;
      }
    }

    if (vocabBatchCount > 0) {
      await vocabBatch.commit();
    }

    if (onProgress) onProgress('Seeding process completed successfully!');
    return { questionsAdded, vocabAdded };
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
}
