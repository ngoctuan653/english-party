import type { SpeakingExamQuestion, SpeakingScenario } from '@/types/speaking';

export const SPEAKING_SCENARIOS: SpeakingScenario[] = [
  {
    id: 'job-interview',
    title: 'Software Developer Job Interview',
    viTitle: 'Phỏng vấn xin việc Tech',
    description: 'Practice answering common behavioral and technical interview questions with an empathetic hiring manager.',
    icon: '💼',
    level: 'B2',
    category: 'business',
    starterPrompt:
      "Hello! Welcome to our team interview. We are thrilled to speak with you today. To kick things off, could you briefly introduce yourself and tell me what drew you to this role?",
    aiPersona:
      'Friendly and professional Senior Tech Recruiter. You ask insightful follow-up questions based on the candidate’s answers.',
    suggestedPhrases: [
      'I have been working as...',
      'My primary strength lies in...',
      'One project I took pride in was...',
      'I am particularly eager to contribute to...',
    ],
  },
  {
    id: 'cafe-order',
    title: 'Ordering at a Specialty Café',
    viTitle: 'Gọi đồ uống tại quán cà phê',
    description: 'Learn how to order beverages, customize milk/sweetness, and ask for recommendations naturally.',
    icon: '☕',
    level: 'A2',
    category: 'daily',
    starterPrompt:
      "Good morning! Welcome to Artisanal Roast. What can I get started for you today?",
    aiPersona:
      'Cheerful barista at a busy café. You take orders, ask about sizes, milk preferences, and recommend pastries.',
    suggestedPhrases: [
      'Could I get a hot latte, please?',
      'Can I substitute oat milk?',
      'Do you have any dairy-free options?',
      'How much does that come to?',
    ],
  },
  {
    id: 'hotel-checkin',
    title: 'Hotel Check-in & Concierge Request',
    viTitle: 'Check-in khách sạn & hỏi thông tin',
    description: 'Check into your hotel room, ask for amenities, and request recommendations for local dining.',
    icon: '🏨',
    level: 'B1',
    category: 'travel',
    starterPrompt:
      "Good evening, welcome to the Grand Horizon Hotel. How may I assist you with your stay tonight?",
    aiPersona:
      'Polite hotel front desk concierge who confirms reservations, explains hotel amenities, and gives local travel tips.',
    suggestedPhrases: [
      'I have a reservation under the name...',
      'Is breakfast included in the booking?',
      'Could you recommend a good seafood restaurant nearby?',
      'What time is checkout tomorrow?',
    ],
  },
  {
    id: 'business-negotiation',
    title: 'Contract & Pricing Negotiation',
    viTitle: 'Đàm phán hợp đồng & chi phí',
    description: 'Discuss contract terms, negotiate project timelines, and reach a mutually beneficial agreement.',
    icon: '🤝',
    level: 'C1',
    category: 'business',
    starterPrompt:
      "Thank you for joining this meeting. We reviewed your initial proposal, and while we admire the deliverables, the pricing exceeds our current quarterly budget by about fifteen percent. Where do you see room for flexibility?",
    aiPersona:
      'Astute corporate procurement director looking for compromise without sacrificing quality.',
    suggestedPhrases: [
      'We could consider a phased rollout to mitigate costs...',
      'If you commit to an annual contract, we can offer a concession...',
      'Our priority is ensuring the deliverables meet your specifications...',
    ],
  },
  {
    id: 'airport-transit',
    title: 'Airport Customs & Missing Luggage',
    viTitle: 'Hải quan sân bay & Hành lý thất lạc',
    description: 'Report a delayed suitcase or navigate immigration questions at an international airport.',
    icon: '✈️',
    level: 'B1',
    category: 'travel',
    starterPrompt:
      "Hello, Border Protection and Baggage Services. How can I help you with your flight arrival today?",
    aiPersona:
      'Airport services officer helping passengers trace delayed bags or answer entry declaration queries.',
    suggestedPhrases: [
      'My luggage hasn\'t appeared on Carousel 4.',
      'Here is my baggage claim tag and boarding pass.',
      'I will be staying in the city for five days.',
    ],
  },
  {
    id: 'discuss-climate',
    title: 'Debate: Environmental Solutions',
    viTitle: 'Thảo luận giải pháp môi trường',
    description: 'Exchange viewpoints on renewable energy, carbon tax, and individual responsibility in climate change.',
    icon: '🌱',
    level: 'B2',
    category: 'academic',
    starterPrompt:
      "Welcome to today's seminar discussion. We're examining whether government regulation or consumer habit changes are more critical in tackling climate emissions. What is your stance on this?",
    aiPersona:
      'University seminar moderator who challenges assumptions politely and encourages analytical discourse.',
    suggestedPhrases: [
      'In my opinion, policy intervention is indispensable...',
      'While consumer choices matter, corporations account for...',
      'It is crucial that we transition towards...',
    ],
  },
  // --- 20 NEW AUTHENTIC TOPICS ---
  // Daily Life & Social
  {
    id: 'fast-food-order',
    title: 'Ordering Fast Food & Meal Combos',
    viTitle: 'Gọi đồ ăn nhanh tại quầy Burger',
    description: 'Order burgers, customize sides and beverages, and choose dipping sauces at a busy fast-food counter.',
    icon: '🍔',
    level: 'A1',
    category: 'daily',
    starterPrompt:
      "Hi there! Welcome to Burger Haven. Are you dining in or taking away today, and what can I get you started with?",
    aiPersona:
      'Upbeat, friendly fast-food cashier. You assist with combo meal options, drink sizes, and sauces.',
    suggestedPhrases: [
      'I would like a double cheeseburger combo, please.',
      'Could I swap the fries for onion rings?',
      'What dipping sauces do you have for nuggets?',
      'Can I get that for takeaway?',
    ],
  },
  {
    id: 'clothing-store-exchange',
    title: 'Returning an Item at a Clothing Store',
    viTitle: 'Đổi trả hàng tại shop thời trang',
    description: 'Explain an issue with a purchased jacket or shirt and request an exchange or store refund.',
    icon: '🛍️',
    level: 'A2',
    category: 'daily',
    starterPrompt:
      "Hello! Welcome to Urban Threads Customer Service. How can I help you with your purchase today?",
    aiPersona:
      'Helpful and accommodating retail store assistant who verifies receipts, inspects tags, and offers size or color exchanges.',
    suggestedPhrases: [
      'I bought this shirt yesterday, but it turns out to be too small.',
      'Could I exchange this for a size Medium?',
      'Here is my purchase receipt and the original tag.',
      'Would it be possible to get a refund or store credit?',
    ],
  },
  {
    id: 'doctor-consultation',
    title: "Doctor's Clinic: Describing Symptoms",
    viTitle: 'Khám bệnh & mô tả triệu chứng sức khỏe',
    description: 'Consult with a general practitioner doctor about feeling unwell, persistent cough, fever, or fatigue.',
    icon: '🩺',
    level: 'B1',
    category: 'daily',
    starterPrompt:
      "Good morning, please have a seat. I see you booked an appointment for today. Could you describe what symptoms you've been experiencing and when they started?",
    aiPersona:
      'Empathetic and thorough family physician. You listen carefully, ask follow-up questions about pain scale and duration, and recommend treatment.',
    suggestedPhrases: [
      'I have had a throbbing headache and a sore throat since Tuesday.',
      'My temperature went up to thirty-eight degrees last night.',
      'I feel dizzy whenever I stand up quickly.',
      'Do I need a prescription, or can I take over-the-counter medicine?',
    ],
  },
  {
    id: 'apartment-renting',
    title: 'Apartment Hunting & Lease Inquiry',
    viTitle: 'Hỏi thuê căn hộ & trao đổi hợp đồng',
    description: 'Inquire about a 1-bedroom apartment, rental deposit, utility bills, and neighborhood amenities with a leasing agent.',
    icon: '🏠',
    level: 'B1',
    category: 'daily',
    starterPrompt:
      "Hello! Thanks for your interest in the Maple Court Apartments. I'd be happy to show you around the one-bedroom unit. What questions do you have about the lease or the building?",
    aiPersona:
      'Knowledgeable property leasing manager who answers questions about rent, lease duration, amenities, and tenant rules.',
    suggestedPhrases: [
      'What is the monthly rent, and are utilities like water or internet included?',
      'How much is the security deposit required upfront?',
      'Is there dedicated parking available for residents?',
      'What is the pet policy for this building?',
    ],
  },
  {
    id: 'neighbor-small-talk',
    title: 'Small Talk with a New Neighbor',
    viTitle: 'Trò chuyện làm quen với hàng xóm mới',
    description: 'Break the ice with a neighbor by the garden, discuss the neighborhood, weather, and recommend local grocery spots.',
    icon: '🏡',
    level: 'A2',
    category: 'daily',
    starterPrompt:
      "Oh, hello there! You must be the new resident who moved into apartment 4B. Welcome to the building! How has your moving process been going?",
    aiPersona:
      'Warm and cheerful neighbor who enjoys welcoming new arrivals, sharing community tips, and casual banter.',
    suggestedPhrases: [
      'Hi! Yes, we just moved in over the weekend.',
      'Could you recommend a convenient supermarket nearby?',
      'How does the trash and recycling collection work here?',
      'It has been a bit hectic unpacking, but the neighborhood seems lovely!',
    ],
  },
  {
    id: 'dinner-invitation',
    title: 'Inviting a Friend to Dinner & Deciding Food',
    viTitle: 'Rủ bạn đi ăn tối & chọn quán',
    description: 'Chat casually with a college friend, propose meeting up for dinner, and agree on cuisine and time.',
    icon: '🍕',
    level: 'A2',
    category: 'daily',
    starterPrompt:
      "Hey! It feels like forever since we last hung out. I'm practically starving after work—are you free to grab some dinner together tonight?",
    aiPersona:
      'Close and spontaneous college friend. You react enthusiastically, suggest food cravings (ramen, tacos, BBQ), and coordinate plans.',
    suggestedPhrases: [
      'Hey, I would love to! What kind of food are you craving?',
      'How about that new authentic ramen place downtown?',
      'Does seven-thirty work for you, or is that too late?',
      'Let me book a table so we don\'t have to wait in line.',
    ],
  },
  {
    id: 'gym-membership',
    title: 'Gym Membership & Fitness Goals Consultation',
    viTitle: 'Tư vấn gói tập gym & huấn luyện viên',
    description: 'Discuss workout goals (weight loss, muscle gain) and choose a suitable gym package with a fitness advisor.',
    icon: '🏋️',
    level: 'B1',
    category: 'daily',
    starterPrompt:
      "Welcome to Peak Fitness! I'm Alex, one of the trainers here. Before we tour the equipment, tell me: what are your main fitness goals right now?",
    aiPersona:
      'Motivating and certified fitness consultant who helps clients design a workout plan and select membership options.',
    suggestedPhrases: [
      'I want to improve my cardiovascular endurance and lose a few kilos.',
      'Are personal training sessions included in the gold membership?',
      'What hours is the swimming pool and sauna open?',
      'Can I freeze my membership if I travel for work?',
    ],
  },

  // Business & Career
  {
    id: 'salary-negotiation',
    title: 'Salary & Promotion Negotiation',
    viTitle: 'Đàm phán tăng lương & thăng tiến',
    description: 'Present your accomplishments and negotiate a higher salary band and leadership responsibilities with your department director.',
    icon: '💰',
    level: 'B2',
    category: 'business',
    starterPrompt:
      "Thanks for setting up this one-on-one review. You've delivered impressive milestones this past year. I understand you wanted to discuss your compensation and future role?",
    aiPersona:
      'Pragmatic Department Director who respects high performers, discusses salary benchmarks, and seeks win-win commitments.',
    suggestedPhrases: [
      'Over the past year, my team exceeded our quarterly delivery target by twenty percent...',
      'Based on industry benchmarks for this senior title, I am targeting an adjustment of...',
      'I would love to take on formal mentorship and sprint planning responsibilities...',
      'Could we establish specific milestone targets for a mid-year bonus?',
    ],
  },
  {
    id: 'client-complaint',
    title: 'Handling an Urgent Client Complaint',
    viTitle: 'Xử lý khiếu nại khách hàng khẩn cấp',
    description: 'De-escalate an upset corporate client whose cloud system suffered downtime and provide an action plan.',
    icon: '📞',
    level: 'B2',
    category: 'business',
    starterPrompt:
      "Look, our entire e-commerce checkout has been down for over forty minutes during our peak marketing campaign! We are losing thousands of dollars every minute. What is your team doing about this?",
    aiPersona:
      'Frustrated enterprise client who demands immediate transparency, rapid technical resolution, and SLA compensation.',
    suggestedPhrases: [
      'I completely understand the severity of this issue, and I sincerely apologize for the disruption...',
      'Our senior DevOps team is currently rolling back the latest database migration...',
      'We anticipate service restoration within the next ten to fifteen minutes...',
      'I will personally send you a detailed post-mortem report and process our SLA credit...',
    ],
  },
  {
    id: 'agile-standup',
    title: 'Agile Sprint Daily Standup',
    viTitle: 'Báo cáo tiến độ Sprint Standup hàng ngày',
    description: 'Share your three standup updates: what you completed yesterday, what you plan to accomplish today, and any technical blockers.',
    icon: '📊',
    level: 'B2',
    category: 'business',
    starterPrompt:
      "Good morning team! Let's kick off our fifteen-minute daily standup. Let's start with your updates: what did you complete yesterday, what's on deck today, and are there any blockers?",
    aiPersona:
      'Efficient Scrum Master ensuring smooth sprint flow, identifying dependencies, and clearing team impediments.',
    suggestedPhrases: [
      'Yesterday, I finished implementing the user authentication API endpoints...',
      'Today, my focus is writing unit tests and integrating the payment webhook...',
      'I am currently blocked by the third-party sandbox API credentials...',
      'I will sync with the QA engineer right after this standup.',
    ],
  },
  {
    id: 'startup-pitch',
    title: 'Pitching a Tech Startup to an Angel Investor',
    viTitle: 'Thuyết trình gọi vốn khởi nghiệp',
    description: 'Pitch your innovative tech platform, defend your unit economics, and ask for seed funding from a seasoned investor.',
    icon: '🚀',
    level: 'C1',
    category: 'business',
    starterPrompt:
      "Welcome to our venture fund. Your pitch deck caught my eye, especially the customer retention curve. Give me your two-minute elevator pitch: what acute pain point does your product solve?",
    aiPersona:
      'Sharp Silicon Valley venture capitalist who probes market sizing, unfair competitive advantages, and customer acquisition costs.',
    suggestedPhrases: [
      'Our platform addresses a critical inefficiency in how supply chains track inventory...',
      'We have achieved a thirty percent month-over-month organic user growth...',
      'Our customer acquisition cost is remarkably low due to viral word-of-mouth...',
      'We are raising a seed round of one million dollars to accelerate engineering hiring...',
    ],
  },
  {
    id: 'deadline-extension',
    title: 'Requesting a Project Deadline Extension',
    viTitle: 'Xin sếp lùi hạn chót nộp dự án',
    description: 'Explain unexpected technical complications and propose a realistic revised timeline to your project manager.',
    icon: '⏳',
    level: 'B1',
    category: 'business',
    starterPrompt:
      "Hi, thanks for coming in. You mentioned in your message that the marketing campaign deliverables might not be ready by Friday. What happened, and what is your plan?",
    aiPersona:
      'Understanding yet results-oriented project manager who values honest communication and risk mitigation.',
    suggestedPhrases: [
      'We encountered unexpected compatibility issues during our cross-browser testing...',
      'To ensure top-tier quality, we would like to request an extension until Tuesday morning...',
      'I have already prioritized the core features so Phase 1 remains unaffected...',
      'Thank you for your understanding, I will keep you updated with daily progress reports.',
    ],
  },

  // Travel & Transportation
  {
    id: 'asking-directions-tube',
    title: 'Lost in London: Subway & Bus Directions',
    viTitle: 'Hỏi đường đi tàu điện ngầm tại London',
    description: 'Ask a subway station assistant how to get to Big Ben and the British Museum using the London Underground.',
    icon: '🚇',
    level: 'A2',
    category: 'travel',
    starterPrompt:
      "Good day! You look a bit puzzled by the transit map. Which destination are you trying to reach today?",
    aiPersona:
      'Friendly London Underground transit worker who explains Tube lines, transfers, and fare card options clearly.',
    suggestedPhrases: [
      'Excuse me, could you tell me which line goes to Westminster Station?',
      'Do I need to change trains at Piccadilly Circus?',
      'Can I simply tap my contactless credit card at the ticket barrier?',
      'How frequently do the northbound trains run during peak hours?',
    ],
  },
  {
    id: 'car-rental',
    title: 'Renting a Car at the Airport Counter',
    viTitle: 'Thuê xe tự lái tại quầy sân bay',
    description: 'Select a rental vehicle category, ask about unlimited mileage, and clarify insurance coverage.',
    icon: '🚗',
    level: 'B1',
    category: 'travel',
    starterPrompt:
      "Welcome to Enterprise Airport Car Rental. Do you have an existing reservation with us, or are you looking to book a vehicle today?",
    aiPersona:
      'Courteous car rental agent who guides travelers through vehicle tiers, collision insurance, and return fuel policies.',
    suggestedPhrases: [
      'I would like to rent a compact SUV with automatic transmission.',
      'Does this daily rate include unlimited mileage and roadside assistance?',
      'What are the details of the collision damage waiver insurance?',
      'Do I need to return the fuel tank completely full?',
    ],
  },
  {
    id: 'lost-passport-embassy',
    title: 'Emergency: Lost Passport Abroad',
    viTitle: 'Báo mất hộ chiếu & liên hệ đại sứ quán',
    description: 'Report a misplaced or stolen passport to consular services and request an emergency travel certificate for your flight home.',
    icon: '🆘',
    level: 'B2',
    category: 'travel',
    starterPrompt:
      "Consular Emergency Services. Take a deep breath—we help citizens through this every day. Please tell me what occurred and when your scheduled departure is.",
    aiPersona:
      'Calm and reassuring consular officer who provides clear emergency protocol, police report guidance, and expedited documents.',
    suggestedPhrases: [
      'My backpack was stolen at the train station, and my passport was inside...',
      'I already have an official police incident report number with me...',
      'My return flight is scheduled for the day after tomorrow...',
      'What documents do I need to bring for an emergency travel certificate?',
    ],
  },
  {
    id: 'adventure-tour-booking',
    title: 'Booking a Scuba Diving & Coral Tour',
    viTitle: 'Đặt tour lặn biển ngắm san hô',
    description: 'Inquire about scuba diving certifications, marine life sightings, safety gear, and boat schedules at a coastal resort.',
    icon: '🤿',
    level: 'B1',
    category: 'travel',
    starterPrompt:
      "Aloha! Welcome to Island Reef Adventures. Are you interested in our beginner snorkeling tour or our certified two-tank scuba dive today?",
    aiPersona:
      'Enthusiastic marine divemaster who prioritizes diver safety, highlights sea turtle sightings, and confirms equipment sizing.',
    suggestedPhrases: [
      'I have an Open Water PADI certification with about fifteen logged dives.',
      'Is all diving equipment, including wetsuit and regulator, provided?',
      'What are the chances of encountering sea turtles and reef sharks?',
      'What time does the morning boat depart from the harbor?',
    ],
  },

  // Academic, IELTS & Debate
  {
    id: 'ielts-ai-workplace',
    title: 'IELTS Part 3: AI & The Future of Jobs',
    viTitle: 'IELTS Part 3: Trí tuệ nhân tạo & Việc làm tương lai',
    description: 'Engage in an analytical discussion on whether automation will displace human workers or generate innovative industries.',
    icon: '🤖',
    level: 'B2',
    category: 'academic',
    starterPrompt:
      "Let's move on to Part 3. Some futurists argue that generative AI will replace white-collar professions, while others believe it will merely empower workers. Where do you stand on this spectrum?",
    aiPersona:
      'Thought-provoking IELTS examiner who probes arguments with analytical follow-ups like "To what extent?" and "Could you provide an example?".',
    suggestedPhrases: [
      'From my perspective, it is more likely to augment human productivity rather than replace it entirely...',
      'There is no denying that routine analytical tasks will become largely automated...',
      'The real challenge lies in whether educational institutions can retrain workers quickly enough...',
      'A prime illustration of this trend can be observed in modern software development...',
    ],
  },
  {
    id: 'vstep-cashless-society',
    title: 'VSTEP Speaking: Cashless Society vs Physical Cash',
    viTitle: 'VSTEP Speaking: Xã hội không tiền mặt',
    description: 'Debate the advantages of mobile payments versus privacy concerns and accessibility for elderly citizens in a cashless economy.',
    icon: '💳',
    level: 'B1',
    category: 'academic',
    starterPrompt:
      "Welcome to the VSTEP speaking exam. Today, many nations are transitioning towards a completely cashless society. In your opinion, does this trend bring more benefits or drawbacks to daily life?",
    aiPersona:
      'Supportive university language examiner who encourages structured arguments, balance, and real-world Vietnamese context.',
    suggestedPhrases: [
      'On the one hand, digital payments offer undeniable convenience and transaction transparency...',
      'On the other hand, we must take into account elderly individuals who may not own smartphones...',
      'Furthermore, network outages or cybersecurity vulnerabilities pose a notable risk...',
      'In conclusion, a hybrid model that preserves cash options seems the most prudent solution.',
    ],
  },
  {
    id: 'debate-degree-vs-experience',
    title: 'Debate: University Degree vs Hands-on Experience',
    viTitle: 'Tranh luận: Bằng đại học hay kinh nghiệm thực tế',
    description: 'Exchange structured arguments on whether a tertiary diploma is mandatory for career success in the modern economy.',
    icon: '🎓',
    level: 'B2',
    category: 'academic',
    starterPrompt:
      "Welcome to our academic debating session. Our motion today is: 'Practical work experience is substantially more valuable than a four-year university degree.' Are you speaking in favor or against this proposition?",
    aiPersona:
      'Rigorous academic debater who challenges generalizations, contrasts vocational fields with medicine/law, and asks for evidence.',
    suggestedPhrases: [
      'While hands-on experience provides immediate workplace readiness, a university education cultivates critical thinking...',
      'In specialized sectors like medicine, aviation, and civil engineering, formal certification is non-negotiable...',
      'Conversely, in dynamic creative and technology fields, portfolio work frequently trumps academic credentials...',
      'Ultimately, a synergy between academic theory and practical apprenticeships yields the greatest outcome.',
    ],
  },
  {
    id: 'ielts-social-media-impact',
    title: 'IELTS Part 3: The Impact of Social Media on Youth',
    viTitle: 'IELTS Part 3: Tác động của mạng xã hội đến giới trẻ',
    description: 'Discuss psychological well-being, attention spans, cyberbullying, and global connectedness among the younger generation.',
    icon: '📱',
    level: 'B2',
    category: 'academic',
    starterPrompt:
      "Let's discuss social media's broader influence on society. Many psychologists claim short-form video platforms diminish teenage attention spans and fuel anxiety. Do you share this concern?",
    aiPersona:
      'Inquisitive IELTS Speaking examiner exploring societal trends, psychological consequences, and personal observations.',
    suggestedPhrases: [
      'Without a doubt, the algorithmic design of these platforms fosters a continuous dopamine loop...',
      'On the positive side, social media democratizes information and allows youth to mobilize for social causes...',
      'However, the prevalence of curated lifestyles can exacerbate feelings of inadequacy and fear of missing out...',
      'To mitigate these adverse effects, digital literacy education should be integrated into high school curricula.',
    ],
  },
];

