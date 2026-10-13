// const Employee = require("../models/Employee");

// // GET /api/employees
// const getEmployees = async (req, res) => {
//   try {
//     const {
//       search,
//       sortBy = "employeeName",
//       sortOrder = "asc",
//       page = 1,
//       limit = 10,
//     } = req.query;

//     let filter = {};

//     // Search
//     if (search && search.trim()) {
//       const searchRegex = new RegExp(search.trim(), "i");

//       filter = {
//         $or: [
//           { employeeName: searchRegex },
//           { designation: searchRegex },
//           { department: searchRegex },
//           { company: searchRegex },
//           { extension: searchRegex },
//           { mobileNo: searchRegex },
//           { email: searchRegex },
//         ],
//       };
//     }

//     // Allowed sorting fields
//     const allowedSortFields = [
//       "employeeName",
//       "designation",
//       "department",
//       "company",
//       "extension",
//       "mobileNo",
//     ];

//     const safeSortBy = allowedSortFields.includes(sortBy)
//       ? sortBy
//       : "employeeName";

//     const safeSortOrder = sortOrder === "desc" ? -1 : 1;

//     // Pagination
//     const currentPage = Math.max(Number(page) || 1, 1);
//     const itemsPerPage = Math.min(
//       Math.max(Number(limit) || 10, 1),
//       100
//     );

//     const skip = (currentPage - 1) * itemsPerPage;

//     // Total matching employees
//     const totalEmployees = await Employee.countDocuments(filter);

//     // Fetch current page
//     const employees = await Employee.find(filter)
//       .sort({
//         [safeSortBy]: safeSortOrder,
//       })
//       .skip(skip)
//       .limit(itemsPerPage);

//     const totalPages = Math.ceil(
//       totalEmployees / itemsPerPage
//     );

//     res.status(200).json({
//       success: true,
//       count: employees.length,
//       page: currentPage,
//       limit: itemsPerPage,
//       totalPages,
//       totalEmployees,
//       data: employees,
//     });
//   } catch (error) {
//     console.error("Get employees error:", error.message);

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch employees",
//     });
//   }
// };

// // GET /api/employees/:id
// const mongoose = require("mongoose");

// const getEmployeeById = async (req, res) => {
//   try {
//     // Validate MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid employee ID",
//       });
//     }

//     const employee = await Employee.findById(req.params.id);

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: employee,
//     });
//   } catch (error) {
//     console.error("Get employee error:", error.message);

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch employee",
//     });
//   }
// };

// // PUT /api/employees/:id
// const updateEmployee = async (req, res) => {
//   try {
//    const {
//   employeeName,
//   designation,
//   department,
//   company,
//   extension,
//   mobileNo,
//   email,
// } = req.body;

//     // Validate required fields
//     const requiredFields = {
//       employeeName,
//       designation,
//       department,
//       company,
//       extension,
//       mobileNo,
//     };
//     if (!/^\d{10}$/.test(String(mobileNo).trim())) {
//   return res.status(400).json({
//     success: false,
//     message: "Mobile number must contain exactly 10 digits.",
//   });
// }

//     const missingFields = Object.entries(requiredFields)
//       .filter(([key, value]) => !value || String(value).trim() === "")
//       .map(([key]) => key);

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "All employee fields are required.",
//         missingFields,
//       });
//     }

//     // Validate MongoDB ObjectId
// if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//   return res.status(400).json({
//     success: false,
//     message: "Invalid employee ID",
//   });
// }

//     const employee = await Employee.findById(req.params.id);

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     // Update employee data
//     employee.employeeName = String(employeeName).trim();
//     employee.designation = String(designation).trim();
//     employee.department = String(department).trim();
//     employee.company = String(company).trim();
//     employee.extension = String(extension).trim();
//     employee.mobileNo = String(mobileNo).trim();
//     employee.email = email ? String(email).trim() : "";

//     const updatedEmployee = await employee.save();

//     res.status(200).json({
//       success: true,
//       message: "Employee updated successfully",
//       data: updatedEmployee,
//     });
//   } catch (error) {
//     console.error("Update employee error:", error.message);

//     res.status(500).json({
//       success: false,
//       message: "Failed to update employee",
//     });
//   }
// };

// const deleteEmployee = async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid employee ID",
//       });
//     }

//     const employee = await Employee.findById(req.params.id);

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     await Employee.findByIdAndDelete(req.params.id);

//     res.status(200).json({
//       success: true,
//       message: "Employee deleted permanently",
//     });
//   } catch (error) {
//     console.error("Delete employee error:", error.message);

//     res.status(500).json({
//       success: false,
//       message: "Failed to delete employee",
//     });
//   }
// };

// // DELETE /api/employees/bulk-delete
// const deleteMultipleEmployees = async (req, res) => {
//   try {
//     const { ids } = req.body;

//     // Validate request
//     if (!Array.isArray(ids) || ids.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide at least one employee ID.",
//       });
//     }

//     // Validate every employee ID
//     const invalidIds = ids.filter(
//       (id) => !mongoose.Types.ObjectId.isValid(id)
//     );

//     if (invalidIds.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "One or more employee IDs are invalid.",
//       });
//     }

//     // Delete selected employees
//     const result = await Employee.deleteMany({
//       _id: { $in: ids },
//     });

//     res.status(200).json({
//       success: true,
//       message: `${result.deletedCount} employee${
//         result.deletedCount === 1 ? "" : "s"
//       } deleted permanently.`,
//       deletedCount: result.deletedCount,
//     });
//   } catch (error) {
//     console.error(
//       "Delete multiple employees error:",
//       error.message
//     );

