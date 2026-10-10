const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client/components/chat/message.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace('messageType?: "text" | "image" | "audio" | "file" | "location";', 'messageType?: "text" | "image" | "audio" | "file" | "location" | "video";');

content = content.replace(`    const handleMessage = (message: {
      id?: string;
      senderId: string;
      receiverId?: string;
      groupId?: string;
      content: string;
      timestamp: string;
      mediaUrl?: string;
    }) => {`, `    const handleMessage = (message: {
      id?: string;
      senderId: string;
      receiverId?: string;
      groupId?: string;
      content: string;
      timestamp: string;
      mediaUrl?: string;
      messageType?: "text" | "image" | "audio" | "file" | "location" | "video";
      metadata?: any;
    }) => {`);

fs.writeFileSync(file, content);
console.log('Fixed message.tsx');
