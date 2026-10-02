const { io } = require("socket.io-client");
const axios = require("axios");

const API_URL = "https://echochat-1-2ira.onrender.com";

async function runTest() {
  try {
    console.log("=== Starting End-to-End Chat Test ===");
    
    // Randomize phones to avoid collisions
    const phone1 = "999888" + Math.floor(Math.random() * 10000);
    const phone2 = "777666" + Math.floor(Math.random() * 10000);

    // 1. Send OTP for User A & User B
    console.log(`Registering User A (${phone1}) and User B (${phone2})...`);
    await axios.post(`${API_URL}/api/auth/sendOtp`, { mobile: phone1 });
    await axios.post(`${API_URL}/api/auth/sendOtp`, { mobile: phone2 });

    // Assuming OTP is hardcoded or bypassable in test?
    // Wait, is OTP actually sent to Twilio? If yes, it will cost money and we can't get the code!
    // Let me check authController.ts to see if we can bypass OTP!
    
  } catch (error) {
    console.error("Test failed:", error?.response?.data || error.message);
  }
}
runTest();
