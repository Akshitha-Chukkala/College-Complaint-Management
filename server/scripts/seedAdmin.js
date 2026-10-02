// server/scripts/seedAdmin.js
// Run this script to ensure a default admin user exists for demo login
// Usage: node ./server/scripts/seedAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_complaint_management';

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@campusresolve.edu' });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = new User({
      name: 'Demo Admin',
      email: 'admin@campusresolve.edu',
      password: 'Admin@123', // will be hashed by pre-save hook
      role: 'admin',
      department: 'Administration',
      studentId: ''
    });
    await admin.save();
    console.log('Demo admin user created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

createAdmin();
