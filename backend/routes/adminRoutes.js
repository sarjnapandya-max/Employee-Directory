const express = require("express");

const { getAdminStats } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { superAdminOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/stats",
  protect,
  superAdminOnly,
  getAdminStats
);

module.exports = router;