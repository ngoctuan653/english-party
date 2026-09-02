# EnglishParty - Hồ sơ dự án cho CV

Tài liệu này cung cấp nhiều phiên bản mô tả để sử dụng trong CV, portfolio, LinkedIn và phỏng vấn. Chỉ chọn những phần phù hợp, không đưa toàn bộ nội dung vào CV một trang.

## 1. Thông tin dự án

- **Tên dự án:** EnglishParty
- **Sản phẩm:** Nền tảng học tiếng Anh có gamification theo khung CEFR A1-C2
- **Vai trò:** Full-stack Developer / Frontend Developer
- **Live demo:** [https://english-party.web.app](https://english-party.web.app)
- **Repository:** Bổ sung đường dẫn GitHub công khai tại đây
- **Trạng thái:** Đã triển khai production trên Firebase Hosting
- **Đối tượng:** Người học tiếng Anh muốn luyện tập hằng ngày cùng bạn bè

> Khi trình bày, nên dùng cụm từ **CEFR-aligned**. Không gọi sản phẩm là “CEFR-certified” khi nội dung chưa được một tổ chức chuyên môn độc lập thẩm định.

## 2. Mô tả một câu

### Tiếng Việt

EnglishParty là nền tảng học tiếng Anh CEFR A1-C2 kết hợp luyện tập thích ứng, spaced repetition và gamification cho Grammar, Use of English, Reading, Listening và Vocabulary.

### English

EnglishParty is a gamified CEFR A1-C2 English learning platform that combines adaptive practice and spaced repetition across grammar, reading, listening, and vocabulary.

## 3. Phiên bản dùng trực tiếp trong CV

### Tiếng Việt

**EnglishParty - Nền tảng học tiếng Anh CEFR A1-C2**  
*Full-stack Developer | React, TypeScript, Firebase, Tailwind CSS*

- Xây dựng và triển khai nền tảng học tiếng Anh responsive theo khung CEFR A1-C2, bao gồm Grammar, Use of English, Reading, Listening và Vocabulary.
- Phát triển hệ thống luyện tập thích ứng, ưu tiên câu đến hạn ôn, câu có mastery thấp, câu từng trả lời sai và nội dung mới.
- Triển khai spaced repetition cho từ vựng với bốn mức Again, Hard, Good và Easy; tự động tính lịch ôn tiếp theo và theo dõi mức độ thành thạo.
- Xây dựng hệ thống gamification gồm XP, level, streak, daily missions, leaderboard, bạn bè và lịch sử học tập.
- Phát triển trang quản trị nội dung, công cụ import CSV và ngân hàng 800 câu hỏi; phát hành sản phẩm dưới dạng PWA trên Firebase Hosting.

**Live:** [english-party.web.app](https://english-party.web.app)

### English

**EnglishParty - CEFR A1-C2 Learning Platform**  
*Full-stack Developer | React, TypeScript, Firebase, Tailwind CSS*

- Built and deployed a responsive CEFR-aligned English learning platform covering grammar, use of English, reading, listening, and vocabulary.
- Developed an adaptive practice engine that prioritizes due, weak, new, and previously missed items using learner progress and answer confidence.
- Implemented vocabulary spaced repetition with Again, Hard, Good, and Easy ratings, automatic review scheduling, and mastery tracking.
- Delivered gamification features including XP, levels, streaks, daily missions, leaderboards, friends, and study history.
- Created content-management and CSV-import tools, shipped an 800-question practice bank, and deployed the application as a Firebase-hosted PWA.

**Live:** [english-party.web.app](https://english-party.web.app)

## 4. Phiên bản siêu ngắn cho CV một trang

> **EnglishParty | React, TypeScript, Firebase** - Built and deployed a gamified CEFR A1-C2 English learning PWA with adaptive quizzes, spaced repetition, progress tracking, anti-cheat validation, leaderboards, and an admin content-management system. Includes an 800-question practice bank across four learning skills. [Live demo](https://english-party.web.app)

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

### Gamification và Social

- XP, level, daily streak và longest streak.
- Daily missions và phần thưởng.
- Leaderboard cập nhật từ Firestore.
- Hệ thống bạn bè, mã mời và trạng thái online.
- Lịch sử session và màn hình review kết quả.

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
- **TypeScript 6:** Kiểm soát kiểu dữ liệu cho user, question, progress và session.
- **React Router 7:** Routing và lazy loading.
- **Zustand:** Authentication state và UI state.
- **Tailwind CSS 4:** Design system và responsive layout.
- **Framer Motion:** Animation cho quiz, flashcard và kết quả.
- **Lucide React:** Hệ thống icon.
- **Recharts:** Biểu đồ trong admin dashboard.

### Backend và Infrastructure

- **Firebase Authentication:** Google và Email/Password.
- **Cloud Firestore:** Hồ sơ, câu hỏi, từ vựng, progress, session và leaderboard.
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

Lưu loại session, số câu, độ chính xác, active time, XP, streak bonus và kết quả validation.

## 9. Quyết định kỹ thuật đáng trình bày

### Firestore transaction

Một kết quả học tác động đồng thời đến XP, level, streak, daily progress và missions. Transaction giúp tránh trạng thái cập nhật dở dang khi mạng lỗi hoặc request bị gửi lại.

### Scheduler thay cho random

Hàng đợi học được tạo theo mức ưu tiên due → weak/mistake → new → mastered sample. Cách này vừa xử lý kiến thức yếu, vừa duy trì việc học nội dung mới.

### Anti-cheat dựa trên nhiều tín hiệu

Hệ thống không kết luận gian lận từ một tín hiệu đơn lẻ. Một session chỉ bị đánh dấu quá nhanh khi tổng thời gian, thời gian trung bình và tỷ lệ đáp án bất thường cùng vượt ngưỡng.

### Migration không mất tiến độ

Khi chuyển sản phẩm sang CEFR, ID câu hỏi cũ được giữ nguyên. Nội dung chưa có `cefrLevel` được normalize khi đọc để progress hiện tại vẫn tham chiếu đúng câu hỏi.

### Progressive enhancement cho audio

Listening dùng Web Speech API khi thiết bị hỗ trợ. Transcript và feedback vẫn hoạt động nếu voice playback không khả dụng.

## 10. Số liệu có thể đưa vào CV

Đây là các số liệu có thể kiểm chứng từ source code:

- 6 cấp độ CEFR từ A1 đến C2.
- 4 ngân hàng nội dung, mỗi ngân hàng 200 câu.
- Tổng cộng 800 câu hỏi bundled.
- 3 kích thước session: 5, 10 và 20 câu.
- 4 mức đánh giá vocabulary recall.
- 3 nhóm câu hỏi chính và 2 chế độ Listening.
- Production deployment trên Firebase Hosting.
- Hỗ trợ responsive và PWA.

Không tự thêm các số liệu như “1.000 người dùng”, “tăng 40% retention” hoặc “99,9% uptime” nếu chưa có analytics để chứng minh.

## 11. Elevator pitch khi phỏng vấn

### Phiên bản 30 giây

> EnglishParty là dự án full-stack mình xây dựng bằng React, TypeScript và Firebase. Sản phẩm tổ chức nội dung theo CEFR A1-C2 và cá nhân hóa hàng đợi học dựa trên mastery, lịch ôn, câu sai và độ tự tin. Phần mình tập trung nhiều nhất là spaced repetition, tính nhất quán khi cập nhật progress bằng Firestore transaction và logic anti-cheat dựa trên nhiều tín hiệu. Dự án đã được triển khai production dưới dạng PWA.

### Phiên bản 90 giây

> Mục tiêu của EnglishParty là giải quyết việc học ngẫu nhiên và lặp lại không hợp lý. Mình xây dựng một learning engine ưu tiên câu đến hạn, câu yếu và câu từng sai, sau đó xen kẽ nội dung mới theo session 5, 10 hoặc 20 câu. Với vocabulary, người học đánh giá Again, Hard, Good hoặc Easy để scheduler tính lần ôn tiếp theo. Kết quả session được validation rồi cập nhật XP, streak, missions và progress trong Firestore transaction. Hệ thống còn có leaderboard, bạn bè, admin import CSV, PWA và giao diện responsive. Khi chuyển từ cấu trúc đề thi sang CEFR, mình giữ nguyên content ID và thêm lớp normalization để không làm mất progress của người dùng cũ.

## 12. Câu hỏi phỏng vấn cần chuẩn bị

1. Vì sao chọn Firebase thay vì REST API và SQL?
2. Firestore transaction đang bảo vệ những cập nhật nào?
3. Scheduler quyết định câu nào xuất hiện trong session như thế nào?
4. Sự khác nhau giữa mastery, state và next review là gì?
5. Làm sao tránh một từ cũ xuất hiện quá nhiều lần?
6. Anti-cheat có thể false positive trong trường hợp nào?
7. Vì sao giữ nguyên question ID khi migration sang CEFR?
8. Nếu có 100.000 người dùng, leaderboard và progress query cần thay đổi ra sao?
9. Làm sao đo retention và chứng minh adaptive learning hiệu quả?
10. Nếu phát triển tiếp, sẽ bổ sung test và observability như thế nào?

## 13. Hạn chế hiện tại

- Nội dung đang **CEFR-aligned**, chưa được chuyên gia độc lập chứng nhận.
- Cần bổ sung unit test và E2E test rộng hơn.
- Production bundle còn một số chunk lớn cần tiếp tục code splitting.
- Listening đang phụ thuộc vào giọng đọc của thiết bị; audio thu âm thật sẽ tự nhiên hơn.
- Chưa có analytics funnel để đo completion rate và retention.
- Chưa có đánh giá Writing và Speaking.

## 14. Từ khóa ATS

`React`, `TypeScript`, `JavaScript`, `Firebase`, `Firestore`, `Firebase Authentication`, `Firebase Hosting`, `PWA`, `Service Worker`, `Responsive Design`, `Tailwind CSS`, `State Management`, `Zustand`, `React Router`, `Spaced Repetition`, `Adaptive Learning`, `Gamification`, `Data Validation`, `CSV Import`, `Transaction`, `Real-time Data`, `Web Speech API`, `Git`.

## 15. Điều chỉnh theo vị trí

### Frontend Developer

Nhấn mạnh responsive UI, component architecture, state management, accessibility, animation, PWA và performance.

### Full-stack Developer

Nhấn mạnh Firestore schema, transaction, authentication, authorization rules, data migration, CSV import và deployment.

### Software Engineer Intern / Junior

Nhấn mạnh khả năng xây dựng sản phẩm end-to-end, xử lý business logic, debug production và cải tiến dựa trên phản hồi.

### EdTech Product Engineer

Nhấn mạnh adaptive queue, spaced repetition, mastery tracking, mistake repair và cách đo hiệu quả học tập.

## 16. Checklist trước khi gửi CV

- [ ] Thêm link GitHub public và kiểm tra repository không chứa secret.
- [ ] Thêm 3-5 screenshot rõ ràng vào README.
- [ ] Kiểm tra live demo bằng cửa sổ ẩn danh.
- [ ] Chuẩn bị tài khoản demo nếu nhà tuyển dụng cần đăng nhập.
- [ ] Rút gọn còn tối đa 4-5 bullet trong CV chính.
- [ ] Điều chỉnh từ khóa theo job description.
- [ ] Chuẩn bị demo luồng học, vocabulary recall và admin import.
- [ ] Chuẩn bị giải thích một quyết định kỹ thuật và một bug khó đã sửa.
