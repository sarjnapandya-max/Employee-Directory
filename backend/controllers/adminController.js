const Employee = require("../models/Employee");

const getAdminStats = async (req, res) => {
  try {
    // Get total employee count
    const totalEmployees = await Employee.countDocuments();

    // Get all employees
    const employees = await Employee.find({})
      .select(
        "employeeName designation department company extension mobileNo"
      )
      .sort({ employeeName: 1 })
      .lean();

    // Get department counts
    const departmentData = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          employeeCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // Get company counts
    const companyData = await Employee.aggregate([
      {
        $group: {
          _id: "$company",
          employeeCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,

      data: {
        // Existing dashboard statistics
        totalEmployees,
        totalDepartments: departmentData.length,
        totalCompanies: companyData.length,

        // Employee details
        employees,

        // Department details
        departments: departmentData.map((department) => ({
          name: department._id,
          employeeCount: department.employeeCount,
        })),

        // Company details
        companies: companyData.map((company) => ({
          name: company._id,
          employeeCount: company.employeeCount,
        })),
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