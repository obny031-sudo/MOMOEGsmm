const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    serviceId: { type: Number, required: true, unique: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: "" },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0, min: 0 },
    sellingPrice: { type: Number, default: 0, min: 0 },
    profitMargin: { type: Number, default: 0 },
    profitPercent: { type: Number, default: 0 },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    speed: { type: String, default: "Fast" },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      default: null,
      index: true,
    },
    backupProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      default: null,
    },
    providerServiceId: { type: String, default: "" },
    syncStatus: {
      type: String,
      enum: ["manual", "synced", "pending", "error"],
      default: "manual",
    },
    lastSyncAt: { type: Date, default: null },
    orderCount: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    healthScore: { type: Number, default: 100, min: 0, max: 100 },
  },
  { timestamps: true }
);

serviceSchema.pre("save", function syncSellingPrice(next) {
  if (!this.sellingPrice || this.sellingPrice <= 0) {
    this.sellingPrice = this.price;
  }
  if (this.costPrice > 0 && this.sellingPrice > 0) {
    this.profitMargin = Number((this.sellingPrice - this.costPrice).toFixed(4));
    this.profitPercent = Number(
      ((this.profitMargin / this.sellingPrice) * 100).toFixed(2)
    );
  }
  next();
});

module.exports = mongoose.model("Service", serviceSchema);
