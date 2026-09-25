const Employee = require("../models/Employee");

const getAdminStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();

    const departments = await Employee.distinct("department");
    const companies = await Employee.distinct("company");

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments: departments.length,
        totalCompanies: companies.length,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch admin statistics",
    });
  }
};

module.exports = {
  getAdminStats,
};