const mongoose = require("mongoose");
require("dotenv").config();

const Employee = require("./models/Employee");

async function checkCompanies() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const companies = await Employee.distinct("company");

    console.log("\nCompanies found in database:");
    console.log(companies);

    console.log("\nTotal distinct companies:", companies.length);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkCompanies();