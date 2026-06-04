const Category = require("../models/Category");
const { logAudit } = require("../utils/audit");

exports.listCategories = async (req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, categories });
};

exports.createCategory = async (req, res) => {
  const slug =
    req.body.slug ||
    String(req.body.name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  const category = await Category.create({ ...req.body, slug });
  await logAudit(req, {
    action: "category.create",
    resource: "category",
    resourceId: category._id,
  });
  res.status(201).json({ success: true, category });
};

exports.updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!category) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  await logAudit(req, {
    action: "category.update",
    resource: "category",
    resourceId: category._id,
  });
  res.json({ success: true, category });
};

exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  await logAudit(req, {
    action: "category.delete",
    resource: "category",
    resourceId: req.params.id,
  });
  res.json({ success: true });
};
