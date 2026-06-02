const { ensureDefaults } = require("../services/settingsService");

async function seedSettings() {
  await ensureDefaults();
}

module.exports = { seedSettings };
