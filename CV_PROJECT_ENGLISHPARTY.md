# EnglishParty - Hồ sơ dự án cho CV

Tài liệu này cung cấp nhiều phiên bản mô tả để sử dụng trong CV, portfolio, LinkedIn và phỏng vấn. Chỉ chọn những phần phù hợp, không đưa toàn bộ nội dung vào CV một trang.

## 1. Thông tin dự án

- **Tên dự án:** EnglishParty
- **Sản phẩm:** Nền tảng học tiếng Anh có gamification theo khung CEFR A1-C2 kết hợp AI Speaking Studio
- **Vai trò:** Full-stack Developer / Frontend Developer
- **Live demo:** [https://english-party.web.app](https://english-party.web.app)
- **Repository:** Bổ sung đường dẫn GitHub công khai tại đây
- **Trạng thái:** Đã triển khai production trên Firebase Hosting
- **Đối tượng:** Người học tiếng Anh muốn luyện tập toàn diện (Quiz, Vocab, Listening, AI Speaking) hằng ngày cùng bạn bè

> Khi trình bày, nên dùng cụm từ **CEFR-aligned**. Không gọi sản phẩm là “CEFR-certified” khi nội dung chưa được một tổ chức chuyên môn độc lập thẩm định.

## 2. Mô tả một câu

### Tiếng Việt

EnglishParty là nền tảng học tiếng Anh CEFR A1-C2 kết hợp luyện tập thích ứng, spaced repetition, AI Speaking Studio thời gian thực (Gemini LLM & TTS) và gamification toàn diện cho Grammar, Reading, Listening, Vocabulary và Speaking.

### English

EnglishParty is a gamified CEFR A1-C2 English learning platform combining adaptive practice, spaced repetition, real-time AI Speaking roleplay (Gemini LLM & TTS), and social gamification across all key language skills.

## 3. Phiên bản dùng trực tiếp trong CV

### Tiếng Việt

**EnglishParty - Nền tảng học tiếng Anh CEFR A1-C2 & AI Speaking Partner**  
*Full-stack Developer | React, TypeScript, Firebase, Gemini AI, Tailwind CSS*

- Xây dựng và triển khai nền tảng học tiếng Anh responsive theo khung CEFR A1-C2, bao gồm Grammar, Use of English, Reading, Listening, Vocabulary và Speaking.
- Tích hợp Google Gemini AI cho tính năng luyện nói tương tác qua micro theo 26 tình huống thực tế, phản hồi đàm thoại nhanh (< 1.2s), nhận diện ngắt câu thông minh và đánh giá theo 4 tiêu chí CEFR (Phát âm, Từ vựng, Ngữ pháp, Độ trôi chảy).
- Xây dựng luồng hội thoại hai chiều kết hợp Speech Recognition (nhận diện giọng nói) và Text-to-Speech (phát âm thanh tự nhiên tùy chọn giọng Nam/Nữ), tối ưu bộ nhớ đệm âm thanh để phát lại mượt mà trực tiếp trên trình duyệt.
- Phát triển hệ thống luyện tập thích ứng (Adaptive Practice), ưu tiên câu đến hạn ôn, câu có mastery thấp, câu từng trả lời sai và nội dung mới.
- Triển khai spaced repetition cho từ vựng với bốn mức Again, Hard, Good và Easy; tự động tính lịch ôn tiếp theo và theo dõi mức độ thành thạo.
- Xây dựng hệ thống gamification gồm XP, level, streak, daily missions, leaderboard, bạn bè và lịch sử học tập; bảo đảm tính nhất quán dữ liệu bằng Firestore Transaction.
- Phát triển trang quản trị nội dung, công cụ import CSV và ngân hàng 800 câu hỏi; phát hành sản phẩm dưới dạng PWA trên Firebase Hosting.

**Live:** [english-party.web.app](https://english-party.web.app)

### English

**EnglishParty - CEFR A1-C2 Learning Platform & AI Speaking Partner**  
*Full-stack Developer | React, TypeScript, Firebase, Gemini AI, Tailwind CSS*

- Built and deployed a responsive CEFR-aligned English learning platform covering grammar, reading, listening, vocabulary, and AI-powered speaking practice.
- Integrated Google Gemini AI for interactive speaking practice across 26 real-world scenarios, delivering low-latency dialogue responses (< 1.2s), smart pause detection, and CEFR-aligned evaluations.
- Developed two-way voice conversation workflows combining speech recognition for voice input, natural text-to-speech audio playback (male/female options), and client-side audio caching for seamless user experience.
- Developed an adaptive practice engine prioritizing due, weak, new, and missed items using learner progress metrics and answer confidence.
- Implemented vocabulary spaced repetition with Again, Hard, Good, and Easy ratings, automatic review intervals, and mastery tracking.
- Delivered full gamification features (XP, levels, streaks, daily missions, real-time leaderboards, friends, study history) secured via Firestore Transactions.
- Created content-management and CSV-import tools, shipped an 800-question practice bank, and deployed the application as a Firebase-hosted PWA.

**Live:** [english-party.web.app](https://english-party.web.app)

## 4. Phiên bản siêu ngắn cho CV một trang

> **EnglishParty | React, TypeScript, Firebase, Gemini AI** - Built and deployed a gamified CEFR A1-C2 English learning PWA featuring adaptive quizzes, vocabulary spaced repetition, real-time AI speaking practice (Gemini AI, voice recognition, TTS), anti-cheat validation, leaderboards, and an 800-question bank across five learning skills. [Live demo](https://english-party.web.app)

## 5. Bài toán và giải pháp

### Bài toán

Nhiều ứng dụng đưa câu hỏi ngẫu nhiên mà không phân biệt nội dung mới, nội dung người học còn yếu và nội dung đã đến hạn ôn. Người học có thể hoàn thành nhiều bài nhưng vẫn gặp lại từ cũ quá thường xuyên hoặc quên kiến thức sau một thời gian.

### Giải pháp

EnglishParty xây dựng một learning engine dựa trên lịch sử cá nhân:

1. Ưu tiên nội dung đến hạn và lỗi chưa được khắc phục.
2. Xen kẽ nội dung mới với nội dung đang học.
3. Chỉ đưa một lượng nhỏ nội dung đã thành thạo vào session để kiểm tra khả năng ghi nhớ.
4. Tính lịch ôn tiếp theo dựa trên kết quả và mức độ khó mà người học tự đánh giá.
5. Dùng XP, streak và missions để duy trì thói quen học hằng ngày.

## 6. Chức năng nổi bật

### Học theo CEFR A1-C2

- Tổ chức nội dung theo sáu cấp A1, A2, B1, B2, C1 và C2.
- Chia hoạt động học thành Grammar, Use of English, Reading, Listening và Vocabulary.
- Cho phép người dùng đặt cấp hiện tại và cấp mục tiêu.
- Tự chuyển đổi hồ sơ cũ sang CEFR mà không làm mất lịch sử học.

### Adaptive Practice

- Tạo hàng đợi từ nội dung due, weak, new và previously missed.
- Hạn chế lặp lại quá nhiều câu đã thành thạo.
- Hỗ trợ session 5, 10 hoặc 20 câu.
- Ghi nhận độ tự tin sau mỗi đáp án.
- Tạo mistake review deck riêng để xử lý lỗi chưa được giải quyết.
- Interleaving nhiều chủ đề để tránh học thuộc thứ tự câu.

### Vocabulary Spaced Repetition

- Flashcard theo phương pháp active recall: người học tự nhớ trước khi lật thẻ.
- Bốn mức đánh giá: Again, Hard, Good và Easy.
- Tính next review, review interval, mastery và trạng thái new/learning/review/mastered.
- Ưu tiên từ đến hạn và từ yếu; chỉ lấy một mẫu nhỏ từ cũ để kiểm tra retention.
- Hiển thị tiến độ theo chủ đề và theo cấp CEFR.

### Listening

- Hai dạng nội dung: conversations và short talks.
- Phát transcript bằng Web Speech API với nhiều tốc độ.
- Chỉ mở transcript sau khi nộp đáp án để duy trì active listening.
- Cho phép luyện lại câu sai và cập nhật mastery như quiz thông thường.

### Luyện nói tương tác với Gemini AI (Speaking Practice)

- **26 tình huống giao tiếp thực tế chuẩn CEFR (A2 - C1)**: Phân bổ khoa học theo 4 nhóm chuyên đề:
  - *Đời sống & Giao tiếp (8)*: Gọi cà phê specialty, Drive-thru đồ ăn nhanh, Đổi trả quần áo, Khám bệnh, Thuê căn hộ, Trò chuyện hàng xóm, Rủ bạn đi ăn, Tư vấn phòng gym.
  - *Công việc & Phỏng vấn (7)*: Phỏng vấn Tech, Đàm phán hợp đồng C1, Đàm phán tăng lương, Xử lý khiếu nại khách hàng VIP, Agile Daily Standup, Pitching gọi vốn startup, Xin gia hạn deadline.
  - *Du lịch & Sân bay (6)*: Check-in khách sạn, Báo mất hành lý sân bay, Hỏi đường tàu điện ngầm London, Thuê xe tự lái, Báo mất hộ chiếu tại đại sứ quán, Đặt tour lặn biển.
  - *Thảo luận & Tranh luận (5)*: Giải pháp biến đổi khí hậu, IELTS Speaking Part 3: AI & tương lai việc làm, VSTEP: Xã hội không tiền mặt, Đại học vs Kỹ năng thực tế, IELTS Speaking Part 3: Mạng xã hội & Giới trẻ.
- **AI Random Topic Generator**: Tự động sinh chủ đề và bốc thăm kịch bản nhập vai chuẩn format đề thi quốc tế (IELTS, VSTEP, TOEIC Speaking).
- **Phản xạ đối thoại thời gian thực (< 1.2s)**: Ứng dụng Gemini Flash-Lite tối ưu độ trễ, persona ấm áp, tự nhiên, luôn đồng cảm và phản hồi trước khi mở rộng câu hỏi tiếp theo.
- **Voice Activity Detection (VAD) thông minh**:
  - Chuyển đổi giọng nói người học thành văn bản theo thời gian thực (Speech Recognition).
  - Phân tích cấu trúc câu: Tự động kéo dài thời gian chờ (3.5s - 5.0s) nếu người học ngập ngừng (`uh/um`) hoặc câu kết thúc bằng liên từ/giới từ (`and`, `because`, `although`, `to`, `in`).
  - Hỗ trợ thanh đếm ngược trực quan và nút gửi ngay khi nói xong.
- **Đánh giá toàn diện 4 tiêu chí CEFR**:
  - Chấm điểm cuối buổi theo chuẩn quốc tế: Phát âm & Độ trôi chảy (Pronunciation & Fluency), Vốn từ vựng (Lexical Resource), Ngữ pháp & Độ chính xác (Grammar & Accuracy), Độ mạch lạc (Coherence).
  - Phân tích chi tiết từng lượt nói (Turn-by-turn Feedback), đưa ra gợi ý diễn đạt tự nhiên hơn (Better Alternative) kèm bản dịch nghĩa tiếng Việt.
- **Tích hợp giọng đọc AI và tối ưu âm thanh**:
  - Hỗ trợ Text-to-Speech phát âm thanh tự nhiên (tùy chọn giọng Nam/Nữ).
  - Bộ nhớ đệm âm thanh (Audio In-Memory Cache) giúp nghe lại câu nói (Replay) tức thì mà không tốn thêm request mạng.
  - Cho phép tùy chọn linh hoạt: Giọng AI chất lượng cao vs Giọng đọc có sẵn của trình duyệt (0ms).
- **Quản lý buổi học & Gamification**: Hỗ trợ 3 độ dài buổi nói (6, 10, 14 lượt), tích lũy XP, đồng bộ streak, lưu trữ lịch sử luyện nói chi tiết vào Firestore.

### Gamification và Social

- XP, level, daily streak và longest streak.
- Daily missions và phần thưởng.
- Leaderboard cập nhật từ Firestore.
- Hệ thống bạn bè, mã mời và trạng thái online.
- Lịch sử session và màn hình review kết quả (Quiz, Listening, Speaking).

### Anti-Cheat và tính điểm

- Kết hợp active time, wall-clock time và thời gian trả lời từng câu.
- Đánh giá tỷ lệ câu trả lời quá nhanh thay vì kết luận từ một câu đơn lẻ.
- Theo dõi tab switching và các khoảng không hoạt động kéo dài.
- Kiểm tra answer payload, số câu, đáp án trùng và session đã được xử lý.
- Không trao XP cho session không hợp lệ và hiển thị lý do cho người học.
- Cập nhật XP, streak, missions và daily progress bằng Firestore transaction.

### Quản trị nội dung

- Thêm, sửa, ẩn/hiện và xóa câu hỏi hoặc từ vựng.
- Gắn CEFR level, kỹ năng và chủ đề cho nội dung.
- Import dữ liệu hàng loạt bằng CSV có validation.
- Cung cấp 800 câu hỏi bundled thuộc Grammar, Use of English, Reading và Listening.

### PWA và Responsive UI

- Có thể cài đặt dưới dạng Progressive Web App.
- Service worker và offline caching bằng Workbox.
- Tích hợp Firebase Cloud Messaging cho push notification.
- Lazy loading các trang chính bằng React Router.
- Giao diện đã được kiểm tra trên desktop và mobile, không bị tràn ngang.

## 7. Công nghệ sử dụng

### Frontend

- **React 19:** Component và luồng tương tác.
- **TypeScript 6:** Kiểm soát kiểu dữ liệu cho user, question, progress, session và speaking turns.
- **React Router 7:** Routing và lazy loading.
- **Zustand:** Authentication state và UI state.
- **Tailwind CSS 4:** Design system và responsive layout.
- **Framer Motion:** Animation cho quiz, flashcard, audio visualizer và kết quả.
- **Lucide React:** Hệ thống icon.
- **Recharts:** Biểu đồ trong admin dashboard.

### AI & Audio Processing

- **Google Gemini AI API:**
  - `gemini-flash-lite-latest`: Xử lý phản hồi đối thoại nhập vai siêu tốc (< 1.2s).
  - Gemini TTS: Tổng hợp giọng nói tự nhiên (tùy chọn Nam/Nữ).
- **Web Speech API:** Speech Recognition nhận diện giọng nói người học, SpeechSynthesis phát âm thanh trình duyệt.
- **Web Audio API:** Quản lý và phát âm thanh mượt mà trực tiếp trên client.

### Backend và Infrastructure

- **Firebase Authentication:** Google và Email/Password.
- **Cloud Firestore:** Hồ sơ, câu hỏi, từ vựng, progress, session, speaking history và leaderboard.
- **Firestore Transaction:** Cập nhật XP, streak và missions nhất quán.
- **Firebase Storage:** Quản lý tài nguyên nội dung.
- **Firebase Messaging:** Push notification.
- **Firebase Hosting:** Production deployment.

### Tooling

- **Vite 8:** Development server và production build.
- **vite-plugin-pwa / Workbox:** PWA manifest và service worker.
- **PapaParse:** Đọc và kiểm tra CSV.
- **Custom validation scripts:** Kiểm tra ngân hàng câu hỏi, scheduler, due date, confidence và interleaving.

## 8. Kiến trúc dữ liệu

### UserProfile

Lưu tài khoản, XP, level, streak, tổng câu đã làm, độ chính xác, thời gian học, CEFR hiện tại, CEFR mục tiêu, daily goal và friend IDs.

### Question

Lưu CEFR level, kỹ năng, topic, difficulty rank, lựa chọn, đáp án, giải thích, context hoặc transcript và thống kê trả lời.

### QuestionProgress

Lưu correct/wrong count, mastery, last reviewed, next review, review interval, difficulty factor và confidence gần nhất.

### VocabProgress

Lưu trạng thái new/learning/review/mastered, mastery level, lịch sử ôn và lịch ôn tiếp theo.

### StudySession

Lưu loại session (quiz, listening, speaking), số câu/lượt, độ chính xác/điểm CEFR, active time, XP, streak bonus và kết quả validation.

### SpeakingScenario & SpeakingHistoryItem

Lưu kịch bản đàm thoại (title, level, category, persona, starter prompt, suggested phrases), lịch sử từng lượt thoại (turn-by-turn text & role), báo cáo phân tích 4 tiêu chí CEFR và phản hồi chi tiết.

## 9. Quyết định kỹ thuật đáng trình bày

### Tách luồng đối thoại AI (< 1.2s) và chấm điểm tổng kết

Trong lúc luyện nói, tốc độ là yếu tố sống còn để người học không bị cụt hứng. Hệ thống chỉ yêu cầu Gemini Flash-Lite sinh câu thoại ngắn (1-3 câu) với `maxOutputTokens: 80`, giúp phản hồi xuất hiện sau ~0.8s - 1.2s. Toàn bộ quá trình phân tích ngữ pháp, từ vựng, phát âm và tổng hợp điểm CEFR được hoãn lại đến cuối buổi khi người dùng bấm hoàn thành.

### Tối ưu hóa phát âm thanh AI trên trình duyệt

Thay vì phải duy trì thêm một server backend Node.js/Python trung gian (dễ bị cold-start 30-50s trên hosting miễn phí), ứng dụng kết nối trực tiếp API của Gemini và phát âm thanh ngay tại trình duyệt client. Hệ thống kết hợp lưu tạm vào bộ nhớ đệm (in-memory cache) để khi người học bấm nghe lại câu nói thì phát được ngay lập tức mà không cần gọi lại mạng.

### VAD (Voice Activity Detection) phân tích ngữ nghĩa

Hệ thống không ngắt lời đơn thuần dựa trên khoảng lặng tĩnh. Thuật toán kiểm tra câu nói hiện tại: nếu kết thúc bằng liên từ phụ thuộc (`because`, `although`, `and`, `or`), giới từ (`to`, `in`, `at`) hoặc thán từ do dự (`uh`, `um`), bộ đếm thời gian chờ sẽ tự động cộng thêm 1.5s - 2.0s để người học thoải mái suy nghĩ và diễn đạt trọn vẹn ý tứ.

### Firestore transaction

Một kết quả học tác động đồng thời đến XP, level, streak, daily progress và missions. Transaction giúp tránh trạng thái cập nhật dở dang khi mạng lỗi hoặc request bị gửi lại.

### Scheduler thay cho random

Hàng đợi học được tạo theo mức ưu tiên due → weak/mistake → new → mastered sample. Cách này vừa xử lý kiến thức yếu, vừa duy trì việc học nội dung mới.

### Anti-cheat dựa trên nhiều tín hiệu

Hệ thống không kết luận gian lận từ một tín hiệu đơn lẻ. Một session chỉ bị đánh dấu quá nhanh khi tổng thời gian, thời gian trung bình và tỷ lệ đáp án bất thường cùng vượt ngưỡng.

### Migration không mất tiến độ

Khi chuyển sản phẩm sang CEFR, ID câu hỏi cũ được giữ nguyên. Nội dung chưa có `cefrLevel` được normalize khi đọc để progress hiện tại vẫn tham chiếu đúng câu hỏi.

## 10. Số liệu có thể đưa vào CV

Đây là các số liệu có thể kiểm chứng từ source code:

- 6 cấp độ CEFR từ A1 đến C2.
- 5 kỹ năng học tập: Grammar, Reading, Listening, Vocabulary và Speaking.
- 4 ngân hàng nội dung, mỗi ngân hàng 200 câu (tổng 800 câu hỏi bundled).
- 26 kịch bản Speaking có sẵn thuộc 4 chuyên đề thực tế + AI Random Topic Generator.
- 4 tiêu chí chuẩn CEFR đánh giá bài nói (Pronunciation, Vocabulary, Grammar, Coherence).
- 2 bộ engine giọng nói: Giọng AI (Google Gemini) và Giọng đọc trình duyệt (Web Speech).
- 3 kích thước session quiz (5, 10, 20 câu) và 3 độ dài buổi nói (6, 10, 14 lượt).
- 4 mức đánh giá vocabulary recall.
- Production deployment trên Firebase Hosting.
- Hỗ trợ responsive và PWA.

## 11. Elevator pitch khi phỏng vấn

### Phiên bản 30 giây

> EnglishParty là dự án full-stack mình xây dựng bằng React, TypeScript, Firebase và Google Gemini AI. Sản phẩm chuẩn hóa theo khung CEFR A1-C2, kết hợp học thích ứng, spaced repetition và tính năng luyện nói tương tác với độ trễ phản hồi dưới 1.2s. Mình tập trung vào trải nghiệm hội thoại mượt mà với Voice Activity Detection nhận diện ngắt câu thông minh và cơ chế phát âm thanh hai chiều (Speech Recognition & TTS). Dự án đã được triển khai production dưới dạng PWA.

### Phiên bản 90 giây

> Mục tiêu của EnglishParty là tạo ra một nền tảng học tiếng Anh toàn diện, giải quyết cả bài toán ghi nhớ kiến thức lẫn phản xạ giao tiếp. Về phần học quiz và từ vựng, mình xây dựng learning engine thích ứng theo spaced repetition, bảo đảm tính nhất quán dữ liệu bằng Firestore transaction và logic anti-cheat đa tín hiệu. Về phần Speaking, mình tích hợp Gemini AI cho 26 kịch bản thực tế với độ trễ phản hồi dưới 1.2s, kết hợp Voice Activity Detection phân tích ngữ pháp để tránh cướp lời người học. Về mặt âm thanh, hệ thống hỗ trợ nhận diện giọng nói và phát âm thanh tự nhiên có cache trên trình duyệt mà không cần duy trì thêm server backend phức tạp. Hệ thống có PWA, leaderboard, quản trị CSV và đã chạy production ổn định.

## 12. Câu hỏi phỏng vấn cần chuẩn bị

1. Vì sao chọn giải pháp phát âm thanh trực tiếp từ client thay vì dựng backend Node.js trung gian?
2. Thuật toán Voice Activity Detection (VAD) phân biệt câu nói hoàn chỉnh và ngập ngừng ra sao?
3. Làm thế nào để tối ưu độ trễ đối thoại AI xuống dưới 1.2 giây trong khi vẫn giữ được persona tự nhiên?
4. Firestore transaction đang bảo vệ những cập nhật nào và xử lý concurrency ra sao?
5. Scheduler quyết định câu nào xuất hiện trong adaptive session như thế nào?
6. Sự khác nhau giữa mastery, state và next review trong spaced repetition là gì?
7. Làm sao tránh một từ cũ xuất hiện quá nhiều lần?
8. Anti-cheat có thể false positive trong trường hợp nào và cách khắc phục?
9. Nếu có 100.000 người dùng, kiến trúc Firestore và Gemini API cần mở rộng thế nào?
10. Làm sao kiểm thử tự động (E2E) luồng Speech Recognition và Audio Playback trên CI/CD?

## 13. Hạn chế hiện tại

- Nội dung đang **CEFR-aligned**, chưa được chuyên gia độc lập chứng nhận.
- Cần bổ sung unit test và E2E test rộng hơn (đặc biệt cho audio pipeline).
- Production bundle còn một số chunk lớn cần tiếp tục code splitting.
- Kỹ năng Writing đang trong lộ trình phát triển tiếp theo (hiện đã hoàn thiện toàn diện Reading, Listening và Speaking).
- Chưa có analytics funnel để đo completion rate và retention chi tiết.

## 14. Từ khóa ATS

`React`, `TypeScript`, `JavaScript`, `Google Gemini AI`, `Generative AI`, `LLM Integration`, `Voice Activity Detection (VAD)`, `Speech Recognition`, `Text-to-Speech (TTS)`, `Web Audio API`, `Audio Signal Processing (PCM/WAV)`, `Firebase`, `Firestore`, `Firebase Authentication`, `Firebase Hosting`, `PWA`, `Service Worker`, `Responsive Design`, `Tailwind CSS`, `State Management`, `Zustand`, `React Router`, `Spaced Repetition`, `Adaptive Learning`, `Gamification`, `Data Validation`, `CSV Import`, `Transaction`, `Real-time Data`, `Git`.

## 15. Điều chỉnh theo vị trí

### AI / Frontend Engineer
Nhấn mạnh tích hợp Gemini LLM/TTS, Web Speech API, Web Audio API (PCM to WAV), Voice Activity Detection, tối ưu độ trễ đối thoại và responsive UI.

### Full-stack Developer
Nhấn mạnh kiến trúc dữ liệu Firestore, transaction, authentication, security rules, data migration, serverless audio streaming và production deployment.

### Software Engineer Intern / Junior
Nhấn mạnh khả năng xây dựng sản phẩm end-to-end từ ý tưởng đến production, giải quyết bài toán kỹ thuật phức tạp (VAD, audio decoding) và cải tiến UX liên tục.

### EdTech Product Engineer
Nhấn mạnh khung CEFR, adaptive queue, spaced repetition, 4 tiêu chí đánh giá speaking và cách tạo động lực bằng gamification.

## 16. Checklist trước khi gửi CV

- [ ] Thêm link GitHub public và kiểm tra repository không chứa secret.
- [ ] Thêm 3-5 screenshot rõ ràng vào README (bao gồm màn hình AI Speaking Studio).
- [ ] Kiểm tra live demo bằng cửa sổ ẩn danh trên cả máy tính và điện thoại.
- [ ] Chuẩn bị tài khoản demo nếu nhà tuyển dụng cần đăng nhập.
- [ ] Rút gọn còn tối đa 4-5 bullet trong CV chính.
- [ ] Điều chỉnh từ khóa theo job description.
- [ ] Chuẩn bị demo luồng học adaptive, vocabulary recall và AI Speaking Voice roleplay.
- [ ] Chuẩn bị giải thích kiến trúc giải mã PCM sang WAV và cách xử lý ngắt câu VAD.
