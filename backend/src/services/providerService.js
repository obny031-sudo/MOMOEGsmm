const Provider = require("../models/Provider");
const Service = require("../models/Service");
const {
  providerRequest,
  parseBalance,
} = require("./providerClient");
const { logAudit } = require("../utils/audit");

function isCircuitOpen(provider) {
  if (!provider.circuitOpen) return false;
  if (provider.circuitOpenUntil && provider.circuitOpenUntil < new Date()) {
    return false;
  }
  return true;
}

async function loadProvider(id, withKey = true) {
  const q = Provider.findOne({ _id: id, deletedAt: null });
  if (withKey) q.select("+apiKey +apiSecret");
  const provider = await q;
  if (!provider) throw new Error("Provider not found");
  if (!provider.active) throw new Error("Provider is disabled");
  if (isCircuitOpen(provider)) throw new Error("Provider circuit breaker is open");
  return provider;
}

async function recordProviderResult(provider, success, durationMs) {
  const total = (provider.successRate ?? 100) / 100;
  const weight = 0.9;
  provider.successRate = success
    ? Math.min(100, provider.successRate * weight + 100 * (1 - weight))
    : Math.max(0, provider.successRate * weight);
  provider.avgResponseMs = Math.round(
    (provider.avgResponseMs || 0) * 0.7 + durationMs * 0.3
  );
  if (!success) {
    provider.failureCount = (provider.failureCount || 0) + 1;
    if (provider.failureCount >= 10) {
      provider.circuitOpen = true;
      provider.circuitOpenUntil = new Date(Date.now() + 15 * 60 * 1000);
      provider.onlineStatus = "offline";
    }
  } else {
    provider.onlineStatus = "online";
    provider.healthScore = Math.min(
      100,
      Math.round(provider.successRate * 0.6 + (100 - Math.min(provider.avgResponseMs / 50, 100)) * 0.4)
    );
  }
  await provider.save();
}

exports.testConnection = async (providerId) => {
  const provider = await loadProvider(providerId);
  const { durationMs } = await providerRequest(provider, "balance", {}, {
    logAction: "test",
  });
  await recordProviderResult(provider, true, durationMs);
  provider.lastBalanceCheckAt = new Date();
  await provider.save();
  return { ok: true, durationMs };
};

exports.syncBalance = async (providerId) => {
  const provider = await loadProvider(providerId);
  const { data, durationMs } = await providerRequest(provider, "balance");
  provider.balance = parseBalance(data);
  provider.lastBalanceCheckAt = new Date();
  provider.lastSyncAt = new Date();
  await recordProviderResult(provider, true, durationMs);
  await provider.save();
  return { balance: provider.balance, healthScore: provider.healthScore };
};

exports.syncServices = async (providerId, req = null) => {
  const provider = await loadProvider(providerId);
  const { data, durationMs } = await providerRequest(provider, "services", {}, {
    logAction: "sync",
  });

  const list = Array.isArray(data) ? data : data?.services || [];
  let imported = 0;
  let updated = 0;

  for (const item of list) {
    const providerServiceId = String(item.service ?? item.id ?? "");
    if (!providerServiceId) continue;

    const costRate = parseFloat(item.rate ?? item.price ?? 0) || 0;
    const name = String(item.name ?? item.title ?? `Service ${providerServiceId}`);
    const min = parseInt(item.min ?? 100, 10);
    const max = parseInt(item.max ?? 100000, 10);
    const category = String(item.category ?? provider.name ?? "Imported");

    let service = await Service.findOne({
      provider: provider._id,
      providerServiceId,
    });

    const marginPercent =
      Number(provider.config?.defaultMarginPercent) || 20;
    const sellingPrice = Number((costRate * (1 + marginPercent / 100)).toFixed(4));

    if (service) {
      service.costPrice = costRate;
      service.price = sellingPrice;
      service.sellingPrice = sellingPrice;
      service.min = min;
      service.max = max;
      service.title = name;
      service.category = category;
      service.syncStatus = "synced";
      service.lastSyncAt = new Date();
      await service.save();
      updated += 1;
    } else {
      const last = await Service.findOne().sort({ serviceId: -1 });
      const nextId = (last?.serviceId ?? 0) + 1;
      await Service.create({
        serviceId: nextId,
        title: name,
        category,
        price: sellingPrice,
        costPrice: costRate,
        sellingPrice,
        min,
        max,
        provider: provider._id,
        providerServiceId,
        syncStatus: "synced",
        lastSyncAt: new Date(),
        active: true,
      });
      imported += 1;
    }
  }

  provider.servicesCount = await Service.countDocuments({
    provider: provider._id,
    active: true,
  });
  provider.lastSyncAt = new Date();
  await recordProviderResult(provider, true, durationMs);
  await provider.save();

  if (req) {
    await logAudit(req, {
      action: "provider.sync_services",
      resource: "provider",
      resourceId: provider._id,
      metadata: { imported, updated },
    });
  }

  return { imported, updated, total: list.length, servicesCount: provider.servicesCount };
};

exports.getProviderStats = async (providerId) => {
  const provider = await Provider.findById(providerId).select("-apiKey -apiSecret");
  if (!provider) throw new Error("Provider not found");

  const ProviderLog = require("../models/ProviderLog");
  const recentFailures = await ProviderLog.countDocuments({
    provider: providerId,
    success: false,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  return {
    provider,
    recentFailures,
  };
};

exports.loadProvider = loadProvider;
exports.isCircuitOpen = isCircuitOpen;
exports.recordProviderResult = recordProviderResult;
