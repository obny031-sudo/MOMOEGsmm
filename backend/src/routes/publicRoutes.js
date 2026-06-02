const express = require("express");
const router = express.Router();
const {
  getPublicSettings,
  getAnnouncements,
} = require("../controllers/publicController");

router.get("/settings", getPublicSettings);
router.get("/announcements", getAnnouncements);

module.exports = router;
