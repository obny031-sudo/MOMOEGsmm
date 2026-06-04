const mongoose = require("mongoose");

const providerLogSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "test",
        "balance",
        "services",
        "order",
        "status",
        "sync",
        "failover",
        "error",
      ],
      required: true,
    },
    success: { type: Boolean, default: false },
    request: { type: mongoose.Schema.Types.Mixed, default: {} },
    response: { type: mongoose.Schema.Types.Mixed, default: {} },
    durationMs: { type: Number, default: 0 },
    error: { type: String, default: "" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProviderLog", providerLogSchema);
