\# English Party



A full-stack gamified English learning platform focused on TOEIC 700–800 preparation for small friend groups.



Built with React, TypeScript, TailwindCSS, and Firebase.



\---



\# Features



\## Authentication

\- Google login

\- Email/password authentication

\- User profiles

\- Online/offline status

\- XP and streak tracking



\## Study System

\- TOEIC vocabulary learning

\- TOEIC Part 5 grammar practice

\- Listening practice

\- Flashcards

\- Daily missions



\## Gamification

\- XP system

\- Daily streaks

\- Leaderboards

\- Friend competition

\- Progress tracking



\## Anti-cheat System

\- Active study time tracking

\- Idle detection

\- Tab visibility detection

\- Interaction validation

\- Accuracy requirements



\## Real-time Features

\- Live leaderboard updates

\- Online users

\- Friend activity feed

\- Real-time study sessions



\## Admin Dashboard

\- Question management

\- Vocabulary management

\- CSV import

\- Listening upload

\- Analytics overview



\## PWA Support

\- Install to home screen

\- Offline caching

\- Mobile-first UX

\- Push notifications



\---



\# Tech Stack



\## Frontend

\- React

\- TypeScript

\- TailwindCSS

\- Vite



\## Backend / Infrastructure

\- Firebase Auth

\- Firestore

\- Firebase Storage

\- Firebase Hosting

\- Firebase Cloud Messaging



\## Future Support

\- Capacitor Android APK

\- IELTS / JLPT / SAT expansion

\- AI-generated questions



\---



\# Project Goals



Create a modern TOEIC learning platform where small friend groups can:

\- study together

\- maintain motivation

\- compete fairly

\- improve consistency

\- avoid fake streak abuse



\---



\# Core Modules



\- Dashboard

\- Vocabulary Learning

\- TOEIC Questions

\- Listening Practice

\- Daily Missions

\- Leaderboards

\- Friend System

\- Admin Panel



\---



\# Database Collections



```txt

users

vocabulary

questions

study\_sessions

daily\_progress

friendships

leaderboards

```



Example question schema:



```json

{

&#x20; "exam": "toeic",

&#x20; "part": 5,

&#x20; "type": "mcq",

&#x20; "topic": "business",

&#x20; "difficulty": 700,

&#x20; "question": "...",

&#x20; "choices": \["A", "B", "C", "D"],

&#x20; "answer": 1,

&#x20; "explanation": "...",

&#x20; "audioUrl": null

}

```



\---



\# Responsive Design



Supports:

\- Desktop

\- Tablet

\- Mobile

\- PWA installation



UI inspired by:

\- Duolingo

\- Notion

\- Modern mobile learning apps



\---



\# Development Setup



Install dependencies:



```bash

npm install

```



Run development server:



```bash

npm run dev

```



Build production:



```bash

npm run build

```



Deploy Firebase Hosting:



```bash

firebase deploy

```



\---



\# Firebase Features



\- Authentication

\- Firestore database

\- Real-time listeners

\- Cloud Messaging

\- Storage

\- Hosting



\---



\# Folder Structure



```txt

src/

&#x20; components/

&#x20; pages/

&#x20; layouts/

&#x20; hooks/

&#x20; services/

&#x20; firebase/

&#x20; types/

&#x20; utils/

&#x20; features/

```



\---



\# Future Roadmap



\- AI-generated exercises

\- Voice pronunciation scoring

\- Group study rooms

\- Mobile APK

\- React Native app

\- IELTS / JLPT support



\---



\# License



MIT

