// const express = require("express");
// const rateLimit = require("express-rate-limit");

// const {
//   login,
//   changePassword,
// } = require("../controllers/authController");

// const router = express.Router();
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 5,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Too many login attempts. Please try again later.",
//   },
// });

// router.post("/login", loginLimiter, login);

// router.put(
//   "/change-password",
//   changePassword
// );

// module.exports = router;

const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  login,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many login attempts. Please try again later.",
  },
});

/*
 * Login
 *
 * Rate limited to reduce brute-force attempts.
 */
router.post(
  "/login",
  loginLimiter,
  login
);

/*
 * Local development password change.
 *
 * This route requires an authenticated user.
 * The controller also disables it automatically
 * when AUTH_MODE=ldap.
 */
router.put(
  "/change-password",
  protect,
  changePassword
);

module.exports = router;