const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'server/src/app.ts');
let content = fs.readFileSync(appPath, 'utf8');

const oldStr = `  socket.on(
    "send_message",
    async (
      payload: { receiverId?: string; groupId?: string; content?: string; mediaUrl?: string },
      acknowledge: (response: { message?: ReturnType<typeof mapMessage>; error?: string }) => void,
    ) => {
      const receiverId = payload?.receiverId;
      const groupId = payload?.groupId;
      const content = payload?.content || "";
      const mediaUrl = payload?.mediaUrl || "";`;

const newStr = `  socket.on(
    "send_message",
    async (
      payload: { receiverId?: string; groupId?: string; content?: string; mediaUrl?: string; messageType?: string; metadata?: any },
      acknowledge: (response: { message?: ReturnType<typeof mapMessage>; error?: string }) => void,
    ) => {
      const receiverId = payload?.receiverId;
      const groupId = payload?.groupId;
      const content = payload?.content || "";
      const mediaUrl = payload?.mediaUrl || "";
      const messageType = payload?.messageType || "text";
      const metadata = payload?.metadata || {};`;

content = content.replace(oldStr, newStr);

// Also need to add messageType and metadata to MessageHistory.create
const oldCreateGroup = `          const message = await MessageHistory.create({
            senderId: userId,
            groupId,
            content,
            mediaUrl,
            status: "sent",
          });`;

const newCreateGroup = `          const message = await MessageHistory.create({
            senderId: userId,
            groupId,
            content,
            mediaUrl,
            messageType,
            metadata,
            status: "sent",
          });`;

content = content.replace(oldCreateGroup, newCreateGroup);

const oldCreateSingle = `          const message = await MessageHistory.create({
            senderId: userId,
            receiverId: canonicalReceiverId,
            content,
            mediaUrl,
            status: isReceiverOnline ? "delivered" : "sent",
          });`;

const newCreateSingle = `          const message = await MessageHistory.create({
            senderId: userId,
            receiverId: canonicalReceiverId,
            content,
            mediaUrl,
            messageType,
            metadata,
            status: isReceiverOnline ? "delivered" : "sent",
          });`;

content = content.replace(oldCreateSingle, newCreateSingle);

fs.writeFileSync(appPath, content);
console.log('Done');
