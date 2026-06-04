const TRANSITIONS = {
  Pending: ["Queued", "Cancelled", "Failed"],
  Queued: ["Sent", "Processing", "Failed", "Cancelled"],
  Sent: ["Processing", "Failed", "Cancelled"],
  Processing: ["Completed", "Partial", "Failed", "Cancelled"],
  Running: ["Completed", "Partial", "Failed", "Cancelled"],
  Completed: ["Refunded"],
  Partial: ["Refunded", "Completed"],
  Failed: ["Queued", "Refunded", "Cancelled"],
  Refunded: [],
  Cancelled: [],
};

function canTransition(from, to) {
  const allowed = TRANSITIONS[from] || [];
  return allowed.includes(to) || from === to;
}

function normalizeStatus(status) {
  if (status === "Running") return "Processing";
  if (status === "Pending") return "Queued";
  return status;
}

module.exports = { canTransition, normalizeStatus, TRANSITIONS };
