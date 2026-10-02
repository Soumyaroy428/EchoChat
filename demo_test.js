
const axios = require("axios");

async function test() {
  const API = "https://echochat-1-2ira.onrender.com/api";
  
  // 1. Register Sender
  console.log("Registering Sender...");
  const senderRes = await axios.post(`${API}/auth/register`, {
    name: "Demo Sender",
    mobile: "9999999991",
    password: "password123"
  });
  const senderToken = senderRes.data.token;
  
  // 2. Register Receiver
  console.log("Registering Receiver...");
  const receiverRes = await axios.post(`${API}/auth/register`, {
    name: "Demo Receiver",
    mobile: "9999999992",
    password: "password123"
  });
  const receiverToken = receiverRes.data.token;
  
  // 3. Sender creates Contact for Receiver
  console.log("Sender creating contact for Receiver...");
  await axios.post(`${API}/contacts`, {
    name: "Demo Receiver",
    mobile: "9999999992" // exact match!
  }, {
    headers: { Authorization: `Bearer ${senderToken}` }
  });
  
  // 4. Sender fetches contacts to get the resolved Contact ID
  const contactsRes = await axios.get(`${API}/contacts`, {
    headers: { Authorization: `Bearer ${senderToken}` }
  });
  const contact = contactsRes.data.contacts.find(c => c.mobile === "9999999992");
  
  console.log("Receiver isOnline status in Sender`s contact list:", contact.isOnline);
  
  // 5. Sender sends message to Receiver
  console.log("Sender sending message to Receiver...");
  const msgRes = await axios.post(`${API}/messages`, {
    receiverId: contact.id,
    content: "Hello from the demo script!"
  }, {
    headers: { Authorization: `Bearer ${senderToken}` }
  });
  
  console.log("Message sent:", msgRes.data.message);
  
  // 6. Receiver checks their messages with Sender
  // Wait, receiver needs to know Sender`s user ID.
  // We can just check receiver`s contact list? It will be empty, because receiver hasn`t added sender.
  // But receiver can fetch messages using sender`s ID.
  const senderUserId = senderRes.data.user.id;
  console.log("Receiver fetching messages from Sender...");
  const historyRes = await axios.get(`${API}/messages/${senderUserId}`, {
    headers: { Authorization: `Bearer ${receiverToken}` }
  });
  
  console.log("Receiver received messages:", historyRes.data.messages);
}

test().catch(console.error);
