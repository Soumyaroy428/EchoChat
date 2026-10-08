# Product Requirements Document (PRD): EchoChat

## 1. Overview
**Project Name:** EchoChat
**Status:** DRAFT
**Description:** EchoChat is a WhatsApp-style real-time messaging application. It enables users to register via OTP, manage contacts, and engage in real-time, one-to-one conversations with persistent message history and offline message retrieval.

## 2. Technical Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (managed via Prisma ORM)
- **Real-time Communication:** Socket.IO
- **Authentication:** JWT (JSON Web Tokens) & Twilio (SMS OTP)
- **File Storage:** Local File System (Avatar and chat media uploads)

## 3. Current Features (Implemented)
The following features have already been developed and are currently operational:

### 3.1. User Authentication & Onboarding
- **Phone Number Registration & Login:** Users can sign up and log in using their phone numbers.
- **OTP Verification:** SMS-based OTP verification powered by Twilio.
- **Profile Management:** Users can set and update their display names and upload profile avatars.

### 3.2. Contact Management
- **Add Contacts:** Users can add other registered users to their contact list.
- **View Contacts:** Users can view a list of their saved contacts to initiate conversations.

### 3.3. Real-Time Messaging (One-to-One)
- **Live Chat:** Real-time message delivery using Socket.IO.
- **Persistent History:** Messages are stored in MongoDB to persist across sessions.
- **Offline Message Retrieval:** Messages sent to offline users are saved and automatically delivered when the receiver logs back in and opens the conversation.
- **Media Sharing:** Support for uploading and sending media files within chats.

---

## 4. Pending Features (The Rest)
The following features are required to achieve parity with standard modern messaging apps (like WhatsApp) but are not yet implemented:

### 4.1. Advanced Messaging Capabilities
- [ ] **Typing Indicators:** Visual cues indicating when the other user is typing.
- [ ] **Read Receipts:** Message status indicators (Sent `✓`, Delivered `✓✓`, Read `blue ✓✓`).
- [ ] **Online/Last Seen Status:** Display user availability and last active timestamp.
- [ ] **Message Reactions:** Ability to react to specific messages with emojis.
- [ ] **Reply/Quote Messages:** Ability to reply to a specific previous message in the thread.
- [ ] **Delete Messages:** "Delete for me" and "Delete for everyone" functionality.

### 4.2. Group Chats
- [ ] **Group Creation:** Allow users to create groups and add multiple contacts.
- [ ] **Group Roles:** Admin controls (add/remove participants, change group info).
- [ ] **Group Messaging:** Real-time broadcasting of messages to all group members.

### 4.3. Enhanced Media & Sharing
- [ ] **Voice Notes:** Record and send audio messages directly within the chat interface.
- [ ] **Document Sharing:** Support for sending PDFs, documents, and archives.
- [ ] **Location Sharing:** Share current or live location via integration with Maps APIs.

### 4.4. Notifications
- [ ] **Push Notifications:** Web push notifications or FCM (Firebase Cloud Messaging) integration for offline alerts when the app is backgrounded.

---

## 5. Future Plan & Roadmap (5-Checkpoint Execution)
To systematically scale and expand the platform post-MVP, the roadmap has been broken down into 5 actionable checkpoints. Each checkpoint includes specific features and success criteria.

### Checkpoint 1: Core Messaging Parity & Presence (MVP+)
*Focus: Achieving standard WhatsApp-like functionality for 1-on-1 chats.*
- **Features:** 
  - Typing indicators and Read Receipts (Sent/Delivered/Read).
  - Online/Last seen presence.
  - Message interactions: Delete messages (for me/everyone), Reply/Quote, and Emoji Reactions.
- **Success Criteria:** Message delivery latency remains < 200ms with 99.9% uptime for the Socket.IO server.

### Checkpoint 2: Group Dynamics & Push Notifications
*Focus: Expanding communication to multiple users and improving engagement retention.*
- **Features:**
  - Group Chat creation and participant management.
  - Group Admin roles and permissions (add/remove participants, edit info).
  - Web Push Notifications / FCM integration for offline & background alerts.
- **Success Criteria:** Successful offline message sync rate reaches 100%, and background users return via push alerts.

### Checkpoint 3: Rich Media & Real-time Calling
*Focus: Upgrading the communication mediums available to users.*
- **Features:**
  - **WebRTC Integration:** Peer-to-peer Voice and Video calling.
  - **Advanced Media:** Voice notes, media compression, and multi-file uploads.
  - **File Support:** Document sharing (PDFs, archives) and Live Location sharing.
- **Success Criteria:** Average session duration increases due to interactive voice/video usage.

### Checkpoint 4: Social Engagement & Infrastructure Scale
*Focus: Social features and preparing the backend for high traffic.*
- **Features:**
  - **Status/Stories:** 24-hour disappearing text/image/video updates.
  - **Cloud Storage Migration:** Transition media and avatar uploads from the local filesystem to AWS S3 or Google Cloud Storage for CDN distribution and unlimited scaling.
- **Success Criteria:** Daily Active Users (DAU) metric increases due to the viral loop of Status/Stories.

### Checkpoint 5: Ultimate Security & Native Platforms
*Focus: Enterprise-grade privacy and mobile app store presence.*
- **Features:**
  - **End-to-End Encryption (E2EE):** Implementation of the Signal Protocol for all 1-on-1 and group chats.
  - **Native Apps:** Wrap the web client into React Native / Capacitor (for iOS/Android) and Electron (for Desktop Windows/Mac).
- **Success Criteria:** Successful deployment to Apple App Store and Google Play Store with zero plain-text messages stored on backend servers.
