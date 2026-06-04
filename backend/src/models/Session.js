const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenId: { type: String, required: true, unique: true },
    device: { type: String, default: "Unknown device" },
    browser: { type: String, default: "" },
    ip: { type: String, default: "" },
    lastActivity: { type: Date, default: Date.now },
    current: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
