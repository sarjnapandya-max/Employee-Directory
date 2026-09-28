const express = require("express");

const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const { protect } = require("../middleware/authMiddleware");
const { superAdminOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

// Public routes
router.get("/", getEmployees);
router.get("/:id", getEmployeeById);

// SUPER_ADMIN only

router.post("/", protect, superAdminOnly, createEmployee);

router.put("/:id", protect, superAdminOnly, updateEmployee);

router.delete("/:id", protect, superAdminOnly, deleteEmployee);

module.exports = router;