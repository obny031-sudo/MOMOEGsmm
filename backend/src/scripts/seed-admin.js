require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const { ensureDefaults } = require("../services/settingsService");

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Ahmed Zaki333";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "obny032@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@MOMOEG2026";

async function seedAdmin() {
  await connectDB();
  await ensureDefaults();

  const existing = await User.findOne({
    $or: [{ email: ADMIN_EMAIL.toLowerCase() }, { username: ADMIN_USERNAME }],
  });

  if (existing) {
    existing.role = "admin";
    existing.status = "active";
    if (ADMIN_PASSWORD) {
      existing.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    }
    await existing.save();
    console.log(`Admin updated: ${existing.email} (${existing.username})`);
  } else {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashed,
      role: "admin",
      status: "active",
      balance: 0,
      verified: true,
    });
    console.log(`Admin created: ${ADMIN_EMAIL}`);
  }

  console.log("Done. Login at /login then open /admin");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
