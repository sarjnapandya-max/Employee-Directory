const fs = require("fs");

const XLSX = require("xlsx");

const Employee = require("../models/Employee");
const mongoose = require("mongoose");



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

const buildEmployeesFromRows = (normalizedRows) => {
  return normalizedRows.map((row) => ({
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

    email: String(
      row["Email"] ?? ""
    ).trim(),
  }));
};

const normalizeDuplicateValue = (value) =>

  String(value || "")

    .trim()

    .toLowerCase();

const findExcelDuplicates = (employees) => {

  const duplicateMap = new Map();



  const fieldsToCheck = [

    {

      key: "employeeName",

      label: "Employee Name",

    },

    {

      key: "extension",

      label: "Extension",

    },

    {

      key: "mobileNo",

      label: "Mobile No",

    },

    {

      key: "email",

      label: "Email",

    },

  ];



  fieldsToCheck.forEach(({ key, label }) => {

    const valueMap = new Map();



    employees.forEach((employee, index) => {

      const value = normalizeDuplicateValue(employee[key]);



      // Email is optional, so blank email values are ignored.

      if (!value) {

        return;

      }



      const rowNumber = index + 2;



      if (!valueMap.has(value)) {

        valueMap.set(value, []);

      }



      valueMap.get(value).push(rowNumber);

    });



    valueMap.forEach((rows, value) => {

      if (rows.length > 1) {

        duplicateMap.set(

          `${label}-${value}`,

          {

            type: "excel",

            field: label,

            value,

            rows,

            message: `${label} "${value}" is duplicated in Excel rows ${rows.join(

              ", "

            )}.`,

          }

        );

      }

    });

  });

  const employeeNameCompanyMap = new Map();



  employees.forEach((employee, index) => {

    const employeeName = normalizeDuplicateValue(

      employee.employeeName

    );



    const company = normalizeDuplicateValue(

      employee.company

    );



    if (!employeeName || !company) {

      return;

    }



    const key = `${employeeName}||${company}`;

    const rowNumber = index + 2;



    if (!employeeNameCompanyMap.has(key)) {

      employeeNameCompanyMap.set(key, []);

    }



    employeeNameCompanyMap.get(key).push(rowNumber);

  });



  employeeNameCompanyMap.forEach((rows, key) => {

    if (rows.length > 1) {

      const [employeeName, company] = key.split("||");



      duplicateMap.set(

        `Employee Name-${key}`,

        {

          type: "excel",

          field: "Employee Name",

          value: employeeName,

          rows,

          message: `Employee Name "${employeeName}" with Company "${company}" is duplicated in Excel rows ${rows.join(

            ", "

          )}.`,

        }

      );

    }

  });



  return Array.from(duplicateMap.values());

};


