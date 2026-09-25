const Employee = require("../models/Employee");

// GET /api/employees
const getEmployees = async (req, res) => {
  try {
    const {
      search,
      sortBy = "employeeName",
      sortOrder = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    let filter = {};

    // Search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      filter = {
        $or: [
          { employeeName: searchRegex },
          { designation: searchRegex },
          { department: searchRegex },
          { company: searchRegex },
          { extension: searchRegex },
          { mobileNo: searchRegex },
        ],
      };
    }

    // Allowed sorting fields
    const allowedSortFields = [
      "employeeName",
      "designation",
      "department",
      "company",
      "extension",
      "mobileNo",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "employeeName";

    const safeSortOrder = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const currentPage = Math.max(Number(page) || 1, 1);
    const itemsPerPage = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const skip = (currentPage - 1) * itemsPerPage;

    // Total matching employees
    const totalEmployees = await Employee.countDocuments(filter);

    // Fetch current page
    const employees = await Employee.find(filter)
      .sort({
        [safeSortBy]: safeSortOrder,
      })
      .skip(skip)
      .limit(itemsPerPage);

    const totalPages = Math.ceil(
      totalEmployees / itemsPerPage
    );

    res.status(200).json({
      success: true,
      count: employees.length,
      page: currentPage,
      limit: itemsPerPage,
      totalPages,
      totalEmployees,
      data: employees,
    });
  } catch (error) {
    console.error("Get employees error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
};

// GET /api/employees/:id
const mongoose = require("mongoose");

const getEmployeeById = async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get employee error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
    });
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const {
      employeeName,
      designation,
      department,
      company,
      extension,
      mobileNo,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      employeeName,
      designation,
      department,
      company,
      extension,
      mobileNo,
    };
    if (!/^\d{10}$/.test(String(mobileNo).trim())) {
  return res.status(400).json({
    success: false,
    message: "Mobile number must contain exactly 10 digits.",
  });
}

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || String(value).trim() === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All employee fields are required.",
        missingFields,
      });
    }

    // Validate MongoDB ObjectId
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid employee ID",
  });
}

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Update employee data
    employee.employeeName = String(employeeName).trim();
    employee.designation = String(designation).trim();
    employee.department = String(department).trim();
    employee.company = String(company).trim();
    employee.extension = String(extension).trim();
    employee.mobileNo = String(mobileNo).trim();

    const updatedEmployee = await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Update employee error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update employee",
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Employee deleted permanently",
    });
  } catch (error) {
    console.error("Delete employee error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete employee",
    });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};