//     res.status(500).json({
//       success: false,
//       message: "Failed to delete selected employees.",
//     });
//   }
// };

// // POST /api/employees
// const createEmployee = async (req, res) => {
//   try {
//   const {
//   employeeName,
//   designation,
//   department,
//   company,
//   extension,
//   mobileNo,
//   email,
// } = req.body;

//     // Validate required fields
//     const requiredFields = {
//       employeeName,
//       designation,
//       department,
//       company,
//       extension,
//       mobileNo,
//     };

//     const missingFields = Object.entries(requiredFields)
//       .filter(([key, value]) => !value || String(value).trim() === "")
//       .map(([key]) => key);

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "All employee fields are required.",
//         missingFields,
//       });
//     }

//     // Validate mobile number
//     if (!/^\d{10}$/.test(String(mobileNo).trim())) {
//       return res.status(400).json({
//         success: false,
//         message: "Mobile number must contain exactly 10 digits.",
//       });
//     }

//     // Create employee
//    const employee = await Employee.create({
//   employeeName: String(employeeName).trim(),
//   designation: String(designation).trim(),
//   department: String(department).trim(),
//   company: String(company).trim(),
//   extension: String(extension).trim(),
//   mobileNo: String(mobileNo).trim(),
//   email: email ? String(email).trim() : "",
// });

//     res.status(201).json({
//       success: true,
//       message: "Employee added successfully",
//       data: employee,
//     });
//   } catch (error) {
//     console.error("Create employee error:", error.message);

//     res.status(500).json({
//       success: false,
//       message: "Failed to add employee",
//     });
//   }
// };

// module.exports = {
//   getEmployees,
//   getEmployeeById,
//   createEmployee,
//   updateEmployee,
//   deleteEmployee,
//   deleteMultipleEmployees,
// };


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
    const {
      employeeName,
      designation,
      department,
      company,
      extension,
      mobileNo,
      email,
      allowDuplicate,
    } = req.body;

    // Validate required fields.
    const requiredFields = {
      employeeName,
      designation,
      department,
      company,
      extension,
      mobileNo,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([, value]) =>
          value === undefined ||
          value === null ||
          String(value).trim() === ""
      )
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All employee fields are required.",
        missingFields,
      });
    }

    const normalizedName = String(employeeName).trim();
    const normalizedDesignation = String(designation).trim();
    const normalizedDepartment = String(department).trim();
    const normalizedCompany = String(company).trim();
    const normalizedExtension = String(extension).trim();
    const normalizedMobile = String(mobileNo).trim();
    const normalizedEmail = email ? String(email).trim() : "";

    // Validate mobile number.
    if (!/^\d{10}$/.test(normalizedMobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must contain exactly 10 digits.",
      });
    }

    // Check only Employee Name, Mobile No, and Extension.
    // An intentional duplicate is permitted only after confirmation.
    if (allowDuplicate !== true) {
      const escapeRegex = (value) =>
        value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const duplicateChecks = [
        {
          field: "Employee Name",
          value: normalizedName,
          query: {
            employeeName: {
              $regex: `^${escapeRegex(normalizedName)}$`,
              $options: "i",
            },
          },
        },
        {
          field: "Mobile No",
          value: normalizedMobile,
          query: { mobileNo: normalizedMobile },
        },
        {
          field: "Extension",
          value: normalizedExtension,
          query: {
            extension: {
              $regex: `^${escapeRegex(normalizedExtension)}$`,
              $options: "i",
            },
          },
        },
      ];

      const duplicates = [];

      for (const check of duplicateChecks) {
        const existingEmployee = await Employee.findOne(check.query);

        if (existingEmployee) {
          duplicates.push({
            field: check.field,
            value: check.value,
            message: `${check.field} "${check.value}" already exists.`,
            existingEmployee: {
              _id: existingEmployee._id,
              employeeName: existingEmployee.employeeName,
              designation: existingEmployee.designation,
              department: existingEmployee.department,
              company: existingEmployee.company,
              extension: existingEmployee.extension,
              mobileNo: existingEmployee.mobileNo,
              email: existingEmployee.email || "",
            },
          });
        }
      }

      if (duplicates.length > 0) {
        return res.status(409).json({
          success: false,
          duplicateDetected: true,
          message: "Duplicate employee information detected.",
          duplicates,
        });
      }
    }

    // Create the employee.
    const employee = await Employee.create({
      employeeName: normalizedName,
      designation: normalizedDesignation,
      department: normalizedDepartment,
      company: normalizedCompany,
      extension: normalizedExtension,
      mobileNo: normalizedMobile,
      email: normalizedEmail,
    });

    return res.status(201).json({
      success: true,
      message: allowDuplicate === true
        ? "Employee added successfully with duplicate information."
        : "Employee added successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Create employee error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add employee",
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
      email,
    } = req.body;

    const requiredFields = {
      employeeName,
      designation,
      department,
      company,
      extension,
      mobileNo,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([, value]) =>
          value === undefined ||
          value === null ||
          String(value).trim() === ""
      )
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All employee fields are required.",
        missingFields,
      });
    }

    if (!/^\d{10}$/.test(String(mobileNo).trim())) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must contain exactly 10 digits.",
      });
    }

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

    employee.employeeName = String(employeeName).trim();
    employee.designation = String(designation).trim();
    employee.department = String(department).trim();
    employee.company = String(company).trim();
    employee.extension = String(extension).trim();
    employee.mobileNo = String(mobileNo).trim();
    employee.email = email ? String(email).trim() : "";

    const updatedEmployee = await employee.save();

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Update employee error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
    });
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
