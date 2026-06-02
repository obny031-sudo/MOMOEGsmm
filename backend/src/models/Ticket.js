const mongoose = require("mongoose");

const ticketMessageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "admin"], required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Open", "Pending", "Closed"],
      default: "Open",
    },
    messages: [ticketMessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
