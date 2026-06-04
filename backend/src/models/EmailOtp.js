const mongoose = require("mongoose");

const emailOtpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: { type: String, required: true },
    codeHash: { type: String, required: true, select: false },
    purpose: {
      type: String,
      enum: ["password_change", "email_change"],
      required: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailOtp", emailOtpSchema);
