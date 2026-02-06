import mongoose from "mongoose";
import { User } from "./models/userSchema.js";
import { config } from "dotenv";

config({ path: ".env" });

const createFirstAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "HospitalDatabase",
    });
    console.log("Connected to database!");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "Admin" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create first admin
    const adminData = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@hospital.com",
      phone: "1234567890",
      nic: "1234567", // 7 digits as required
      dob: "1990-01-01",
      gender: "Male",
      password: "admin123", // Change this to a secure password
      role: "Admin",
    };

    const admin = await User.create(adminData);
    console.log("✅ First admin created successfully!");
    console.log("Email:", admin.email);
    console.log("Password: admin123");
    console.log("Please change the password after first login!");
    
  } catch (error) {
    console.error("Error creating admin:", error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createFirstAdmin();