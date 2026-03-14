const ActivityLog = require("../models/ActivityLog");

const getIpAddress = (req) => {
  const forwardedFor = req?.headers?.["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req?.ip || req?.socket?.remoteAddress || null;
};

const sanitizeDetails = (details = {}) => {
  if (!details || typeof details !== "object") {
    return {};
  }

  return JSON.parse(JSON.stringify(details));
};

const createActivityLog = async ({
  actorType = "system",
  actorId = null,
  actorLabel = null,
  action,
  entityType,
  entityId = null,
  status = "success",
  details = {},
  req = null,
}) => {
  if (!action || !entityType) {
    throw new Error("Both action and entityType are required for activity logs.");
  }

  return ActivityLog.create({
    actorType,
    actorId,
    actorLabel,
    action,
    entityType,
    entityId,
    status,
    details: sanitizeDetails(details),
    request: {
      method: req?.method || null,
      path: req?.originalUrl || req?.url || null,
      ipAddress: getIpAddress(req),
      userAgent: req?.headers?.["user-agent"] || null,
    },
  });
};

const buildActivityLogQuery = (filters = {}) => {
  const {
    actorType,
    actorId,
    entityType,
    entityId,
    action,
    status,
    search,
  } = filters;

  const query = {};

  if (actorType) query.actorType = actorType;
  if (actorId) query.actorId = actorId;
  if (entityType) query.entityType = entityType;
  if (entityId) query.entityId = entityId;
  if (action) query.action = action;
  if (status) query.status = status;

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { action: regex },
      { actorLabel: regex },
      { entityType: regex },
      { status: regex },
    ];
  }

  return query;
};

const getActivityLogs = async (filters = {}, options = {}) => {
  const { limit = 100 } = options;
  const query = buildActivityLogQuery(filters);

  return ActivityLog.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit);
};

const getActivityLogsPaginated = async (filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 25,
  } = options;
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const query = buildActivityLogQuery(filters);

  const [items, totalItems] = await Promise.all([
    ActivityLog.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    ActivityLog.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages: Math.max(Math.ceil(totalItems / safeLimit), 1),
    },
  };
};

const getActivityLogSummary = async () => {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalLogs, last24HoursLogs, actorTypeBreakdown, statusBreakdown, topActions] =
    await Promise.all([
      ActivityLog.countDocuments({}),
      ActivityLog.countDocuments({ createdAt: { $gte: last24Hours } }),
      ActivityLog.aggregate([
        { $group: { _id: "$actorType", count: { $sum: 1 } } },
      ]),
      ActivityLog.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      ActivityLog.aggregate([
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 5 },
      ]),
    ]);

  return {
    totalLogs,
    last24HoursLogs,
    actorTypeBreakdown,
    statusBreakdown,
    topActions,
  };
};

module.exports = {
  createActivityLog,
  getActivityLogs,
  getActivityLogsPaginated,
  getActivityLogSummary,
};