export const SPEAKING_EXAM_QUESTIONS: SpeakingExamQuestion[] = [
  {
    id: 'exam-p1-hometown',
    part: 1,
    topic: 'Hometown & Living Environment',
    viTopic: 'Quê hương & Môi trường sống',
    question: 'Where is your hometown, and what do you like most about living there?',
    prepTimeSeconds: 15,
    speakingTimeSeconds: 45,
    cuePoints: [
      'Location and general vibe of your hometown',
      'The aspects or amenities you appreciate most',
      'Whether you see yourself residing there in the future',
    ],
    level: 'B1',
  },
  {
    id: 'exam-p2-travel',
    part: 2,
    topic: 'A Memorable Journey',
    viTopic: 'Một chuyến đi đáng nhớ',
    question:
      'Describe a memorable trip you took that had a lasting impression on you. You should say where you went, whom you went with, what you did, and explain why it was so meaningful.',
    prepTimeSeconds: 45,
    speakingTimeSeconds: 90,
    cuePoints: [
      'Where and when you went',
      'Who accompanied you',
      'The standout activities or sights',
      'Why this experience remains vivid in your memory',
    ],
    level: 'B2',
  },
  {
    id: 'exam-p2-challenge',
    part: 2,
    topic: 'Overcoming a Difficult Challenge',
    viTopic: 'Vượt qua một thử thách khó khăn',
    question:
      'Describe a difficult obstacle or goal you encountered and successfully overcame. You should mention what the situation was, how you tackled it, and what you learned from the experience.',
    prepTimeSeconds: 45,
    speakingTimeSeconds: 90,
    cuePoints: [
      'What the obstacle or task was',
      'The steps you took to address it',
      'The emotional or technical hurdles involved',
      'The valuable lessons you gained',
    ],
    level: 'B2',
  },
  {
    id: 'exam-p3-ai-work',
    part: 3,
    topic: 'Artificial Intelligence & Future of Work',
    viTopic: 'Trí tuệ nhân tạo & Tương lai công việc',
    question:
      'How do you believe artificial intelligence will reshape traditional careers over the next decade, and should humans be concerned about workforce obsolescence?',
    prepTimeSeconds: 20,
    speakingTimeSeconds: 60,
    cuePoints: [
      'Impact on routine vs creative industries',
      'Importance of continuous upskilling',
      'Government and ethical considerations',
    ],
    level: 'C1',
  },
  {
    id: 'exam-p3-education',
    part: 3,
    topic: 'Online Learning vs Traditional Classrooms',
    viTopic: 'Học trực tuyến vs Lớp học truyền thống',
    question:
      'Will remote digital education eventually replace physical universities, or are there irreplaceable benefits to classroom interaction?',
    prepTimeSeconds: 20,
    speakingTimeSeconds: 60,
    cuePoints: [
      'Flexibility vs peer camaraderie and networking',
      'Practical hands-on disciplines',
      'The hybrid future of global education',
    ],
    level: 'B2',
  },
];
