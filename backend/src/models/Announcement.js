const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, default: "" },
    type: {
      type: String,
      enum: ["info", "offer", "maintenance", "update"],
      default: "info",
    },
    active: { type: Boolean, default: true },
    showOnDashboard: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
