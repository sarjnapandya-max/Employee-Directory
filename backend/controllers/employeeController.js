const Employee = require("../models/Employee");
const mongoose = require("mongoose");

// Escape special characters when creating an exact-match regular expression.
const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Return only the details needed to identify an existing employee.
const getEmployeeDetails = (employee) => ({
  _id: employee._id,
  employeeName: employee.employeeName,
  designation: employee.designation,
  department: employee.department,
  company: employee.company,
  extension: employee.extension,
  mobileNo: employee.mobileNo,
  email: employee.email || "",
});

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
          { email: searchRegex },
        ],
      };
    }

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

    const currentPage = Math.max(Number(page) || 1, 1);
    const itemsPerPage = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const skip = (currentPage - 1) * itemsPerPage;

    const totalEmployees = await Employee.countDocuments(filter);

    const employees = await Employee.find(filter)
      .sort({ [safeSortBy]: safeSortOrder })
      .skip(skip)
      .limit(itemsPerPage);

    const totalPages = Math.ceil(
      totalEmployees / itemsPerPage
    );

    return res.status(200).json({
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

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get employee error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
    });
  }
};

// POST /api/employees
// POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const { employeeName, designation, department, company, extension, mobileNo, email, allowDuplicate } = req.body;
    const requiredFields = { employeeName, designation, department, company, extension, mobileNo };
    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || String(value).trim() === "")
      .map(([key]) => key);
    if (missingFields.length) {
      return res.status(400).json({ success: false, message: "All employee fields are required.", missingFields });
    }

    const normalized = {
      employeeName: String(employeeName).trim(),
      designation: String(designation).trim(),
      department: String(department).trim(),
      company: String(company).trim(),
      extension: String(extension).trim(),
      mobileNo: String(mobileNo).trim(),
      email: email == null ? "" : String(email).trim(),
    };
    if (!/^\d{10}$/.test(normalized.mobileNo)) {
      return res.status(400).json({ success: false, message: "Mobile number must contain exactly 10 digits." });
    }

    if (allowDuplicate !== true) {
      const checks = [
        { field: "Employee Name", key: "employeeName", query: { employeeName: { $regex: `^${escapeRegex(normalized.employeeName)}$`, $options: "i" } } },
        { field: "Extension", key: "extension", query: { extension: { $regex: `^${escapeRegex(normalized.extension)}$`, $options: "i" } } },
        { field: "Mobile No", key: "mobileNo", query: { mobileNo: normalized.mobileNo } },
        ...(normalized.email ? [{ field: "Email", key: "email", query: { email: { $regex: `^${escapeRegex(normalized.email)}$`, $options: "i" } } }] : []),
      ];
      const found = new Map();
      const duplicates = [];
      for (const check of checks) {
        const matches = await Employee.find(check.query).limit(100);
        for (const employee of matches) {
          found.set(String(employee._id), employee);
          duplicates.push({
            field: check.field,
            value: normalized[check.key],
            message: `${check.field} already exists.`,
            existingEmployee: getEmployeeDetails(employee),
          });
        }
      }
      if (duplicates.length) {
        return res.status(409).json({
          success: false,
          duplicateDetected: true,
          message: "Duplicate employee information detected.",
          duplicates,
          matchingEmployees: Array.from(found.values()).map(getEmployeeDetails),
        });
      }
    }

    const employee = await Employee.create(normalized);
    return res.status(201).json({
      success: true,
      message: allowDuplicate === true ? "Employee added successfully with duplicate information." : "Employee added successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Create employee error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to add employee" });
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const { employeeName, designation, department, company, extension, mobileNo, email } = req.body;
    const requiredFields = { employeeName, designation, department, company, extension, mobileNo };
    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || String(value).trim() === "")
      .map(([key]) => key);
    if (missingFields.length) {
      return res.status(400).json({ success: false, message: "All employee fields are required.", missingFields });
    }
    const normalized = {
      employeeName: String(employeeName).trim(),
      designation: String(designation).trim(),
      department: String(department).trim(),
      company: String(company).trim(),
      extension: String(extension).trim(),
      mobileNo: String(mobileNo).trim(),
      // An empty submitted email deliberately clears the previous email.
      email: email == null ? "" : String(email).trim(),
    };
    if (!/^\d{10}$/.test(normalized.mobileNo)) {
      return res.status(400).json({ success: false, message: "Mobile number must contain exactly 10 digits." });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid employee ID" });
    }
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    // Prevent replacing one record with values that collide with a DIFFERENT record.
    const conflicts = [];
    const checks = [
      { field: "Employee Name", query: { employeeName: { $regex: `^${escapeRegex(normalized.employeeName)}$`, $options: "i" } } },
      { field: "Extension", query: { extension: { $regex: `^${escapeRegex(normalized.extension)}$`, $options: "i" } } },
      { field: "Mobile No", query: { mobileNo: normalized.mobileNo } },
      ...(normalized.email ? [{ field: "Email", query: { email: { $regex: `^${escapeRegex(normalized.email)}$`, $options: "i" } } }] : []),
    ];
    for (const check of checks) {
      const otherMatches = await Employee.find({ ...check.query, _id: { $ne: employee._id } }).limit(20);
      if (otherMatches.length) {
        conflicts.push({ field: check.field, employees: otherMatches.map(getEmployeeDetails) });
      }
    }
    if (conflicts.length) {
      return res.status(409).json({
        success: false,
        duplicateDetected: true,
        message: "These details also match other employee records. Choose the correct existing employee or change the conflicting details.",
        conflicts,
      });
    }

    Object.assign(employee, normalized);
    const updatedEmployee = await employee.save();
    return res.status(200).json({ success: true, message: "Employee updated successfully", data: updatedEmployee });
  } catch (error) {
    console.error("Update employee error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update employee" });
  }
};

// DELETE /api/employees/:id
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

    return res.status(200).json({
      success: true,
      message: "Employee deleted permanently",
    });
  } catch (error) {
    console.error("Delete employee error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete employee",
    });
  }
};

// DELETE /api/employees/bulk-delete
const deleteMultipleEmployees = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one employee ID.",
      });
    }

    const invalidIds = ids.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more employee IDs are invalid.",
      });
    }

    const result = await Employee.deleteMany({
      _id: { $in: ids },
    });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} employee${
        result.deletedCount === 1 ? "" : "s"
      } deleted permanently.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(
      "Delete multiple employees error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete selected employees.",
    });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  deleteMultipleEmployees,
};
