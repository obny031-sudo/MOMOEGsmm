const mongoose = require("mongoose");

const deadLetterJobSchema = new mongoose.Schema(
  {
    jobType: {
      type: String,
      enum: ["order_submit", "order_status", "provider_sync"],
      required: true,
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      default: null,
    },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    reason: { type: String, default: "" },
    retries: { type: Number, default: 0 },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeadLetterJob", deadLetterJobSchema);
