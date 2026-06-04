const mongoose = require("mongoose");

const timelineEntrySchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    message: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const providerResponseSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.Mixed, default: {} },
    response: { type: mongoose.Schema.Types.Mixed, default: {} },
    success: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ORDER_STATUSES = [
  "Pending",
  "Queued",
  "Sent",
  "Processing",
  "Running",
  "Completed",
  "Failed",
  "Refunded",
  "Cancelled",
  "Partial",
];

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceId: { type: Number, required: true },
    serviceName: { type: String, required: true },
    category: { type: String, default: "" },
    link: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerThousand: { type: Number, required: true, min: 0 },
    totalCharge: { type: Number, required: true, min: 0 },
    providerCost: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Queued",
      index: true,
    },
    queueStatus: {
      type: String,
      enum: ["idle", "queued", "processing", "failed", "dead"],
      default: "queued",
      index: true,
    },
    amount: { type: Number, default: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      default: null,
    },
    backupProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      default: null,
    },
    providerOrderId: { type: String, default: "", index: true },
    providerServiceId: { type: String, default: "" },
    startCount: { type: Number, default: 0 },
    currentCount: { type: Number, default: 0 },
    remains: { type: Number, default: 0 },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    healthScore: { type: Number, default: 100 },
    sourceIp: { type: String, default: "" },
    timeline: [timelineEntrySchema],
    providerResponses: [providerResponseSchema],
    lastError: { type: String, default: "" },
    completedAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.statics.ORDER_STATUSES = ORDER_STATUSES;

module.exports = mongoose.model("Order", orderSchema);
