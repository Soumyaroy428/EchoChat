"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contactController_1 = require("../controllers/contactController");
const router = (0, express_1.Router)();
// POST /api/contacts/   -> create a new contact
router.post("/", contactController_1.createContact);
// GET /api/contacts/    -> list contacts
router.get("/", contactController_1.getContacts);
// PUT /api/contacts/:id -> update contact
router.put("/:id", contactController_1.updateContact);
// DELETE /api/contacts/:id -> delete contact
router.delete("/:id", contactController_1.deleteContact);
exports.default = router;
//# sourceMappingURL=contactRoutes.js.map