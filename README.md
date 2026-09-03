# EchoChat

EchoChat is a WhatsApp-style real-time messaging application built with Next.js, Express, MongoDB, and Socket.IO.

## Features

- User registration and login
- OTP verification
- Contact management
- One-to-one real-time messaging
- Persistent message history
- Offline message retrieval after login
- Profile names and avatars

## Project structure

```text
EchoChat/
├── client/   # Next.js frontend
└── server/   # Express, Socket.IO, and MongoDB backend
```

## Requirements

- Node.js 20 or newer
- MongoDB database
- Twilio account for SMS OTP, if OTP delivery is enabled

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/Soumyaroy428/EchoChat.git
cd EchoChat

cd server
npm install

cd ../client
npm install
```

Create `server/.env` with the values required by the backend:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/echochat
JWT_SECRET=replace-with-a-long-random-secret
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Never commit `.env` or `.env.local` files.

## Run locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Message delivery flow

1. The client connects to Socket.IO using the authenticated JWT.
2. The server validates the token and joins the user to a private room.
3. Sending a message emits `send_message`.
4. The server resolves the receiver account, saves the message in MongoDB, and emits `message_received`.
5. Online receivers see the message immediately.
6. Offline receivers see the saved message when they log in and open the conversation.

## Build

```bash
cd server
npm run build

cd ../client
npm run build
```

## Deployment

### Frontend (Vercel)

The Next.js frontend can be deployed to Vercel:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will auto-detect the Next.js configuration
4. Add environment variable: `NEXT_PUBLIC_SOCKET_URL` (your backend URL)
5. Deploy

### Backend (Railway/Render/Fly.io)

The backend uses Socket.IO for real-time messaging and requires a long-running server. Deploy to Railway, Render, or Fly.io instead of Vercel.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## License

This project is for learning and development purposes.
