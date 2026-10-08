import { Request, Response } from "express";
import Group from "../models/Group";
import User from "../models/User";

export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, description, members } = req.body;

    if (!name || !members || !Array.isArray(members)) {
      return res.status(400).json({ error: "Group name and members array are required." });
    }

    // Ensure the creator is in the members list
    const allMembers = Array.from(new Set([...members, userId]));

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

