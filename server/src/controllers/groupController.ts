import { Request, Response } from "express";
import Group from "../models/Group";
import User from "../models/User";
import NewContact from "../models/newContact";

const resolveUserId = async (id: string) => {
  const user = await User.findById(id).select("_id mobile");
  if (user) return user._id.toString();

  const contact = await NewContact.findById(id).select("mobile");
  if (!contact) return null;

  const contactUser = await User.findOne({ mobile: contact.mobile }).select("_id");
  return contactUser ? contactUser._id.toString() : null;
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, description, members } = req.body;

    if (!name || !members || !Array.isArray(members)) {
      return res.status(400).json({ error: "Group name and members array are required." });
    }

    const resolvedMembers: string[] = [];
    for (const memberId of members) {
      const resolved = await resolveUserId(memberId);
      if (!resolved) {
        return res.status(400).json({ error: `Cannot resolve contact ${memberId} to a registered user.` });
      }
      resolvedMembers.push(resolved);
    }

    // Ensure the creator is in the members list
    const allMembers = Array.from(new Set([...resolvedMembers, userId]));

    const group = await Group.create({
      name,
      description: description || "",
      admins: [userId],
      members: allMembers,
      createdBy: userId,
    });

    res.status(201).json({ group });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const groups = await Group.find({ members: userId }).sort({ updatedAt: -1 });
    res.json({ groups });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { groupId } = req.params;
    const { name, description } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Only admins can update group info
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ error: "Only admins can update group details." });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;

    await group.save();
    res.json({ group });
  } catch (error) {
    console.error("Update group error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

