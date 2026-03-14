const ActivityLog = require("../../models/ActivityLog");
const {
  getActivityLogsPaginated,
  getActivityLogSummary,
} = require("../../services/activityLog.service");

const listActivityLogs = async (req, res) => {
  try {
    const {
      page,
      limit,
      actorType,
      action,
      entityType,
      status,
      search,
    } = req.query;

    const result = await getActivityLogsPaginated(
      {
        actorType,
        action,
        entityType,
        status,
        search,
      },
      {
        page,
        limit,
      }
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getActivityLogSummaryController = async (req, res) => {
  try {
    const summary = await getActivityLogSummary();
    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getActivityLogById = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.logId);

    if (!log) {
      return res.status(404).json({ message: "Activity log not found." });
    }

    return res.status(200).json({ log });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  listActivityLogs,
  getActivityLogSummaryController,
  getActivityLogById,
};
