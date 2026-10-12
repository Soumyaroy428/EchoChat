# EchoChat — Project Guidelines & Developer Rules

> **Single Source of Truth** for autonomous agents and contributors working on EchoChat.

---

## 1. Project Overview

EchoChat is a full-stack real-time communication platform built with:
- **Client:** Next.js 15 (React 19, App Router, TypeScript, Tailwind CSS, Lucide Icons)
- **Server:** Node.js, Express 5, TypeScript, Socket.IO, WebRTC (Simple-Peer)
- **Database:** MongoDB Atlas (Mongoose ODM, Prisma schema)
- **Cloud & CDN:** Cloudinary (Media/Status CDN) with local storage fallback
- **Security:** Zero-knowledge client-side E2EE (`window.crypto.subtle` ECDH P-256 + AES-GCM 256)
- **Mobile/Desktop:** Capacitor (iOS/Android) and Electron (Desktop)

---

## 2. Core Development Disciplines

### 2.1. Search-First Discipline
- **Search Before Reading:** Always use dedicated search tools to locate relevant symbols and line ranges before reading entire files.
- **Minimal Context Pollution:** Read only the lines required for understanding and modifying the relevant component or service.

### 2.2. Empirical Validation
- **Proof Required:** Never assume a change works without empirical verification.
- **Verification Criteria:**
  - Backend/API changes: Verify with TypeScript check (`npx tsc --noEmit`) and HTTP tests.
  - Frontend/UI changes: Verify with Next.js build (`npm run build`) and lint checks.
  - Sockets & WebRTC: Verify event naming, payload consistency, and error handling.

### 2.3. Git & Deployment Discipline
- **Atomic Commits:** Each commit should address a distinct logical unit with descriptive conventional commit messages (e.g., `feat(chat): ...`, `fix(call): ...`, `docs: ...`).
- **Remote Synchronization:** Pushes to GitHub must update both `master` and the agent mirror:
  ```powershell
  git push origin master:agents/push-all-projects-to-github -f; git push origin master
  ```
- **Preserve Production URLs:**
  - Frontend: `https://client-mu-taupe.vercel.app`
  - Backend: `https://echochat-1-2ira.onrender.com`

---

## 3. Technology Conventions

### 3.1. Next.js 15 (Client)
- Use App Router patterns (`app/page.tsx`, `app/layout.tsx`).
- Mark interactive components with `"use client";` directive at the top.
- Handle browser-only APIs (`window`, `localStorage`, `navigator.mediaDevices`, `crypto.subtle`) inside `useEffect` or client-side event handlers.

### 3.2. Express 5 & Socket.IO (Server)
- Always resolve and validate user identifiers using `resolveUserId()`.
- Route signaling events (`call_user`, `answer_call`, `end_call`, `reject_call`) using active `callId` tracking to prevent race conditions.
- Enforce strict authentication on file downloads and API routes.
- Preserve rate-limiting separation between OTP endpoints and standard authentication.

---

## 4. Documentation References
- **PRD:** See [PRD.md](./PRD.md) for full functional requirements, data models, and API/Socket specifications.
- **README:** See [README.md](./README.md) for architecture, setup instructions, and deployment details.
- **Deployment:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for cloud hosting guides.
