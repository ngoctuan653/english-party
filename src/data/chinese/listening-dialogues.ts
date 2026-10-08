import type { HSKLevel } from '@/types/chinese';

export interface ChineseListeningDialogue {
  id: string;
  title: string;
  titleVi: string;
  hskLevel: HSKLevel;
  situationVi: string;
  turns: Array<{
    speaker: string;
    hanzi: string;
    pinyin: string;
    meaningVi: string;
  }>;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanationVi: string;
  }>;
}

export const CHINESE_LISTENING_DIALOGUES: ChineseListeningDialogue[] = [
  // ==========================================
  // HSK 1 DIALOGUES
  // ==========================================
  {
    id: 'listen_hsk1_restaurant',
    title: '在饭馆吃饭 (At the Restaurant)',
    titleVi: 'Hội thoại tại nhà hàng',
    hskLevel: 'hsk1',
    situationVi: 'Hai người bạn cùng nhau đi ăn trưa tại một quán mì truyền thống.',
    turns: [
      {
        speaker: '服务员',
        hanzi: '你好，欢迎光临！两位想吃点什么？',
        pinyin: 'Nǐ hǎo, huānyíng guānglín! Liǎng wèi xiǎng chī diǎnr shénme?',
        meaningVi: 'Xin chào, hoan nghênh quý khách! Hai vị muốn dùng món gì ạ?'
      },
      {
        speaker: '王明',
        hanzi: '我要一碗牛肉面，不要太辣。你呢，小李？',
        pinyin: 'Wǒ yào yì wǎn niúròumiàn, bú yào tài là. Nǐ ne, Xiǎo Lǐ?',
        meaningVi: 'Cho tôi một bát mì bò, đừng cay quá. Còn bạn thì sao, Tiểu Lý?'
      },
      {
        speaker: '小李',
        hanzi: '我吃米饭和鸡蛋西红柿。再给我们两杯冰茶，谢谢。',
        pinyin: 'Wǒ chī mǐfàn hé jīdàn xīhóngshì. Zài gěi wǒmen liǎng bēi bīng chá, xièxie.',
        meaningVi: 'Tôi ăn cơm và món trứng xào cà chua. Cho chúng tôi thêm hai cốc trà đá nữa, cảm ơn.'
      },
      {
        speaker: '服务员',
        hanzi: '好的，请稍等，菜马上就来。',
        pinyin: 'Hǎo de, qǐng shāoděng, cài mǎshàng jiù lái.',
        meaningVi: 'Dạ được, xin vui lòng đợi chút, món sẽ lên ngay ạ.'
      }
    ],
    questions: [
      {
        id: 'q1',
        question: '王明想吃什么？(Vương Minh muốn ăn món gì?)',
        options: ['米饭 (Cơm)', '牛肉面 (Mì thịt bò)', '包子 (Bánh bao)'],
        correctAnswerIndex: 1,
        explanationVi: 'Vương Minh nói: "我要一碗牛肉面" (Tôi muốn một bát mì bò).'
      },
      {
        id: 'q2',
        question: '他们一共要了几杯冰茶？(Họ đã gọi mấy ly trà đá?)',
        options: ['一杯 (1 ly)', '两杯 (2 ly)', '三杯 (3 ly)'],
        correctAnswerIndex: 1,
        explanationVi: 'Tiểu Lý yêu cầu: "再给我们两杯冰茶" (Cho chúng tôi thêm 2 ly trà đá).'
      }
    ]
  },
  {
    id: 'listen_hsk1_shopping',
    title: '买水果 (Buying Fruits)',
    titleVi: 'Mua hoa quả ở chợ',
    hskLevel: 'hsk1',
    situationVi: 'Khách hàng hỏi giá và mua táo tại sạp hoa quả.',
    turns: [
      {
        speaker: '顾客',
        hanzi: '老板，请问这个苹果一斤多少钱？',
        pinyin: 'Lǎobǎn, qǐngwèn zhè ge píngguǒ yì jīn duōshao qián?',
        meaningVi: 'Ông chủ, xin hỏi táo này bao nhiêu tiền một cân (nửa kg)?'
      },
      {
        speaker: '老板',
        hanzi: '五块钱一斤，很甜很新鲜！',
        pinyin: 'Wǔ kuài qián yì jīn, hěn tián hěn xīnxiān!',
        meaningVi: 'Năm tệ một cân, ngọt và tươi lắm!'
      },
      {
        speaker: '顾客',
        hanzi: '太贵了，四块钱可以吗？我要三斤。',
        pinyin: 'Tài guì le, sì kuài qián kěyǐ ma? Wǒ yào sān jīn.',
        meaningVi: 'Đắt quá, bốn tệ được không? Tôi lấy 3 cân.'
      },
      {
        speaker: '老板',
        hanzi: '行吧，给你称三斤，一共十二块钱。',
        pinyin: 'Xíng ba, gěi nǐ chēng sān jīn, yígòng shí\'èr kuài qián.',
        meaningVi: 'Được thôi, cân cho cô 3 cân, tổng cộng 12 tệ.'
      }
    ],
    questions: [
      {
        id: 'q_shop_1',
        question: '最后顾客买了几斤苹果？ (Cuối cùng khách mua mấy cân táo?)',
        options: ['两斤 (2 cân)', '三斤 (3 cân)', '五斤 (5 cân)'],
        correctAnswerIndex: 1,
        explanationVi: 'Khách yêu cầu: "我要三斤" và ông chủ đã cân 3 cân.'
      }
    ]
  },

  // ==========================================
  // HSK 2 DIALOGUES
  // ==========================================
  {
    id: 'listen_hsk2_asking_way',
    title: '问路去火车站 (Asking for Directions)',
    titleVi: 'Hỏi đường đến ga tàu hỏa',
    hskLevel: 'hsk2',
    situationVi: 'Một người khách hỏi đường người qua đường để đi đến ga xe lửa.',
    turns: [
      {
        speaker: '游客',
        hanzi: '您好，请问去火车站怎么走？离这里远不远？',
        pinyin: 'Nín hǎo, qǐngwèn qù huǒchēzhàn zěnme zǒu? Lí zhèlǐ yuǎn bù yuǎn?',
        meaningVi: 'Chào bác, xin hỏi đi ga tàu hỏa đi thế nào? Có cách đây xa không?'
      },
      {
        speaker: '路人',
        hanzi: '不远。你一直往前走，到了红绿灯往右拐，再走两百米就到了。',
        pinyin: 'Bù yuǎn. Nǐ yìzhí wǎng qián zǒu, dào le hónglǜdēng wǎng yòu guǎi, zài zǒu liǎng bǎi mǐ jiù dào le.',
        meaningVi: 'Không xa đâu. Cháu cứ đi thẳng, đến đèn giao thông thì rẽ phải, đi thêm 200m nữa là đến.'
      },
      {
        speaker: '游客',
        hanzi: '走着去大概需要多长时间？',
        pinyin: 'Zǒu zhe qù dàgài xūyào duō cháng shíjiān?',
        meaningVi: 'Đi bộ đến đó mất khoảng bao lâu ạ?'
      },
      {
        speaker: '路人',
        hanzi: '大概十分钟左右。如果你赶时间，可以坐公交车。',
        pinyin: 'Dàgài shí fēnzhōng zuǒyòu. Rúguǒ nǐ gǎn shíjiān, kěyǐ zuò gōngjiāochē.',
        meaningVi: 'Khoảng 10 phút thôi. Nếu cháu vội thời gian thì có thể đi xe buýt.'
      }
    ],
    questions: [
      {
        id: 'q_dir_1',
        question: '到红绿灯后应该往哪边拐？ (Đến đèn giao thông thì rẽ về hướng nào?)',
        options: ['往左拐 (Rẽ trái)', '往右拐 (Rẽ phải)', '往后走 (Quay đầu)'],
        correctAnswerIndex: 1,
        explanationVi: 'Người đi đường chỉ: "往右拐" (rẽ phải).'
      }
    ]
  },

  // ==========================================
  // HSK 3 DIALOGUES
  // ==========================================
  {
    id: 'listen_hsk3_hotel',
    title: '在宾馆办理入住 (Hotel Check-in)',
    titleVi: 'Nhận phòng tại khách sạn',
    hskLevel: 'hsk3',
    situationVi: 'Khách đến quầy lễ tân để làm thủ tục nhận phòng đã đặt trước qua mạng.',
    turns: [
      {
        speaker: '前台',
        hanzi: '下午好，先生！请问您预订房间了吗？',
        pinyin: 'Xiàwǔ hǎo, xiānsheng! Qǐngwèn nín yùdìng fángjiān le ma?',
        meaningVi: 'Chào buổi chiều, thưa ngài! Xin hỏi ngài đã đặt trước phòng chưa ạ?'
      },
      {
        speaker: '客人',
        hanzi: '是的，我叫张伟，在网上预订了一间大床房。',
        pinyin: 'Shì de, wǒ jiào Zhāng Wěi, zài wǎngshang yùdìng le yì jiān dàchuángfáng.',
        meaningVi: 'Đúng vậy, tôi tên Trương Vĩ, đã đặt trước trên mạng một phòng giường đôi.'
      },
      {
        speaker: '前台',
        hanzi: '好的，请出示您的身份证或者护照。我们需要登记一下。',
        pinyin: 'Hǎo de, qǐng chūshì nín de shēnfènzhèng huòzhě hùzhào. Wǒmen xūyào dēngjì yíxià.',
        meaningVi: 'Vâng, xin ngài xuất trình căn cước công dân hoặc hộ chiếu. Chúng tôi cần đăng ký thông tin ạ.'
      },
      {
        speaker: '客人',
        hanzi: '给你。请问房费里包含早餐吗？',
        pinyin: 'Gěi nǐ. Qǐngwèn fángfèi lǐ bāohán zǎocān ma?',
        meaningVi: 'Gửi cô. Cho tôi hỏi trong tiền phòng đã bao gồm bữa sáng chưa?'
      },
      {
        speaker: '前台',
        hanzi: '包含的。明天早上七点到九点，在二楼餐厅用餐。这是您的房卡，房号是808。',
        pinyin: 'Bāohán de. Míngtiān zǎoshang qī diǎn dào jiǔ diǎn, zài èr lóu cāntīng yòngcān. Zhè shì nín de fángkǎ, fánghào shì bābǎilíngbā.',
        meaningVi: 'Đã bao gồm rồi ạ. Sáng mai từ 7 giờ đến 9 giờ dùng bữa tại nhà hàng tầng 2. Đây là thẻ phòng của ngài, số phòng là 808.'
      }
    ],
    questions: [
      {
        id: 'q_hotel_1',
        question: '早餐是在几楼？ (Bữa sáng ăn tại tầng mấy?)',
        options: ['一楼 (Tầng 1)', '二楼 (Tầng 2)', '八楼 (Tầng 8)'],
        correctAnswerIndex: 1,
        explanationVi: 'Lễ tân nói: "在二楼餐厅用餐" (dùng bữa tại nhà hàng tầng 2).'
      }
    ]
  },

  // ==========================================
  // HSK 4 DIALOGUES
  // ==========================================
  {
    id: 'listen_hsk4_business_meeting',
    title: '商务洽谈与合作 (Business Discussion)',
    titleVi: 'Trao đổi thương mại và ký kết hợp tác',
    hskLevel: 'hsk4',
    situationVi: 'Hai giám đốc thảo luận về chi tiết hợp đồng và kế hoạch hợp tác lâu dài.',
    turns: [
      {
        speaker: '王总',
        hanzi: '陈经理，关于这次的项目合同，贵公司还有什么需要补充的意见吗？',
        pinyin: 'Chén jīnglǐ, guānyú zhè cì de xiàngmù hétong, guì gōngsī hái yǒu shénme xūyào bǔchōng de yìjiàn ma?',
        meaningVi: 'Giám đốc Trần, về hợp đồng dự án lần này, quý công ty còn có ý kiến gì cần bổ sung không?'
      },
      {
        speaker: '陈经理',
        hanzi: '王总，我们对整体方案非常满意。只是关于交货日期，能不能提前两周？因为市场需求非常迫切。',
        pinyin: 'Wáng zǒng, wǒmen duì zhěngtǐ fāng\'àn fēicháng mǎnyì. Zhǐshì guānyú jiāohuò rìqī, néng bù néng tíqián liǎng zhōu? Yīnwèi shìchǎng xūqiú fēicháng pòqiè.',
        meaningVi: 'Thưa Vương tổng, chúng tôi rất hài lòng với phương án tổng thể. Chỉ là về ngày giao hàng, liệu có thể đẩy sớm 2 tuần được không? Vì nhu cầu thị trường đang rất cấp thiết.'
      },
      {
        speaker: '王总',
        hanzi: '为了保证产品质量，提前两周确实有难度。不过我们可以安排工厂加班，尽力争取提前十天交货，您看如何？',
        pinyin: 'Wèile bǎozhèng chǎnpǐn zhìliàng, tíqián liǎng zhōu quèshí yǒu nándù. Búguò wǒmen kěyǐ ānpái gōngchǎng jiābān, jìnlì zhēngqǔ tíqián shí tiān jiāohuò, nín kàn rúhé?',
        meaningVi: 'Để đảm bảo chất lượng sản phẩm, đẩy sớm 2 tuần thực sự có độ khó. Tuy nhiên chúng tôi có thể bố trí nhà máy tăng ca, cố gắng hết sức giao hàng sớm 10 ngày, ông thấy thế nào?'
      },
      {
        speaker: '陈经理',
        hanzi: '非常感谢王总的诚意！那就按照提前十天的方案定下来，预祝我们合作愉快！',
        pinyin: 'Fēicháng gǎnxiè Wáng zǒng de chéngyì! Nà jiù ànzhào tíqián shí tiān de fāng\'àn dìng xiàlái, yùzhù wǒmen hézuò yúkuài!',
        meaningVi: 'Rất cảm ơn thành ý của Vương tổng! Vậy ta chốt theo phương án giao sớm 10 ngày nhé, chúc sự hợp tác của chúng ta thành công vui vẻ!'
      }
    ],
    questions: [
      {
        id: 'q_biz_1',
        question: '双方最终商定的交货日期提前了几天？ (Hai bên thống nhất giao hàng sớm mấy ngày?)',
        options: ['七天 (7 ngày)', '十天 (10 ngày)', '两周 (14 ngày)'],
        correctAnswerIndex: 1,
        explanationVi: 'Vương tổng đề xuất và Trần giám đốc đồng ý: "争取提前十天交货".'
      }
    ]
  }
];
