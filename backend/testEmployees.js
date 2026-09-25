require("dotenv").config();

const mongoose = require("mongoose");
const Employee = require("./models/Employee");

const testEmployees = [
  {
    employeeName: "Rajesh Patel",
    designation: "Manager",
    department: "Information Technology",
    company: "GSPL",
    extension: "1001",
    mobileNo: "9876543210",
  },
  {
    employeeName: "Neha Shah",
    designation: "Assistant Manager",
    department: "Human Resources",
    company: "GSPL",
    extension: "1002",
    mobileNo: "9876543211",
  },
  {
    employeeName: "Amit Desai",
    designation: "Engineer",
    department: "Network",
    company: "GSPL Transmission",
    extension: "1003",
    mobileNo: "9876543212",
  },
];

const insertEmployees = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Employee.deleteMany({});

    const employees = await Employee.insertMany(testEmployees);

    console.log(`${employees.length} test employees inserted successfully.`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

insertEmployees();