import { Request, Response } from "express";
import NewContact from "../models/newContact";
import User from "../models/User";

export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, mobile, avatar } = req.body;

    if (!mobile) {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    // split name into first and last
    const parts = (name || "").trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    // create a username fallback from name or mobile
    const username = (name || mobile).toString().replace(/\s+/g, "_").toLowerCase();

    const contact = new NewContact({
      firstName,
      lastName,
      username,
      mobile,
      active: true,
    });

    await contact.save();
    const registeredUser = await User.findOne({ mobile }).select(
      "_id name mobile avatar isOnline lastSeen",
    );

    res.status(201).json({
      message: "Contact created",
      contact: {
        id: registeredUser?._id || contact._id,
        firstName: registeredUser?.name || contact.firstName,
        lastName: registeredUser ? "" : contact.lastName,
        username: contact.username,
        mobile: registeredUser?.mobile || contact.mobile,
        avatar: registeredUser?.avatar?.url || contact.avatar || "",
        active: contact.active,
        isOnline: registeredUser?.isOnline || false,
        lastSeen: registeredUser?.lastSeen,
      },
    });
  } catch (error) {
    console.error("Create contact error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await NewContact.find().select("firstName lastName username mobile active");
    const mappedContacts = await Promise.all(
      contacts.map(async (contact) => {
        const user = await User.findOne({ mobile: contact.mobile }).select(
          "_id name mobile avatar isOnline lastSeen",
        );

        return {
          id: user?._id || contact._id,
          firstName: user?.name || contact.firstName,
          lastName: user ? "" : contact.lastName,
          username: contact.username,
          mobile: user?.mobile || contact.mobile,
          avatar: user?.avatar?.url || contact.avatar || "",
          active: contact.active,
          isOnline: user?.isOnline || false,
          lastSeen: user?.lastSeen,
        };
      }),
    );

    res.json({
      contacts: mappedContacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Contact id is required" });
    }

    const result = await NewContact.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json({ message: "Contact deleted", id });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, mobile, avatar } = req.body as { name?: string; mobile?: string; avatar?: string };

    if (!id) {
      return res.status(400).json({ error: "Contact id is required" });
    }

    const updateFields: any = {};
    if (typeof mobile === "string" && mobile.trim() !== "") updateFields.mobile = mobile;
    if (typeof name === "string" && name.trim() !== "") {
      const parts = name.trim().split(/\s+/);
      updateFields.firstName = parts[0] || "";
      updateFields.lastName = parts.slice(1).join(" ") || "";
      updateFields.username = name.replace(/\s+/g, "_").toLowerCase();
    }
    if (typeof avatar === "string") updateFields.avatar = avatar;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updated = await NewContact.findByIdAndUpdate(id, updateFields, { new: true }).select(
      "firstName lastName username mobile active"
    );

    if (!updated) return res.status(404).json({ error: "Contact not found" });

    res.json({
      message: "Contact updated",
      contact: {
        id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        username: updated.username,
        mobile: updated.mobile,
        active: updated.active,
      },
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
