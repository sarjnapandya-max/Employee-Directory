const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const {
  authenticateWithLDAP,
} = require("../services/ldapService");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      !username ||
      !password ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const cleanUsername = username.trim();

    const authMode = (
      process.env.AUTH_MODE || "local"
    ).toLowerCase();

    /*
     * ==========================================
     * LDAP AUTHENTICATION
     * ==========================================
     *
     * Used when GSPL IT enables LDAP.
     */
    if (authMode === "ldap") {
      const ldapResult = await authenticateWithLDAP(
        cleanUsername,
        password
      );

      if (!ldapResult.success) {
        if (
          ldapResult.code === "LDAP_CONFIGURATION_ERROR"
        ) {
          console.error(
            "LDAP configuration error:",
            ldapResult.message
          );

          return res.status(500).json({
            success: false,
            message:
              "LDAP authentication is not configured.",
          });
        }

        return res.status(401).json({
          success: false,
          message:
            ldapResult.message ||
            "Invalid username or password",
        });
      }

      /*
       * LDAP verifies the user's credentials.
       *
       * MongoDB is still used to determine whether
       * that authenticated user has SUPER_ADMIN access.
       */
      const user = await User.findOne({
        username: cleanUsername,
      });

      if (!user) {
        return res.status(403).json({
          success: false,
          message:
            "You are authenticated but not authorized for admin access.",
        });
      }

      if (user.role !== "SUPER_ADMIN") {
        return res.status(403).json({
          success: false,
          message: "SUPER_ADMIN access required",
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
        },
      });
    }

    /*
     * ==========================================
     * LOCAL AUTHENTICATION
     * ==========================================
     *
     * Used only when AUTH_MODE=local.
     */
    if (authMode !== "local") {
      return res.status(500).json({
        success: false,
        message: "Unsupported authentication mode",
      });
    }

    const user = await User.findOne({
      username: cleanUsername,
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/*
 * ==========================================
 * LOCAL PASSWORD CHANGE
 * ==========================================
 *
 * This endpoint exists only for local development.
 *
 * When LDAP is enabled, password management belongs
 * to GSPL LDAP / Active Directory and this endpoint
 * is disabled.
 */
const changePassword = async (req, res) => {
  try {
    const authMode = (
      process.env.AUTH_MODE || "local"
    ).toLowerCase();

    if (authMode !== "local") {
      return res.status(403).json({
        success: false,
        message:
          "Password changes are not available when LDAP authentication is enabled.",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (typeof currentPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Current password must be a string",
      });
    }

    if (typeof newPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "New password must be a string",
      });
    }

    if (typeof confirmPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Confirm password must be a string",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    /*
     * The username comes from the verified JWT.
     * We do not trust a username supplied by the client.
     */
    const user = await User.findOne({
      username: req.user.username,
    });

    if (!user || !user.passwordHash) {
      return res.status(404).json({
        success: false,
        message: "Local user account not found",
      });
    }

    const isCurrentPasswordValid =
      await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const newPasswordHash = await bcrypt.hash(
      newPassword,
      10
    );

    user.passwordHash = newPasswordHash;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

module.exports = {
  login,
  changePassword,
};