# PAWPILOT 🐾

> **An AI-Powered Desktop Virtual Pet & Personal Productivity Assistant for Windows.**

PawPilot lives directly on your desktop as an interactive animated virtual pet companion. It remembers your deadlines, alerts you before work is due, reacts emotionally to your progress with GSAP animations, and provides an offline-first task manager and AI chat assistant.

---

## 🌟 Key Features

- 🐾 **Floating Desktop Pet**: Frameless, transparent, always-on-top, draggable mascot that stays with you.
- 🎭 **Emotional Pet Mood Engine**: Dynamic reactions (`IDLE`, `HAPPY`, `WORRIED`, `EXCITED`, `SLEEPING`, `WORKING`, `CELEBRATING`) based on deadlines, active focus sessions, and completion progress.
- ⚡ **GSAP Animation System**: Idle breathing, blinking, tail wagging, celebration jumps, and worry shakes.
- 💬 **Speech Bubbles**: Contextual floating speech bubbles for daily greetings, deadline warnings, and task completions.
- 📋 **Local Task & Deadline Manager**: SQLite-backed CRUD task engine supporting priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), categories, and statuses.
- 🧠 **Smart Reminder Engine**: Automated deadline proximity evaluation (7 days, 3 days, 24 hours, 3 hours left, deadline missed) with Windows native notifications.
- 🤖 **AI Assistant & Natural Language Parser**: Create tasks naturally (*"Remind me that my DBMS assignment is due Tuesday at 11:59 PM"*) with tool-calling support and offline fallbacks.
- ⏱️ **Focus Timer (Pomodoro)**: Dedicated focus mode that calms pet animations and suppresses non-essential alerts during work.
- 📊 **Gamification & XP Stats**: Earn XP per completed task, level up your pet companion, and build daily streaks.
- 🖥️ **Futuristic Glassmorphic Dashboard**: Secondary dark glass dashboard for broad task overview, calendar, productivity analytics, and settings.
- 🚀 **System Tray & Windows Startup**: System tray menu integration and launch on Windows startup configuration.

---

## 🏗️ Tech Stack & Architecture

- **Desktop Framework**: Electron 34 (`contextIsolation: true`, `nodeIntegration: false`)
- **Frontend**: React 18, Vite 6, TypeScript
- **Styling**: Tailwind CSS, CSS Variables, Glassmorphism
- **Animations**: GSAP (GreenSock Animation Platform)
- **Database**: SQLite with `sql.js` pure JS persistence engine
- **Audio**: Web Audio API Synthesizer
- **Packaging**: Electron Builder (NSIS Windows Installer)

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/pawpilot.git
cd pawpilot
npm install
```

### 3. Development Mode

Launch the app with Vite and Electron concurrently:

```bash
npm run dev
```

### 4. Build & Production Package

To compile TypeScript and bundle Electron app into a Windows executable (`PawPilot-Setup.exe`):

```bash
npm run build
npm run dist
```

Outputs will be placed inside the `release/` directory.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` to configure AI providers:

```env
AI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4o-mini
```

*Note: PawPilot is fully offline-first. Even without an API key, all pet interactions, task engine, reminders, and natural language parsers operate locally.*

---

## 📄 License

MIT License. Designed with ❤️ by Google DeepMind Antigravity Pair Programmer.
