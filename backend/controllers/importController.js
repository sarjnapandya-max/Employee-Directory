const fs = require("fs");
const XLSX = require("xlsx");
const Employee = require("../models/Employee");

const normalizeHeader = (header) =>
  String(header || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeRows = (rows) => {
  return rows.map((row) => {
    const normalizedRow = {};

    Object.entries(row).forEach(([key, value]) => {
      normalizedRow[normalizeHeader(key)] = value;
    });

    return normalizedRow;
  });
};

const uploadExcelFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Excel file uploaded successfully.",
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Excel upload error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to upload Excel file.",
    });
  }
};

const previewExcelFile = async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file.",
      });
    }

    filePath = req.file.path;

    console.log("Processing Excel file:", filePath);

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
    });

    const normalizedRows = normalizeRows(rows);

    const requiredColumns = [
      "Designation",
      "Department",
      "Company",
      "Mobile No",
    ];

    const actualColumns =
      normalizedRows.length > 0
        ? Object.keys(normalizedRows[0])
        : [];

    const missingColumns = requiredColumns.filter(
      (column) => !actualColumns.includes(column)
    );

    // Employee Name can be:
    // "Employee Name" OR "Name of the Employee"
    const hasEmployeeNameColumn =
      actualColumns.includes("Employee Name") ||
      actualColumns.includes("Name of the Employee");

    if (!hasEmployeeNameColumn) {
      missingColumns.unshift(
        "Employee Name / Name of the Employee"
      );
    }

    // Extension can be:
    // "Extension" OR "New Ext."
    const hasExtensionColumn =
      actualColumns.includes("Extension") ||
      actualColumns.includes("New Ext.");

    if (!hasExtensionColumn) {
      missingColumns.push("Extension / New Ext.");
    }

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file has missing required columns.",
        missingColumns,
      });
    }

    res.status(200).json({
      success: true,
      message: "Excel file preview generated successfully.",
      sheetName,
      totalRows: normalizedRows.length,
      columns: actualColumns,
      data: normalizedRows.slice(0, 10),
    });
  } catch (error) {
    console.error("Excel preview error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to read Excel file.",
    });
  } finally {
    // Always delete the temporary uploaded file
    if (filePath) {
      try {
        fs.unlinkSync(filePath);

        console.log(
          "Temporary Excel file deleted:",
          filePath
        );
      } catch (error) {
        console.error(
          "Could not delete temporary Excel file:",
          error.message
        );
      }
    }
  }
};

const importExcelData = async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file.",
      });
    }

    filePath = req.file.path;

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
    });

    const normalizedRows = normalizeRows(rows);

    if (normalizedRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file contains no data.",
      });
    }

    const requiredColumns = [
      "Designation",
      "Department",
      "Company",
      "Mobile No",
    ];

    const actualColumns = Object.keys(
      normalizedRows[0]
    );

    const missingColumns = requiredColumns.filter(
      (column) => !actualColumns.includes(column)
    );

    // Employee Name can be:
    // "Employee Name" OR "Name of the Employee"
    const hasEmployeeNameColumn =
      actualColumns.includes("Employee Name") ||
      actualColumns.includes("Name of the Employee");

    if (!hasEmployeeNameColumn) {
      missingColumns.unshift(
        "Employee Name / Name of the Employee"
      );
    }

    // Extension can be:
    // "Extension" OR "New Ext."
    const hasExtensionColumn =
      actualColumns.includes("Extension") ||
      actualColumns.includes("New Ext.");

    if (!hasExtensionColumn) {
      missingColumns.push("Extension / New Ext.");
    }

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file has missing required columns.",
        missingColumns,
      });
    }

    const employees = normalizedRows.map((row) => ({
      employeeName: String(
        row["Name of the Employee"] ??
          row["Employee Name"] ??
          ""
      ).trim(),

      designation: String(
        row["Designation"] ?? ""
      ).trim(),

      department: String(
        row["Department"] ?? ""
      ).trim(),

      company: String(
        row["Company"] ?? ""
      ).trim(),

      extension: String(
        row["Extension"] ??
          row["New Ext."] ??
          ""
      ).trim(),

      mobileNo: String(
        row["Mobile No"] ?? ""
      ).trim(),
    }));

    const invalidRows = [];

    employees.forEach((employee, index) => {
      const missingFields = [];
      const invalidFields = [];

      if (!employee.employeeName) {
        missingFields.push("Employee Name");
      }

      if (!employee.designation) {
        missingFields.push("Designation");
      }

      if (!employee.department) {
        missingFields.push("Department");
      }

      if (!employee.company) {
        missingFields.push("Company");
      }

      if (!employee.extension) {
        missingFields.push("Extension");
      }

      if (!employee.mobileNo) {
        missingFields.push("Mobile No");
      }

      if (
  employee.mobileNo &&
  !/^\d{10,11}$/.test(employee.mobileNo)
) {
  invalidFields.push(
    "Mobile No must contain 10 or 11 digits."
  );
}

      if (
        missingFields.length > 0 ||
        invalidFields.length > 0
      ) {
        invalidRows.push({
          row: index + 2,
          employeeName:
            employee.employeeName || "Unknown Employee",

          ...(missingFields.length > 0 && {
            missingFields,
          }),

          ...(invalidFields.length > 0 && {
            invalidFields,
          }),
        });
      }
    });

    if (invalidRows.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Some Excel rows contain invalid or missing values.",
        invalidRows,
      });
    }

    const importedEmployees = [];
    const duplicateEmployees = [];

    for (const employee of employees) {
      const existingEmployee = await Employee.findOne({
        employeeName: employee.employeeName,
        company: employee.company,
      });

      if (existingEmployee) {
        duplicateEmployees.push({
          employeeName: employee.employeeName,
          company: employee.company,
        });

        continue;
      }

      const newEmployee = await Employee.create(employee);

      importedEmployees.push(newEmployee);
    }

    res.status(201).json({
      success: true,
      message: "Excel import completed.",
      importedCount: importedEmployees.length,
      duplicateCount: duplicateEmployees.length,
      duplicates: duplicateEmployees,
    });
  } catch (error) {
    console.error(
      "Excel import error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to import Excel data.",
    });
  } finally {
    // Clean up the temporary import file
    if (filePath) {
      try {
        fs.unlinkSync(filePath);

        console.log(
          "Temporary Excel file deleted:",
          filePath
        );
      } catch (error) {
        console.error(
          "Could not delete temporary Excel file:",
          error.message
        );
      }
    }
  }
};

module.exports = {
  uploadExcelFile,
  previewExcelFile,
  importExcelData,
};