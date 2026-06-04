const ProviderLog = require("../models/ProviderLog");

const DEFAULT_TIMEOUT_MS = 15000;

function buildUrl(apiUrl) {
  const trimmed = String(apiUrl || "").trim();
  if (!trimmed) throw new Error("Provider API URL is not configured");
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

async function providerRequest(provider, action, extra = {}, options = {}) {
  const start = Date.now();
  const url = buildUrl(provider.apiUrl);
  const body = {
    key: provider.apiKey,
    action,
    ...extra,
  };

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs || DEFAULT_TIMEOUT_MS
  );

  let responseData = null;
  let success = false;
  let error = "";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    try {
      responseData = JSON.parse(text);
    } catch {
      responseData = { raw: text };
    }

    if (!res.ok) {
      error = responseData?.error || responseData?.message || `HTTP ${res.status}`;
    } else if (responseData?.error) {
      error = String(responseData.error);
    } else {
      success = true;
    }
  } catch (err) {
    error = err.name === "AbortError" ? "Provider request timeout" : err.message;
  } finally {
    clearTimeout(timeout);
  }

  const durationMs = Date.now() - start;

  if (options.log !== false) {
    await ProviderLog.create({
      provider: provider._id,
      action: options.logAction || action,
      success,
      request: { action, ...extra },
      response: responseData,
      durationMs,
      error,
      order: options.orderId || null,
    }).catch(() => {});
  }

  if (!success) {
    const e = new Error(error || "Provider request failed");
    e.response = responseData;
    e.durationMs = durationMs;
    throw e;
  }

  return { data: responseData, durationMs };
}

function parseBalance(data) {
  if (typeof data?.balance === "number") return data.balance;
  if (typeof data?.balance === "string") return parseFloat(data.balance) || 0;
  return 0;
}

function mapProviderStatus(status) {
  const s = String(status || "").toLowerCase();
  if (["completed", "complete", "success"].includes(s)) return "Completed";
  if (["partial", "partially"].includes(s)) return "Partial";
  if (["processing", "in progress", "inprogress", "running"].includes(s))
    return "Processing";
  if (["pending", "awaiting"].includes(s)) return "Queued";
  if (["canceled", "cancelled"].includes(s)) return "Cancelled";
  if (["refunded", "refund"].includes(s)) return "Refunded";
  if (["failed", "error", "rejected"].includes(s)) return "Failed";
  return "Processing";
}

module.exports = {
  providerRequest,
  parseBalance,
  mapProviderStatus,
  DEFAULT_TIMEOUT_MS,
};
