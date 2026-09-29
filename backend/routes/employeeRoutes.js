const express = require("express");
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  deleteMultipleEmployees,
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

router.delete(
  "/bulk-delete",
  protect,
  superAdminOnly,
  deleteMultipleEmployees
);

router.delete("/:id", protect, superAdminOnly, deleteEmployee);

module.exports = router;