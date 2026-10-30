import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
import NewContact from "../models/newContact";
import User from "../models/User";
import MessageHistory from "../models/messageHistory";

export const createContact = async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile, email, avatar } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const contactIdentifier = (mobile || email || "").toString().trim();
    if (!contactIdentifier && !name) {
      return res.status(400).json({ error: "Contact name, email, or mobile number is required" });
    }

    // Try to find if a registered user exists with this email or mobile
    const registeredUser = contactIdentifier
      ? await User.findOne({
          $or: [
            { mobile: contactIdentifier },
            { email: contactIdentifier },
            { email: contactIdentifier.toLowerCase() },
          ],
        }).select("_id name mobile email avatar isOnline lastSeen publicKey")
      : null;

    // split name into first and last
    const displayName = (name || registeredUser?.name || contactIdentifier).trim();
    const parts = displayName.split(/\s+/);
    const firstName = parts[0] || "Contact";
    const lastName = parts.slice(1).join(" ") || "";

    const username = displayName.replace(/\s+/g, "_").toLowerCase();

    const contact = new NewContact({
      ownerId: userId,
      contactUserId: registeredUser?._id,
      firstName,
      lastName,
      username,
      mobile: contactIdentifier || registeredUser?.mobile || registeredUser?.email || "",
      email: registeredUser?.email || (contactIdentifier.includes("@") ? contactIdentifier.toLowerCase() : ""),
      avatar: avatar || registeredUser?.avatar?.url || "",
      active: true,
    });

    await contact.save();

    res.status(201).json({
      message: "Contact created",
      contact: {
        id: registeredUser?._id?.toString() || contact._id.toString(),
        contactId: contact._id.toString(),
        firstName: registeredUser?.name || contact.firstName,
        lastName: registeredUser ? "" : contact.lastName,
        username: contact.username,
        mobile: registeredUser?.mobile || registeredUser?.email || contact.mobile,
        avatar: registeredUser?.avatar?.url || contact.avatar || "",
        active: contact.active,
        isOnline: registeredUser?.isOnline || false,
        lastSeen: registeredUser?.lastSeen,
        publicKey: registeredUser?.publicKey || "",
      },
    });
  } catch (error) {
    console.error("Create contact error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getContacts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const contacts = await NewContact.find({ ownerId: userId }).select(
      "firstName lastName username mobile email active contactUserId avatar"
    );

    const mappedContacts = await Promise.all(
      contacts.map(async (contact: any) => {
        let user = null;
        if (contact.contactUserId) {
          user = await User.findById(contact.contactUserId).select(
            "_id name mobile email avatar isOnline lastSeen publicKey"
          );
        }
        if (!user && (contact.mobile || contact.email)) {
          const searchIdentifier = contact.email || contact.mobile;
          user = await User.findOne({
            $or: [
              { mobile: searchIdentifier },
              { email: searchIdentifier },
              { email: searchIdentifier.toLowerCase() },
              ...(contact.mobile ? [{ mobile: contact.mobile }] : []),
            ],
          }).select("_id name mobile email avatar isOnline lastSeen publicKey");
        }

        return {
          id: user?._id?.toString() || contact._id.toString(),
          contactId: contact._id.toString(),
          firstName: user?.name || contact.firstName,
          lastName: user ? "" : contact.lastName,
          username: contact.username,
          mobile: user?.mobile || user?.email || contact.mobile,
          avatar: user?.avatar?.url || contact.avatar || "",
          active: contact.active,
          isOnline: user?.isOnline || false,
          lastSeen: user?.lastSeen,
          publicKey: user?.publicKey || "",
        };
      })
    );

    res.json({
      contacts: mappedContacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteContact = async (req: AuthRequest, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id || "").toString().trim();
    const userId = req.userId;

    if (!id) {
      return res.status(400).json({ error: "Contact id is required" });
    }

    let deleted = null;

    // 1. Try deleting directly by NewContact _id
    if (mongoose.isValidObjectId(id)) {
      deleted = await NewContact.findOneAndDelete({ _id: id, ownerId: userId });
    }

    // 2. If not found by NewContact._id, check if `id` is a User._id or contactUserId
    if (!deleted && mongoose.isValidObjectId(id)) {
      deleted = await NewContact.findOneAndDelete({
        ownerId: userId,
        contactUserId: id,
      });

      if (!deleted) {
        // Find user by id to check their mobile/email against NewContact
        const targetUser = await User.findById(id).select("_id mobile email");
        if (targetUser) {
          const conditions: any[] = [];
          if (targetUser.mobile) conditions.push({ mobile: targetUser.mobile });
          if (targetUser.email) {
            conditions.push({ mobile: targetUser.email });
            conditions.push({ mobile: targetUser.email.toLowerCase() });
            conditions.push({ email: targetUser.email });
            conditions.push({ email: targetUser.email.toLowerCase() });
          }
          if (conditions.length > 0) {
            deleted = await NewContact.findOneAndDelete({
              ownerId: userId,
              $or: conditions,
            });
          }
        }
      }
    }

    // 3. Fallback: match by mobile or email string
    if (!deleted) {
      deleted = await NewContact.findOneAndDelete({
        ownerId: userId,
        $or: [
          { mobile: id },
          { mobile: id.toLowerCase() },
          { email: id.toLowerCase() },
        ],
      });
    }

    // 4. Also clean up message history between this user and the deleted contact
    if (mongoose.isValidObjectId(id)) {
      await MessageHistory.deleteMany({
        $or: [
          { senderId: userId, receiverId: id },
          { senderId: id, receiverId: userId },
        ],
      }).catch(() => {});
    }

    // Always succeed cleanly - whether removing a saved NewContact or an ad-hoc conversation
    return res.json({
      message: "Contact deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateContact = async (req: AuthRequest, res: Response) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id || "").toString().trim();
    const userId = req.userId;
    const { name, mobile, email, avatar } = req.body as {
      name?: string;
      mobile?: string;
      email?: string;
      avatar?: string;
    };

    if (!id) {
      return res.status(400).json({ error: "Contact id is required" });
    }

    const updateFields: any = {};
    if (typeof mobile === "string" && mobile.trim() !== "") updateFields.mobile = mobile.trim();
    if (typeof email === "string" && email.trim() !== "") updateFields.email = email.trim().toLowerCase();
    if (typeof name === "string" && name.trim() !== "") {
      const parts = name.trim().split(/\s+/);
      updateFields.firstName = parts[0] || "";
      updateFields.lastName = parts.slice(1).join(" ") || "";
      updateFields.username = name.replace(/\s+/g, "_").toLowerCase();
    }
    if (typeof avatar === "string") updateFields.avatar = avatar;

    let updated: any = null;

    // 1. Try updating by direct NewContact._id
    if (mongoose.isValidObjectId(id)) {
      updated = await NewContact.findOneAndUpdate(
        { _id: id, ownerId: userId },
        updateFields,
        { new: true }
      );
    }

    // 2. Try updating by contactUserId
    if (!updated && mongoose.isValidObjectId(id)) {
      updated = await NewContact.findOneAndUpdate(
        { contactUserId: id, ownerId: userId },
        updateFields,
        { new: true }
      );

      // Or by target user's mobile/email
      if (!updated) {
        const targetUser = await User.findById(id).select("_id mobile email");
        if (targetUser) {
          const conditions: any[] = [];
          if (targetUser.mobile) conditions.push({ mobile: targetUser.mobile });
          if (targetUser.email) {
            conditions.push({ mobile: targetUser.email });
            conditions.push({ mobile: targetUser.email.toLowerCase() });
            conditions.push({ email: targetUser.email });
            conditions.push({ email: targetUser.email.toLowerCase() });
          }
          if (conditions.length > 0) {
            updated = await NewContact.findOneAndUpdate(
              { ownerId: userId, $or: conditions },
              updateFields,
              { new: true }
            );
          }
        }
      }
    }

    // 3. Fallback: match by mobile or email
    if (!updated) {
      updated = await NewContact.findOneAndUpdate(
        {
          ownerId: userId,
          $or: [
            { mobile: id },
            { mobile: id.toLowerCase() },
            { email: id.toLowerCase() },
          ],
        },
        updateFields,
        { new: true }
      );
    }

    // 4. If contact record didn't exist yet in NewContact but id is a User._id, create it now!
    if (!updated && mongoose.isValidObjectId(id)) {
      const targetUser = await User.findById(id).select("_id name mobile email avatar");
      if (targetUser) {
        const displayName = (name || targetUser.name || "Contact").trim();
        const parts = displayName.split(/\s+/);
        updated = await NewContact.create({
          ownerId: userId,
          contactUserId: targetUser._id,
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
          username: displayName.replace(/\s+/g, "_").toLowerCase(),
          mobile: mobile || targetUser.mobile || targetUser.email || "",
          email: email || targetUser.email || "",
          avatar: avatar || targetUser.avatar?.url || "",
          active: true,
          ...updateFields,
        });
      }
    }

    if (!updated) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json({
      message: "Contact updated",
      contact: {
        id: updated.contactUserId?.toString() || updated._id.toString(),
        contactId: updated._id.toString(),
        firstName: updated.firstName,
        lastName: updated.lastName,
        username: updated.username,
        mobile: updated.mobile,
        email: updated.email,
        active: updated.active,
      },
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
