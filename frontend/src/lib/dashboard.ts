export async function getDashboard() {
  return {
    balance: 4320,

    stats: {
      orders: 120,
      users: 85,
      success: 99,
      growth: 12,
    },

    activity: [
      "New order completed",
      "Balance updated",
      "System synced",
      "New signup",
    ],

    liveOrders: [
      "Instagram Followers",
      "TikTok Likes",
      "Telegram Members",
    ],
  };
}