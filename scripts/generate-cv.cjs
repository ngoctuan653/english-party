const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chu Tuan Ngoc - CV Talent Android Developer (Monochrome)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background-color: #ffffff;
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      overflow: hidden;
      margin: 0 auto;
      padding: 18mm 20mm 14mm 20mm;
      font-size: 8.85px;
      line-height: 1.38;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* HEADER */
    .header {
      text-align: center;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #111827;
      margin-bottom: 8px;
    }

    .header-name {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 1.2px;
      color: #000000;
      text-transform: uppercase;
      line-height: 1.1;
      margin-bottom: 3px;
    }

    .header-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #1f2937;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .header-links {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      font-size: 8.8px;
      color: #374151;
    }

    .header-links a {
      color: #111827;
      text-decoration: none;
      font-weight: 500;
    }

    .header-links a:hover {
      text-decoration: underline;
    }

    .dot {
      color: #6b7280;
      font-size: 8px;
    }

    /* MAIN CONTENT */
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    /* SECTIONS */
    .section {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .section-title {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #000000;
      border-bottom: 1px solid #111827;
      padding-bottom: 1.5px;
      margin-bottom: 3px;
    }

    .summary-text {
      color: #1f2937;
      font-size: 8.85px;
      line-height: 1.42;
      text-align: justify;
    }

    /* SKILLS */
    .skills-grid {
      display: grid;
      grid-template-columns: 110px 1fr;
      row-gap: 2px;
      font-size: 8.75px;
      line-height: 1.34;
    }

    .skill-cat {
      font-weight: 700;
      color: #000000;
    }

    .skill-items {
      color: #1f2937;
    }

    /* EXPERIENCE & PROJECTS */
    .item-block {
      display: flex;
      flex-direction: column;
      gap: 1px;
      margin-bottom: 2px;
    }

    .item-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .item-title {
      font-size: 9.8px;
      font-weight: 800;
      color: #000000;
    }

    .item-role {
      font-weight: 700;
      color: #1f2937;
    }

    .item-date {
      font-size: 8.5px;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }

    .item-desc {
      font-size: 8.35px;
      font-style: italic;
      color: #4b5563;
    }

    .item-stack {
      font-size: 8.35px;
      color: #1f2937;
    }

    .item-stack strong {
      color: #000000;
      font-weight: 700;
    }

    .bullets {
      list-style-type: none;
      padding-left: 0;
      margin-top: 1px;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .bullets li {
      position: relative;
      padding-left: 9px;
      font-size: 8.65px;
      line-height: 1.34;
      color: #1f2937;
    }

    .bullets li::before {
      content: '•';
      position: absolute;
      left: 0;
      top: -0.5px;
      color: #000000;
      font-weight: bold;
      font-size: 9px;
    }

    .item-links {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 8.2px;
      font-weight: 600;
      color: #374151;
      margin-top: 1px;
    }

    .item-links a {
      color: #000000;
      text-decoration: underline;
      text-underline-offset: 1.5px;
    }

    /* EDUCATION */
    .edu-block {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 8.9px;
    }

    .edu-school {
      font-weight: 800;
      color: #000000;
    }

    .edu-degree {
      color: #374151;
      font-style: italic;
    }

    .edu-date {
      font-size: 8.5px;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
    }

    /* LANGUAGES */
    .languages-row {
      display: flex;
      gap: 36px;
      font-size: 8.85px;
      align-items: center;
    }

    .lang-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .lang-label {
      font-weight: 800;
      color: #000000;
    }

    .lang-level {
      color: #374151;
      font-weight: 500;
    }

    /* FOOTER */
    .footer {
      border-top: 1px solid #111827;
      padding-top: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8px;
      color: #4b5563;
      font-weight: 600;
    }

    .footer-target {
      color: #000000;
      font-weight: 700;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <h1 class="header-name">CHU TUAN NGOC</h1>
    <div class="header-title">TALENT ANDROID DEVELOPER &bull; JAVA OOP &bull; FLUTTER & DART MOBILE</div>
    <div class="header-links">
      <span><a href="tel:0369413682">0369 413 682</a></span>
      <span class="dot">&bull;</span>
      <span><a href="mailto:tuanngoc653@gmail.com">tuanngoc653@gmail.com</a></span>
      <span class="dot">&bull;</span>
      <span>Hanoi, Vietnam</span>
      <span class="dot">&bull;</span>
      <span><a href="https://github.com/ngoctuan653" target="_blank">github.com/ngoctuan653</a></span>
      <span class="dot">&bull;</span>
      <span><a href="https://ngoctuan653.github.io/portfolio" target="_blank">ngoctuan653.github.io/portfolio</a></span>
    </div>
  </header>

  <!-- CONTENT -->
  <main class="content">

    <!-- PROFESSIONAL SUMMARY -->
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary-text">
        FPT University Software Engineering graduate with prior <strong>On-The-Job Training (OJT) internship experience at FPT Software (May 2025 – August 2025)</strong>, applying for the <strong>Talent Android Developer</strong> role. Solid foundation in <strong>Java Core, OOP principles, and hands-on cross-platform mobile development with Flutter &amp; Dart</strong> across deployed products (<strong>UniEvents</strong>, <strong>ComiVerse</strong>). Practical experience with mobile UI architecture, state management, RESTful API consumption, local caching, and Firebase Cloud Messaging push notifications. Leveraging strong Java proficiency, familiarity with FPT Software workflows, and a mobile mindset, enthusiastically committed to transitioning into native Android engineering and delivering high-impact features under mentor guidance.
      </p>
    </section>

    <!-- WORK EXPERIENCE -->
    <section class="section">
      <h2 class="section-title">Work Experience</h2>
      <div class="item-block">
        <div class="item-top">
          <div>
            <span class="item-title">FPT SOFTWARE</span>
            <span class="item-role"> — Software Engineer Intern (OJT)</span>
          </div>
          <span class="item-date">05/2025 – 08/2025</span>
        </div>
        <div class="item-desc">Enterprise software engineering internship &amp; On-The-Job Training program</div>
        <ul class="bullets">
          <li>Completed 3-month intensive On-The-Job Training (OJT) internship at FPT Software, strictly adhering to enterprise development and clean code standards.</li>
          <li>Participated in Agile/Scrum sprints, daily standups, task estimations, Git workflows (branching, PRs, peer code reviews), and CI/CD pipelines.</li>
          <li>Collaborated with senior software engineers on software modules, RESTful API integrations, debugging, and unit testing following industry best practices.</li>
        </ul>
      </div>
    </section>

    <!-- TECHNICAL SKILLS -->
    <section class="section">
      <h2 class="section-title">Technical Skills</h2>
      <div class="skills-grid">
        <div class="skill-cat">Languages</div>
        <div class="skill-items"><strong>Java (Java Core, OOP, Java 21)</strong>, <strong>Dart</strong>, TypeScript, JavaScript, SQL</div>

        <div class="skill-cat">Mobile &amp; Flutter</div>
        <div class="skill-items">Flutter, Dart, Mobile UI Architecture, Material Design, State Management, FCM Push Notifications, Responsive Layouts, Local Caching</div>

        <div class="skill-cat">Android &amp; Transition</div>
        <div class="skill-items">Java for Android, Android SDK Architecture Concepts, Activity Lifecycle Awareness, Gradle build system, Android Studio, Eager to master Kotlin &amp; Jetpack</div>

        <div class="skill-cat">Architecture &amp; Design</div>
        <div class="skill-items">OOP, SOLID Principles, Clean Architecture, MVC / MVVM Concepts, Repository Pattern, Design Patterns</div>

        <div class="skill-cat">APIs &amp; Storage</div>
        <div class="skill-items">RESTful APIs, JSON parsing, HTTP Clients (Dio, Axios), SQLite / Room concepts, SharedPreferences, Firebase (Auth, Firestore, FCM, Cloud Functions)</div>

        <div class="skill-cat">Tools &amp; Methodologies</div>
        <div class="skill-items">Android Studio, VS Code, Git/GitHub, Gradle, Maven, Postman, Docker, CI/CD, Agile/Scrum, Problem Solving, Clean Code</div>
      </div>
    </section>

    <!-- EDUCATION -->
    <section class="section">
      <h2 class="section-title">Education</h2>
      <div class="edu-block">
        <div>
          <span class="edu-school">FPT UNIVERSITY</span>
          <span class="edu-degree"> — Bachelor of Software Engineering</span>
        </div>
        <span class="edu-date">2022 – 2026 | Graduated</span>
      </div>
    </section>

    <!-- PROJECT EXPERIENCE -->
    <section class="section">
      <h2 class="section-title">Project Experience</h2>

      <!-- Project 1: UniEvents -->
      <div class="item-block">
        <div class="item-top">
          <div>
            <span class="item-title">UniEvents</span>
            <span class="item-role"> — Mobile Developer | Personal Project</span>
          </div>
          <span class="item-date">03/2026 – 05/2026</span>
        </div>
        <div class="item-desc">Cross-platform mobile app helping students track, register for school club events, and receive push notifications</div>
        <div class="item-stack"><strong>Stack:</strong> Flutter, Dart, Firebase Auth, Cloud Firestore, Firebase Cloud Messaging (FCM), Cloud Functions</div>
        <ul class="bullets">
          <li>Architected and developed a mobile app enabling university students to discover upcoming campus events, register with 1 click, and track schedules.</li>
          <li>Implemented role-based user management (Students vs. Club Organizers) with Firebase Authentication and structured Firestore real-time collections.</li>
          <li>Engineered automated push notification pipeline using Firebase Cloud Messaging (FCM) and Cloud Functions to deliver instant event reminders before start time.</li>
          <li>Designed responsive Material UI with modular widgets, dynamic search/tag filtering, and offline-resilient local cache handling.</li>
        </ul>
        <div class="item-links">
          <span>Source code: <a href="https://github.com/ngoctuan653/uni_events" target="_blank">github.com/ngoctuan653/uni_events</a></span>
        </div>
      </div>

      <!-- Project 2: ComiVerse -->
      <div class="item-block">
        <div class="item-top">
          <div>
            <span class="item-title">ComiVerse</span>
            <span class="item-role"> — Fullstack &amp; Mobile Contributor | 5-Member Capstone Team</span>
          </div>
          <span class="item-date">05/2026 – 08/2026</span>
        </div>
        <div class="item-desc">Deployed cross-platform product with role-based workflows, payments, and real-time features</div>
        <div class="item-stack"><strong>Stack:</strong> Flutter (Mobile), Java 21, Spring Boot 3.5, ReactJS 19, Axios, PostgreSQL, Redis, Maven, Git</div>
        <ul class="bullets">
          <li>Contributed cross-platform features across Flutter mobile and Java/Spring Boot codebases in a 5-member capstone team.</li>
          <li>Implemented RESTful authentication and account workflows: email OTP, password recovery, Google Sign-In, JWT tokens, and device tracking.</li>
          <li>Built Controller-Service-Repository architecture, integrated Spring Security, JPA/Hibernate, PostgreSQL, Redis cache, and automated tests.</li>
        </ul>
        <div class="item-links">
          <span>Live product: <a href="https://comi-verse.vercel.app" target="_blank">comi-verse.vercel.app</a></span>
          <span class="dot">&bull;</span>
          <span>Mobile repo (Flutter): <a href="https://github.com/DangNgocThanhk18/SEP490_G37_SUM26_MOBILE_FLUTTER" target="_blank">github.com/DangNgocThanhk18/SEP490_G37_SUM26_MOBILE_FLUTTER</a></span>
        </div>
      </div>

      <!-- Project 3: EnglishParty -->
      <div class="item-block">
        <div class="item-top">
          <div>
            <span class="item-title">EnglishParty</span>
            <span class="item-role"> — Lead Developer | Personal Project</span>
          </div>
          <span class="item-date">05/2026 – Present</span>
        </div>
        <div class="item-desc">Production gamified CEFR English learning Progressive Web App with spaced repetition and real-time stats</div>
        <div class="item-stack"><strong>Stack:</strong> ReactJS 19, TypeScript, Vite, Tailwind CSS, Firebase Auth, Firestore, Firebase Hosting, PWA</div>
        <ul class="bullets">
          <li>Designed and launched a full-scale learning platform serving 4,300+ CEFR B2 vocabulary terms with collocations and 800+ skill-targeted exercises.</li>
          <li>Engineered spaced repetition recall system (SM-2 scheduling) with transactional progress updates and multi-signal session validation.</li>
          <li>Deployed to Firebase Hosting with custom Service Worker caching, 0ms in-memory vocabulary indexing, and high-fidelity text-to-speech audio.</li>
        </ul>
        <div class="item-links">
          <span>Live app: <a href="https://english-party.web.app" target="_blank">english-party.web.app</a></span>
          <span class="dot">&bull;</span>
          <span>Source code: <a href="https://github.com/ngoctuan653/english-party" target="_blank">github.com/ngoctuan653/english-party</a></span>
        </div>
      </div>

    </section>

    <!-- LANGUAGES -->
    <section class="section">
      <h2 class="section-title">Languages</h2>
      <div class="languages-row">
        <div class="lang-item">
          <span class="lang-label">Vietnamese:</span>
          <span class="lang-level">Native</span>
        </div>
        <div class="lang-item">
          <span class="lang-label">English:</span>
          <span class="lang-level">B1 - Intermediate</span>
        </div>
      </div>
    </section>

  </main>

  <!-- FOOTER -->
  <footer class="footer">
    <span class="footer-target">Target: Talent Android Developer | FPT Software</span>
    <span>Chu Tuan Ngoc</span>
  </footer>

</body>
</html>`;

const tempHtml = path.resolve('C:/Users/aduha/AppData/Local/Temp/cv_android.html');
fs.writeFileSync(tempHtml, htmlContent, 'utf-8');

const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
const targetPdf1 = 'C:/Users/aduha/OneDrive/Desktop/Chu_Tuan_Ngoc_CV_FPT_Software_Talent_Android.pdf';
const targetPdf2 = 'C:/Users/aduha/OneDrive/Desktop/Chu_Tuan_Ngoc_CV_FPT_IS_Fullstack_Intern.pdf';

execFileSync(chromePath, [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--print-to-pdf=' + targetPdf1,
  tempHtml
]);
console.log('Generated Monochrome PDF 1:', targetPdf1, 'Size:', fs.statSync(targetPdf1).size);

fs.copyFileSync(targetPdf1, targetPdf2);
console.log('Updated Monochrome PDF 2 (original name):', targetPdf2);
