const mongoose = require("mongoose");

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
    link: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerThousand: { type: Number, required: true, min: 0 },
    totalCharge: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Running", "Completed", "Cancelled"],
      default: "Pending",
    },
    amount: { type: Number, default: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
