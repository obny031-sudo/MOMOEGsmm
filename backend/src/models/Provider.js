const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    apiUrl: { type: String, default: "" },
    apiKey: { type: String, default: "", select: false },
    apiSecret: { type: String, default: "", select: false },
    priority: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
    balance: { type: Number, default: 0 },
    healthScore: { type: Number, default: 100, min: 0, max: 100 },
    onlineStatus: {
      type: String,
      enum: ["online", "offline", "unknown"],
      default: "unknown",
    },
    lastSyncAt: { type: Date, default: null },
    lastBalanceCheckAt: { type: Date, default: null },
    servicesCount: { type: Number, default: 0 },
    successRate: { type: Number, default: 100 },
    failureCount: { type: Number, default: 0 },
    avgResponseMs: { type: Number, default: 0 },
    circuitOpen: { type: Boolean, default: false },
    circuitOpenUntil: { type: Date, default: null },
    endpoints: {
      balance: { type: String, default: "" },
      services: { type: String, default: "" },
      order: { type: String, default: "" },
      status: { type: String, default: "" },
    },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Provider", providerSchema);
