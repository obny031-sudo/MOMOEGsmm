const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getProfile, updatePreferences } = require("../controllers/profileController");
const {
  getSessions,
  getLoginHistory,
  requestPasswordOtp,
  confirmPasswordChange,
  requestEmailOtp,
  confirmEmailChange,
  revokeSession,
  revokeOtherSessions,
  getActivity,
} = require("../controllers/profileSecurityController");

router.get("/", protect, getProfile);
router.patch("/preferences", protect, updatePreferences);
router.get("/activity", protect, getActivity);
router.get("/security/sessions", protect, getSessions);
router.get("/security/login-history", protect, getLoginHistory);
router.post("/security/password/request-otp", protect, requestPasswordOtp);
router.post("/security/password/confirm", protect, confirmPasswordChange);
router.post("/security/email/request-otp", protect, requestEmailOtp);
router.post("/security/email/confirm", protect, confirmEmailChange);
router.delete("/security/sessions/others", protect, revokeOtherSessions);
router.delete("/security/sessions/:id", protect, revokeSession);

module.exports = router;
