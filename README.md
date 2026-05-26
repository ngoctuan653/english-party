# 🎓 English Party - Live: https://english-party.web.app/

<div align="center">

**A gamified TOEIC learning platform for competitive friend groups**

[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.13-FFCA28?logo=firebase)](https://firebase.google.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A67D8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[Live Demo](#) • [Documentation](#) • [Report Bug](https://github.com/ngoctuan653/english-party/issues) • [Request Feature](https://github.com/ngoctuan653/english-party/issues)

</div>

---

## ✨ Highlights

🚀 **Study with Friends** - Learn together, compete fairly, stay motivated  
🎮 **Gamified Learning** - XP system, daily streaks, leaderboards  
🛡️ **Anti-Cheat System** - Real study time tracking, idle detection  
📱 **Progressive Web App** - Works offline, install to home screen  
🔥 **Real-time Features** - Live leaderboards, activity feeds  
⚡ **High Performance** - Vite + React 19 + TypeScript  

---

## 🎯 Core Features

### 🔐 Authentication & Profiles
- Google & Email/Password login
- User profiles with avatars
- Online/offline status tracking
- XP and streak management

### 📚 Study System
- **TOEIC Vocabulary** - Flashcard learning with spaced repetition
- **TOEIC Part 5** - Grammar practice with multiple choice
- **Listening Practice** - Audio-based exercises
- **Daily Missions** - Bite-sized tasks for consistency
- **Progress Analytics** - Detailed performance tracking

### 🏆 Gamification Engine
- **XP System** - Earn points on every correct answer
- **Daily Streaks** - Build consistency and motivation
- **Live Leaderboards** - Real-time friend rankings
- **Competitive Matching** - Fair difficulty scaling
- **Achievement Badges** - Milestone rewards

### 🚨 Anti-Cheat Protection
- Active study time validation
- Idle detection (3+ seconds)
- Tab visibility monitoring
- Minimum accuracy requirements
- Suspicious activity logging

### 🌐 Real-time Collaboration
- Live leaderboard updates (Firestore listeners)
- Online user presence
- Friend activity feeds
- Shared study sessions

### 🛠️ Admin Dashboard
- Question & vocabulary management
- CSV bulk import
- Audio file uploads
- Learning analytics
- User management

### 📦 PWA Capabilities
- Install to home screen
- Offline caching with Workbox
- Push notifications ready
- Mobile-first responsive design

---

## 🏗️ Tech Stack

### Frontend
```
React 19.2          - UI library
TypeScript 6.0      - Type safety
TailwindCSS 4.3     - Styling
Vite 8.0            - Build tool
Framer Motion       - Animations
Lucide React        - Icons
Recharts            - Charts & analytics
```

### Backend & Infrastructure
```
Firebase Auth       - Authentication
Firestore          - Real-time database
Firebase Storage   - File management
Firebase Hosting   - Deployment
Firebase Messaging - Push notifications
```

### Libraries
```
React Router v7    - Navigation
Zustand            - State management
react-hot-toast    - Notifications
Howler             - Audio playback
PapaParse          - CSV parsing
date-fns           - Date utilities
Workbox PWA        - Service worker
```

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Language** | TypeScript (73.2%), JavaScript (25.3%) |
| **Package Manager** | npm |
| **React Version** | 19.2.6 |
| **Node Modules** | 450+ |
| **Build Size** | ~500KB (gzipped) |

---

## 🗂️ Directory Structure

```
src/
├── components/         # Reusable React components
├── pages/              # Page components (Dashboard, Study, etc.)
├── layouts/            # Layout wrappers
├── hooks/              # Custom React hooks
├── services/           # Business logic & API calls
├── firebase/           # Firebase configuration
├── types/              # TypeScript interfaces
├── utils/              # Helper functions
└── features/           # Feature-specific modules
```

---

## 💾 Database Schema

### Collections
```
users               → User profiles, stats, settings
vocabulary          → Word definitions and examples
questions           → TOEIC questions (parts 1-7)
study_sessions      → Active study records
daily_progress      → Daily mission tracking
friendships         → Friend relationships
leaderboards        → Real-time rankings
study_history       → Historical performance data
```

### Example Question Document
```json
{
  "exam": "toeic",
  "part": 5,
  "type": "mcq",
  "topic": "business",
  "difficulty": 700,
  "question": "The meeting was _____ due to technical difficulties.",
  "choices": ["postponed", "delayed", "canceled", "extended"],
  "answer": 0,
  "explanation": "'Postponed' means to put off to a later time...",
  "audioUrl": null,
  "createdAt": 1234567890,
  "tags": ["grammar", "passive-voice"]
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (create at [firebase.google.com](https://firebase.google.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ngoctuan653/english-party.git
cd english-party
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - Create `.env.local` with your Firebase credentials
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_AUTH_DOMAIN=your_domain
```

4. **Start development server**
```bash
npm run dev
```
   - Open http://localhost:5173

5. **Build for production**
```bash
npm run build
npm run preview
```

---

## 📱 Responsive Design

Fully responsive across all devices:
- 📱 Mobile (320px+)
- 📲 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Ultra-wide (1920px+)

**UI Inspiration:** Duolingo • Notion • Modern mobile learning apps

---

## 🎮 How to Use

### For Students
1. Sign up with Google or email
2. Join a friend group
3. Start daily missions
4. Learn vocabulary with flashcards
5. Practice TOEIC questions
6. Track progress on leaderboards

### For Admins
1. Access admin dashboard
2. Upload new questions via CSV
3. Upload audio files for listening
4. Monitor user statistics
5. Manage users and content

---

## 🗺️ Roadmap

- [ ] AI-generated exercises
- [ ] Voice pronunciation scoring
- [ ] Group study rooms with video chat
- [ ] Native mobile app (React Native)
- [ ] Capacitor Android APK
- [ ] IELTS / JLPT / SAT expansion
- [ ] Offline sync improvements
- [ ] Dark mode

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support

Have questions or need help? 
- 📧 Open an issue on [GitHub](https://github.com/ngoctuan653/english-party/issues)
- 💬 Discussions welcome

---

<div align="center">

**Made with ❤️ by ngoctuan653**

⭐ If you find this helpful, please star the repository!

</div>
