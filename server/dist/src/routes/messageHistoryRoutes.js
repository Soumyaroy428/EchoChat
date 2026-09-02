"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageHistoryController_1 = require("../controllers/messageHistoryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/:contactId", auth_1.authenticate, messageHistoryController_1.getMessageHistory);
router.post("/", auth_1.authenticate, messageHistoryController_1.sendMessage);
exports.default = router;
//# sourceMappingURL=messageHistoryRoutes.js.map