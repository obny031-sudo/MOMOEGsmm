const Provider = require("../models/Provider");
const ProviderLog = require("../models/ProviderLog");
const Service = require("../models/Service");
const providerService = require("../services/providerService");
const { logAudit } = require("../utils/audit");

exports.getProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).select("-apiKey -apiSecret");
    if (!provider || provider.deletedAt) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    const stats = await providerService.getProviderStats(provider._id);
    const services = await Service.find({ provider: provider._id })
      .select("serviceId title costPrice price sellingPrice profitMargin active providerServiceId")
      .limit(100);
    res.json({ success: true, provider, stats, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    provider.deletedAt = new Date();
    provider.active = false;
    await provider.save();
    await logAudit(req, {
      action: "provider.delete",
      resource: "provider",
      resourceId: provider._id,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.testConnection = async (req, res) => {
  try {
    const result = await providerService.testConnection(req.params.id);
    await logAudit(req, {
      action: "provider.test",
      resource: "provider",
      resourceId: req.params.id,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.syncBalance = async (req, res) => {
  try {
    const result = await providerService.syncBalance(req.params.id);
    await logAudit(req, {
      action: "provider.sync_balance",
      resource: "provider",
      resourceId: req.params.id,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.syncServices = async (req, res) => {
  try {
    const result = await providerService.syncServices(req.params.id, req);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await ProviderLog.find({ provider: req.params.id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listProvidersDashboard = async (req, res) => {
  try {
    const providers = await Provider.find({ deletedAt: null })
      .select("-apiKey -apiSecret")
      .sort({ priority: 1, name: 1 });

    const enriched = await Promise.all(
      providers.map(async (p) => {
        const servicesCount = await Service.countDocuments({
          provider: p._id,
          active: true,
        });
        return {
          ...p.toObject(),
          servicesCount,
        };
      })
    );

    res.json({ success: true, providers: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
