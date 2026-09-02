import { Router } from "express";
import { createContact, getContacts, deleteContact, updateContact } from "../controllers/contactController";

const router = Router();

// POST /api/contacts/   -> create a new contact
router.post("/", createContact);

// GET /api/contacts/    -> list contacts
router.get("/", getContacts);

// PUT /api/contacts/:id -> update contact
router.put("/:id", updateContact);

// DELETE /api/contacts/:id -> delete contact
router.delete("/:id", deleteContact);

export default router;
