import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

import mongoose from "mongoose";
import UserModel from "../models/User";
import OtpModel from "../models/otp";
import NewContactModel from "../models/newContact";
import GroupModel from "../models/Group";
import MessageHistoryModel from "../models/messageHistory";
import StatusModel from "../models/Status";

interface TestResult {
  suite: string;
  test: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({ suite, test: name, passed: true, durationMs: Date.now() - start });
    console.log(`  ✅ [${suite}] ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({ suite, test: name, passed: false, error: err?.message || String(err), durationMs: Date.now() - start });
    console.error(`  ❌ [${suite}] ${name}:`, err?.message || err);
  }
}

async function main() {
  console.log("=================================================");
  console.log("   EchoChat ERD Database Schema Verification");
  console.log("=================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not defined in server/.env");
    process.exit(1);
  }

  const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  console.log(`Connecting to MongoDB Atlas: ${maskedUri}...`);
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log("✅ Successfully connected to MongoDB!\n");

  // Ensure all schema indices (like unique email) are initialized
  await UserModel.createIndexes();
  await OtpModel.createIndexes();
  await StatusModel.createIndexes();

  const testSuffix = `test_${Date.now()}`;
  const testEmail1 = `echochat_${testSuffix}_1@example.com`;
  const testEmail2 = `echochat_${testSuffix}_2@example.com`;

  let user1: any = null;
  let user2: any = null;
  let otpRecord: any = null;
  let contactRecord: any = null;
  let groupRecord: any = null;
  let messageRecord: any = null;
  let statusRecord: any = null;

  try {
    // -----------------------------------------------------------------
    // 1. User Model Tests
    // -----------------------------------------------------------------
    await runTest("User Model", "Create primary and peer users with all ERD fields", async () => {
      user1 = await UserModel.create({
        email: testEmail1,
        mobile: "+1234567890",
        password: "$2a$10$hashedPasswordPlaceholderForTesting123",
        name: "Test User One",
        about: "Hey there! I am using EchoChat.",
        aboutVisibility: "everyone",
        publicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
        isOnline: true,
        lastSeen: new Date(),
      });

      user2 = await UserModel.create({
        email: testEmail2,
        mobile: "+1234567891",
        password: "$2a$10$hashedPasswordPlaceholderForTesting456",
        name: "Test User Two",
        about: "Busy coding",
        aboutVisibility: "contacts",
        publicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEB...",
        isOnline: false,
        lastSeen: new Date(),
      });

      if (!user1._id || !user2._id) throw new Error("Users failed to generate ObjectIds");
      if (user1.email !== testEmail1) throw new Error("User email mismatch");
      if (!user1.createdAt || !user1.updatedAt) throw new Error("Timestamps not set automatically");
    });

    await runTest("User Model", "Enforce unique email constraint", async () => {
      let duplicateThrew = false;
      try {
        await UserModel.create({
          email: testEmail1,
          password: "password123",
        });
      } catch (err: any) {
        duplicateThrew = true;
      }
      if (!duplicateThrew) throw new Error("Duplicate email allowed despite unique index");
    });

    // -----------------------------------------------------------------
    // 2. Otp Model Tests (Auth Link to User)
    // -----------------------------------------------------------------
    await runTest("Otp Model", "Generate, persist, and verify 6-digit OTP referencing User email", async () => {
      const generatedOtp = "849201";
      otpRecord = await OtpModel.create({
        email: user1.email,
        phonenumber: user1.mobile,
        otp: generatedOtp,
        createdAt: new Date(),
      });

      if (!otpRecord._id) throw new Error("Otp record missing ObjectId");
      if (otpRecord.otp !== generatedOtp) throw new Error("Otp mismatch");
      if (otpRecord.email !== user1.email) throw new Error("Otp email does not match user email");

      // Verify expiration window default is ~5 minutes in the future
      const expiryDiff = otpRecord.otpExpiresAt.getTime() - otpRecord.createdAt.getTime();
      if (expiryDiff < 290000 || expiryDiff > 310000) {
        throw new Error(`Unexpected default expiry duration: ${expiryDiff}ms`);
      }
    });

    // -----------------------------------------------------------------
    // 3. NewContact Model Tests (Address Book Graph)
    // -----------------------------------------------------------------
    await runTest("NewContact Model", "Create address book contact with foreign keys to User", async () => {
      contactRecord = await NewContactModel.create({
        ownerId: user1._id,
        contactUserId: user2._id,
        firstName: "Test",
        lastName: "Two",
        username: "testuser2",
        email: user2.email,
        mobile: user2.mobile,
        active: true,
      });

      if (!contactRecord._id) throw new Error("Contact missing ObjectId");
      if (String(contactRecord.ownerId) !== String(user1._id)) throw new Error("OwnerId foreign key mismatch");
      if (String(contactRecord.contactUserId) !== String(user2._id)) throw new Error("ContactUserId foreign key mismatch");

      // Test Mongoose population across relationship
      const populatedContact = await NewContactModel.findById(contactRecord._id).populate("ownerId").populate("contactUserId");
      if (!populatedContact) throw new Error("Populated contact not found");
      if ((populatedContact.ownerId as any).email !== user1.email) throw new Error("ownerId population failed");
      if ((populatedContact.contactUserId as any).email !== user2.email) throw new Error("contactUserId population failed");
    });

    // -----------------------------------------------------------------
    // 4. Group Model Tests (Group Channels)
    // -----------------------------------------------------------------
    await runTest("Group Model", "Create group channel with admin/member arrays and creator", async () => {
      groupRecord = await GroupModel.create({
        name: "EchoChat Core Devs",
        description: "Official engineering channel",
        admins: [String(user1._id)],
        members: [String(user1._id), String(user2._id)],
        createdBy: String(user1._id),
      });

      if (!groupRecord._id) throw new Error("Group missing ObjectId");
      if (groupRecord.createdBy !== String(user1._id)) throw new Error("CreatedBy mismatch");
      if (!groupRecord.members.includes(String(user2._id))) throw new Error("Member not in group");
    });

    // -----------------------------------------------------------------
    // 5. MessageHistory Model Tests (1-on-1 and Group Chat)
    // -----------------------------------------------------------------
    await runTest("MessageHistory Model", "Store direct message and advance delivery status", async () => {
      messageRecord = await MessageHistoryModel.create({
        senderId: String(user1._id),
        receiverId: String(user2._id),
        content: "Hello from EchoChat test runner!",
        messageType: "text",
        status: "sent",
        timestamp: new Date(),
        metadata: { clientGeneratedId: "cli_msg_123" },
      });

      if (!messageRecord._id) throw new Error("Message missing ObjectId");
      if (messageRecord.status !== "sent") throw new Error("Initial status should be sent");

      // Advance delivery status: sent -> delivered -> read
      messageRecord.status = "delivered";
      await messageRecord.save();
      let updated = await MessageHistoryModel.findById(messageRecord._id);
      if (updated?.status !== "delivered") throw new Error("Status failed to update to delivered");

      messageRecord.status = "read";
      await messageRecord.save();
      updated = await MessageHistoryModel.findById(messageRecord._id);
      if (updated?.status !== "read") throw new Error("Status failed to update to read");
    });

    await runTest("MessageHistory Model", "Store group broadcast message", async () => {
      const groupMsg = await MessageHistoryModel.create({
        senderId: String(user1._id),
        groupId: String(groupRecord._id),
        content: "Hey everyone in the group!",
        messageType: "text",
        status: "sent",
      });

      if (!groupMsg.groupId || groupMsg.groupId !== String(groupRecord._id)) {
        throw new Error("GroupId mismatch on group message");
      }
      await MessageHistoryModel.deleteOne({ _id: groupMsg._id });
    });

    // -----------------------------------------------------------------
    // 6. Status Model Tests (24h Ephemeral Stories & Viewers)
    // -----------------------------------------------------------------
    await runTest("Status Model", "Create ephemeral status story with embedded viewer receipts", async () => {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      statusRecord = await StatusModel.create({
        user: user1._id,
        mediaType: "text",
        text: "Building the future with EchoChat!",
        backgroundColor: "#0d6b50",
        expiresAt: expires,
        viewers: [
          {
            user: user2._id,
            viewedAt: new Date(),
          },
        ],
      });

      if (!statusRecord._id) throw new Error("Status missing ObjectId");
      if (String(statusRecord.user) !== String(user1._id)) throw new Error("User foreign key mismatch");
      if (statusRecord.viewers.length !== 1) throw new Error("Viewer receipt was not recorded");
      if (String(statusRecord.viewers[0].user) !== String(user2._id)) throw new Error("Viewer user mismatch");
    });

  } finally {
    // -----------------------------------------------------------------
    // Cleanup: Remove all test records created
    // -----------------------------------------------------------------
    console.log("\n🧹 Cleaning up test artifacts from database...");
    const cleanupOps = [];
    if (user1?._id) cleanupOps.push(UserModel.deleteOne({ _id: user1._id }));
    if (user2?._id) cleanupOps.push(UserModel.deleteOne({ _id: user2._id }));
    if (otpRecord?._id) cleanupOps.push(OtpModel.deleteOne({ _id: otpRecord._id }));
    if (contactRecord?._id) cleanupOps.push(NewContactModel.deleteOne({ _id: contactRecord._id }));
    if (groupRecord?._id) cleanupOps.push(GroupModel.deleteOne({ _id: groupRecord._id }));
    if (messageRecord?._id) cleanupOps.push(MessageHistoryModel.deleteOne({ _id: messageRecord._id }));
    if (statusRecord?._id) cleanupOps.push(StatusModel.deleteOne({ _id: statusRecord._id }));

    await Promise.allSettled(cleanupOps);
    console.log("✅ Cleanup complete.");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.\n");
  }

  // -----------------------------------------------------------------
  // Summary Report
  // -----------------------------------------------------------------
  console.log("=================================================");
  console.log("                Test Results Summary");
  console.log("=================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests Run : ${total}`);
  console.log(`Passed          : ${passed}`);
  console.log(`Failed          : ${failed}`);

  if (failed > 0) {
    console.log("\nFailed Tests:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  - [${r.suite}] ${r.test}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log("\n🎉 ALL ERD DATABASE MODELS AND OPERATIONS PASSED 100%!");
  }
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
