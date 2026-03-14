const express = require("express");
const authenticateAdmin = require("../middleware/adminAuthMiddleware");
const {
  listActivityLogs,
  getActivityLogSummaryController,
  getActivityLogById,
} = require("../controllers/adminLog.controller");

const router = express.Router();

router.use(authenticateAdmin);

router.get("/summary", getActivityLogSummaryController);
router.get("/", listActivityLogs);
router.get("/:logId", getActivityLogById);

module.exports = router;
