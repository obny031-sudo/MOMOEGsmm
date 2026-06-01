export async function getProfile() {
  return {
    name: "MOMOEG User",
    username: "@momoeg",
    email: "user@momoeg.com",
    phone: "+20 100 000 0000",
    bio: "Elite platform member.",

    role: "Premium Client",
    verified: true,

    stats: {
      orders: 28,
      wallet: 850,
      activity: 92,
      trust: 98,
    },

    security: {
      password: true,
      twoFactor: true,
      deviceVerified: true,
    },
  };
}