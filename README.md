# StudyCircle

A full-stack peer study matching platform built with the MERN stack.

## Tech Stack

- **Frontend:** Vite + React 18, React Router v6, Zustand, TailwindCSS, React Hook Form + Zod
- **Backend:** Node.js + Express.js, Socket.IO
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (access + refresh tokens), bcrypt
- **File Uploads:** Multer + Cloudinary
- **Email:** Nodemailer

## Project Structure

```
/studycircle
  /client   # Vite React frontend
  /server   # Node + Express backend
  /shared   # Shared Zod schemas
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally or MongoDB Atlas
- Cloudinary account (for image uploads)
- SMTP credentials (for email)

### Setup

1. **Install server dependencies:**
```bash
cd server
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

2. **Install client dependencies:**
```bash
cd client
npm install
npm run dev
```

3. **Install shared package:**
```bash
cd shared
npm install
```

### Environment Variables

See `server/.env.example` for required variables.

## Features

- Authentication (signup, login, email verification, forgot/reset password)
- Profile onboarding wizard (3 steps)
- Matching algorithm with score-based suggestions
- Real-time chat with Socket.IO
- Study sessions with Pomodoro timer
- Leaderboard & gamification (XP, streaks, badges)
- Notifications (in-app + email)
- Settings (password, notifications, privacy, dark mode)

## API Endpoints

See task description for full list of routes.

## License

MIT
