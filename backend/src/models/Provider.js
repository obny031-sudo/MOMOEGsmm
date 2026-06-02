const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    apiUrl: { type: String, default: "" },
    apiKey: { type: String, default: "", select: false },
    priority: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Provider", providerSchema);
