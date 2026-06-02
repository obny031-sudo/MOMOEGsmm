const Transaction = require("../models/Transaction");

async function recordTransaction({
  userId,
  type,
  amount,
  balanceBefore,
  balanceAfter,
  description,
  referenceId,
  metadata,
}) {
  return Transaction.create({
    user: userId,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    description,
    referenceId,
    metadata,
  });
}

module.exports = { recordTransaction };
