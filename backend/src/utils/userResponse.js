function formatUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    balance: user.balance ?? 0,
    bonus: user.bonus ?? 0,
    spent: user.spent ?? 0,
    verified: Boolean(user.verified),
    status: user.status,
    vipTier: user.vipTier ?? 0,
    ordersCount: user.ordersCount ?? 0,
    completedOrders: user.completedOrders ?? 0,
    pendingOrders: user.pendingOrders ?? 0,
    phone: user.phone || "",
    avatar: user.avatar || "",
    createdAt: user.createdAt,
  };
}

module.exports = { formatUser };
