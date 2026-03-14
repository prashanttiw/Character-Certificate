const mongoose = require("mongoose");

const IMMUTABLE_LOG_ERROR =
  "Activity logs are immutable and cannot be updated or deleted.";

const activityLogSchema = new mongoose.Schema(
  {
    actorType: {
      type: String,
      enum: ["student", "admin", "system"],
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    actorLabel: {
      type: String,
      default: null,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "failure", "info"],
      default: "success",
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    request: {
      method: { type: String, default: null },
      path: { type: String, default: null },
      ipAddress: { type: String, default: null },
      userAgent: { type: String, default: null },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    strict: true,
  }
);

const blockMutation = function mutationBlocked(next) {
  next(new Error(IMMUTABLE_LOG_ERROR));
};

[
  "updateOne",
  "updateMany",
  "findOneAndUpdate",
  "replaceOne",
  "deleteOne",
  "deleteMany",
  "findOneAndDelete",
  "findOneAndRemove",
].forEach((hookName) => {
  activityLogSchema.pre(hookName, blockMutation);
});

activityLogSchema.pre("save", function saveOnlyOnCreate(next) {
  if (!this.isNew) {
    return next(new Error(IMMUTABLE_LOG_ERROR));
  }

  return next();
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
