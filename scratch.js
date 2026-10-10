const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'server/src/app.ts');
let content = fs.readFileSync(appPath, 'utf8');

if (!content.includes('const activeCalls')) {
  content = content.replace('io.on("connection",', 'const activeCalls = new Map<string, { participants: Set<string> }>();\n\nio.on("connection",');
}

const oldWebRTC = `  // WebRTC Signaling
  socket.on("call_user", async (data: { userToCall: string, signalData: any, name: string, isVideo: boolean }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.userToCall);
      socket.to(\`user:\${canonicalReceiverId}\`).emit("call_incoming", {
        signal: data.signalData,
        from: userId,
        name: data.name,
        isVideo: data.isVideo
      });
    } catch (e) { console.error(e); }
  });

  socket.on("answer_call", async (data: { to: string, signal: any }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.to);
      socket.to(\`user:\${canonicalReceiverId}\`).emit("call_accepted", data.signal);
    } catch (e) { console.error(e); }
  });

  socket.on("end_call", async (data: { to: string }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.to);
      socket.to(\`user:\${canonicalReceiverId}\`).emit("call_ended");
    } catch (e) { console.error(e); }
  });

  socket.on("reject_call", async (data: { to: string }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.to);
      socket.to(\`user:\${canonicalReceiverId}\`).emit("call_rejected");
    } catch (e) { console.error(e); }
  });`;

const newWebRTC = `  // WebRTC Signaling
  socket.on("call_user", async (data: { userToCall: string, signalData: any, name: string, isVideo: boolean }) => {
    try {
      const canonicalReceiverId = await resolveUserId(data.userToCall);
      const callId = Math.random().toString(36).substring(2, 15);
      activeCalls.set(callId, { participants: new Set([userId, canonicalReceiverId]) });
      socket.to(\`user:\${canonicalReceiverId}\`).emit("call_incoming", {
        callId,
        signal: data.signalData,
        from: userId,
        name: data.name,
        isVideo: data.isVideo
      });
    } catch (e) { console.error(e); }
  });

  socket.on("answer_call", async (data: { callId: string, signal: any }) => {
    try {
      const call = activeCalls.get(data.callId);
      if (!call || !call.participants.has(userId)) return;
      const otherParticipant = Array.from(call.participants).find(id => id !== userId);
      if (otherParticipant) {
        socket.to(\`user:\${otherParticipant}\`).emit("call_accepted", { signal: data.signal, callId: data.callId });
      }
    } catch (e) { console.error(e); }
  });

  socket.on("end_call", async (data: { callId: string }) => {
    try {
      const call = activeCalls.get(data.callId);
      if (!call || !call.participants.has(userId)) return;
      const otherParticipant = Array.from(call.participants).find(id => id !== userId);
      if (otherParticipant) {
        socket.to(\`user:\${otherParticipant}\`).emit("call_ended", { callId: data.callId });
      }
      activeCalls.delete(data.callId);
    } catch (e) { console.error(e); }
  });

  socket.on("reject_call", async (data: { callId: string }) => {
    try {
      const call = activeCalls.get(data.callId);
      if (!call || !call.participants.has(userId)) return;
      const otherParticipant = Array.from(call.participants).find(id => id !== userId);
      if (otherParticipant) {
        socket.to(\`user:\${otherParticipant}\`).emit("call_rejected", { callId: data.callId });
      }
      activeCalls.delete(data.callId);
    } catch (e) { console.error(e); }
  });`;

content = content.replace(oldWebRTC, newWebRTC);
fs.writeFileSync(appPath, content);
console.log('Done replacing app.ts');
