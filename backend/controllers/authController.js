const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

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

    const user = await User.findOne({ username });

    if (!user) {
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

    res.status(200).json({
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

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const {
      username,
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // Validate required fields
    if (
      !username ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Username and all password fields are required",
      });
    }

    // Check new password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // Prevent using the same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    // Find user by username
    const user = await User.findOne({
      username: username.trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(
      newPassword,
      10
    );

    // Save new password
    user.passwordHash = newPasswordHash;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

module.exports = {
  login,
  changePassword,
};