const findDatabaseDuplicates = async (employees) => {
  const duplicates = [];
  const normalize = (value) => String(value || "").trim().toLowerCase();
  const fields = [
    { key: "employeeName", label: "Employee Name", regex: true },
    { key: "extension", label: "Extension" },
    { key: "mobileNo", label: "Mobile No" },
    { key: "email", label: "Email", regex: true, optional: true },
  ];

  for (let index = 0; index < employees.length; index++) {
    const employee = employees[index];
    const rowNumber = index + 2;
    const matchingById = new Map();
    const matchedFields = [];

    for (const field of fields) {
      const value = normalize(employee[field.key]);
      if (!value && field.optional) continue;
      if (!value) continue;
      const query = field.regex
        ? { [field.key]: { $regex: `^${String(employee[field.key]).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } }
        : { [field.key]: String(employee[field.key]).trim() };
      const matches = await Employee.find(query).limit(100);
      if (matches.length) {
        matchedFields.push({ field: field.label, value: employee[field.key] });
        matches.forEach((match) => matchingById.set(String(match._id), match));
      }
    }

    if (matchingById.size) {
      const matchingEmployees = Array.from(matchingById.values()).map((existing) => ({
        _id: existing._id,
        employeeName: existing.employeeName,
        designation: existing.designation,
        department: existing.department,
        company: existing.company,
        extension: existing.extension,
        mobileNo: existing.mobileNo,
        email: existing.email || "",
      }));
      duplicates.push({
        type: "database",
        field: matchedFields.map((item) => item.field).join(", "),
        value: matchedFields.map((item) => `${item.field}: ${item.value}`).join("; "),
        row: rowNumber,
        employeeName: employee.employeeName,
        matchedFields,
        matchingEmployees,
        existingEmployee: matchingEmployees[0],
        message: `Excel row ${rowNumber} matches ${matchingEmployees.length} existing employee record(s) by ${matchedFields.map((item) => item.field).join(", ")}. Select the correct record before replacing.`,
      });
    }
  }
  return duplicates;
};

const validateEmployeesForImport = async (employees) => {

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



  return invalidRows;

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



    /*

     * Build employees from the Excel rows for duplicate checking.

     */

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



      email: String(

        row["Email"] ?? ""

      ).trim(),

    }));



    /*

     * Check duplicates inside Excel.

     */

    const excelDuplicates =

      findExcelDuplicates(employees);



    /*

     * Check duplicates against MongoDB.

     */

    const databaseDuplicates =

      await findDatabaseDuplicates(employees);



    const duplicates = [

      ...excelDuplicates,

      ...databaseDuplicates,

    ];



    if (duplicates.length > 0) {

      return res.status(400).json({

        success: false,

        message:

          "Duplicate data found. Please correct the highlighted rows before importing.",

        duplicateCount: duplicates.length,

        duplicates,

        sheetName,

        totalRows: normalizedRows.length,

        columns: actualColumns,

        data: normalizedRows,

      });

    }



    res.status(200).json({

      success: true,

      message: "Excel file preview generated successfully.",

      sheetName,

      totalRows: normalizedRows.length,

      columns: actualColumns,

      data: normalizedRows,

    });

  } catch (error) {

    console.error(

      "Excel preview error:",

      error.message

    );



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



      email: String(

        row["Email"] ?? ""

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



    /*

     * IMPORTANT:

     * Check ALL duplicates before creating ANY employee.

     * This prevents partial imports.

     */

    const excelDuplicates =

      findExcelDuplicates(employees);



    const databaseDuplicates =

      await findDatabaseDuplicates(employees);



    const duplicates = [

      ...excelDuplicates,

      ...databaseDuplicates,

    ];



    if (duplicates.length > 0) {

      return res.status(400).json({

        success: false,

        message:

          "Duplicate data found. Please correct the duplicate rows before importing.",

        duplicateCount: duplicates.length,

        duplicates,

      });

    }



    /*

     * Only create employees after the complete

     * duplicate validation has passed.

     */

    const importedEmployees = [];



    for (const employee of employees) {

      const newEmployee = await Employee.create(

        employee

      );



      importedEmployees.push(newEmployee);

    }



    res.status(201).json({

      success: true,

      message: "Excel import completed.",

      importedCount: importedEmployees.length,

      duplicateCount: 0,

      duplicates: [],

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



const validateCorrectedExcelData = async (req, res) => {

  try {

    const { rows } = req.body;



    if (!Array.isArray(rows) || rows.length === 0) {

      return res.status(400).json({

        success: false,

        message: "No corrected Excel data was provided.",

      });

    }



    const normalizedRows = normalizeRows(rows);



    const employees = buildEmployeesFromRows(

      normalizedRows

    );



    // Validate required fields and values

    const invalidRows =

      await validateEmployeesForImport(employees);



    if (invalidRows.length > 0) {

      return res.status(400).json({

        success: false,

        message:

          "Some corrected rows contain invalid or missing values.",

        invalidRows,

        data: normalizedRows,

      });

    }



    // Check duplicates inside corrected Excel data

    const excelDuplicates =

      findExcelDuplicates(employees);



    // Check duplicates against MongoDB

    const databaseDuplicates =

      await findDatabaseDuplicates(employees);



    const duplicates = [

      ...excelDuplicates,

      ...databaseDuplicates,

    ];



    if (duplicates.length > 0) {

      return res.status(400).json({

        success: false,

        message:

          "Duplicate data still exists. Please correct the highlighted rows.",

        duplicateCount: duplicates.length,

        duplicates,

        totalRows: normalizedRows.length,

        columns:

          normalizedRows.length > 0

            ? Object.keys(normalizedRows[0])

            : [],

        data: normalizedRows,

      });

    }



    return res.status(200).json({

      success: true,

      message:

        "All corrected data is valid and duplicate-free.",

      duplicateCount: 0,

      duplicates: [],

      totalRows: normalizedRows.length,

      columns:

        normalizedRows.length > 0

          ? Object.keys(normalizedRows[0])

          : [],

      data: normalizedRows,

    });

  } catch (error) {

    console.error(

      "Corrected Excel validation error:",

      error.message

    );



    return res.status(500).json({

      success: false,

      message:

        "Failed to validate corrected Excel data.",

    });

  }

};const importCorrectedExcelData = async (req, res) => {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No corrected Excel data was provided.",
      });
    }

    const normalizedRows = normalizeRows(rows);

    const employees = buildEmployeesFromRows(normalizedRows);

    const invalidRows =
      await validateEmployeesForImport(employees);

    if (invalidRows.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Some corrected rows contain invalid or missing values.",
        invalidRows,
        data: normalizedRows,
      });
    }

    const excelDuplicates =
      findExcelDuplicates(employees);

    const databaseDuplicates =
      await findDatabaseDuplicates(employees);

    const duplicates = [
      ...excelDuplicates,
      ...databaseDuplicates,
    ];

    /*
     * Never import if duplicates still exist.
     */
    if (duplicates.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate data still exists. Please correct the highlighted rows.",
        duplicateCount: duplicates.length,
        duplicates,
        totalRows: normalizedRows.length,
        columns:
          normalizedRows.length > 0
            ? Object.keys(normalizedRows[0])
            : [],
        data: normalizedRows,
      });
    }

    /*
     * Only import after all validation
     * and duplicate checks pass.
     */
    const importedEmployees = [];

    for (const employee of employees) {
      const newEmployee = await Employee.create(employee);

      importedEmployees.push(newEmployee);
    }

    return res.status(201).json({
      success: true,
      message:
        "Corrected Excel import completed successfully.",
      importedCount: importedEmployees.length,
      duplicateCount: 0,
      duplicates: [],
    });
  } catch (error) {
    console.error(
      "Corrected Excel import error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to import corrected Excel data.",
    });
  }
};

const importDuplicateExcelData = async (req, res) => {
  try {
    const { rows, forceDuplicateImport, rowNumbers, replaceMappings = {} } = req.body;


    if (forceDuplicateImport !== true) {
      return res.status(400).json({
        success: false,
        message:
          "Explicit confirmation is required to import duplicate records.",
      });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No duplicate rows were selected.",
      });
    }

    const normalizedRows = normalizeRows(rows);

    const employees = buildEmployeesFromRows(normalizedRows);


    const invalidRows =
      await validateEmployeesForImport(employees);

    if (invalidRows.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Some selected duplicate rows contain invalid or missing values.",
        invalidRows,
        data: normalizedRows,
      });
    }

    /*
     * Import non-duplicate rows, create explicitly selected duplicates,
     * or replace the specifically selected existing employee by Mongo ID.
     */
    const importedEmployees = [];
    const replacedEmployees = [];
    const safeRowNumbers = Array.isArray(rowNumbers)
      ? rowNumbers.map((value) => Number(value))
      : employees.map((_, index) => index + 2);

    for (let index = 0; index < employees.length; index++) {
      const employeeData = employees[index];
      const originalRowNumber = safeRowNumbers[index];
      const targetId = replaceMappings[String(originalRowNumber)];

      if (targetId) {
        if (!mongoose.Types.ObjectId.isValid(targetId)) {
          return res.status(400).json({ success: false, message: `Invalid replacement employee ID for Excel row ${originalRowNumber}.` });
        }
        const target = await Employee.findById(targetId);
        if (!target) {
          return res.status(404).json({ success: false, message: `Replacement employee for Excel row ${originalRowNumber} was not found. Revalidate the file and try again.` });
        }
        const conflictChecks = [
          { field: "Employee Name", query: { employeeName: { $regex: `^${String(employeeData.employeeName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } } },
          { field: "Extension", query: { extension: employeeData.extension } },
          { field: "Mobile No", query: { mobileNo: employeeData.mobileNo } },
          ...(employeeData.email ? [{ field: "Email", query: { email: { $regex: `^${String(employeeData.email).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } } }] : []),
        ];
        for (const check of conflictChecks) {
          const other = await Employee.findOne({ ...check.query, _id: { $ne: target._id } });
          if (other) {
            return res.status(409).json({ success: false, message: `Cannot replace row ${originalRowNumber}: ${check.field} also belongs to another employee (${other.employeeName}).`, conflictEmployee: { _id: other._id, employeeName: other.employeeName } });
          }
        }
        Object.assign(target, employeeData, { email: employeeData.email ? String(employeeData.email).trim() : "" });
        replacedEmployees.push(await target.save());
      } else {
        importedEmployees.push(await Employee.create(employeeData));
      }
    }

    return res.status(201).json({
      success: true,
      message: `Excel processing completed: ${importedEmployees.length} record(s) created and ${replacedEmployees.length} existing record(s) replaced.`,
      importedCount: importedEmployees.length + replacedEmployees.length,
      createdCount: importedEmployees.length,
      replacedCount: replacedEmployees.length,
      replacedEmployees: replacedEmployees.map((employee) => ({ id: employee._id, employeeName: employee.employeeName })),
      duplicateCount: importedEmployees.length,
      duplicatesImported: importedEmployees.map(
        (employee) => ({
          id: employee._id,
          employeeName: employee.employeeName,
          company: employee.company,
          extension: employee.extension,
          mobileNo: employee.mobileNo,
          email: employee.email || "",
        })
      ),
    });
  } catch (error) {
    console.error(
      "Duplicate Excel import error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to import selected duplicate records.",
    });
  }
};


module.exports = {
  uploadExcelFile,
  previewExcelFile,
  importExcelData,
  validateCorrectedExcelData,
  importCorrectedExcelData,
  importDuplicateExcelData,
};
