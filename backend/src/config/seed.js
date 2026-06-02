const Service = require("../models/Service");

const DEFAULT_SERVICES = [
  {
    serviceId: 1,
    category: "Instagram",
    title: "Instagram Followers",
    price: 10,
    min: 100,
    max: 100000,
    speed: "Fast",
    featured: true,
  },
  {
    serviceId: 2,
    category: "Instagram",
    title: "Instagram Likes",
    price: 6,
    min: 100,
    max: 50000,
    speed: "Fast",
  },
  {
    serviceId: 3,
    category: "TikTok",
    title: "TikTok Likes",
    price: 8,
    min: 100,
    max: 100000,
    speed: "Medium",
  },
  {
    serviceId: 4,
    category: "YouTube",
    title: "YouTube Views",
    price: 12,
    min: 500,
    max: 500000,
    speed: "Medium",
  },
  {
    serviceId: 5,
    category: "Telegram",
    title: "Telegram Members",
    price: 9,
    min: 100,
    max: 50000,
    speed: "Fast",
  },
];

async function seedServices() {
  const count = await Service.countDocuments();
  if (count > 0) return;
  await Service.insertMany(DEFAULT_SERVICES);
  console.log("Seeded default services");
}

module.exports = { seedServices };
