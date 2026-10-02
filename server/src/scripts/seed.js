const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Connected to database. Seeding initial accounts...');

    // Clear existing users with test emails
    await User.deleteMany({
      email: {
        $in: [
          'admin@campusresolve.edu',
          'student@campusresolve.edu',
          'hostel.staff@campusresolve.edu'
        ]
      }
    });

    const users = [
      {
        name: 'Chief Campus Administrator',
        email: 'admin@campusresolve.edu',
        password: 'Admin@123',
        role: 'admin',
        department: 'Campus Administration',
        studentId: ''
      },
      {
        name: 'Alex Johnson',
        email: 'student@campusresolve.edu',
        password: 'Student@123',
        role: 'student',
        department: 'Computer Science',
        studentId: 'STU-2026-001'
      },
      {
        name: 'Michael Davis',
        email: 'hostel.staff@campusresolve.edu',
        password: 'Staff@123',
        role: 'staff',
        department: 'Hostel Affairs',
        studentId: ''
      }
    ];

    for (const u of users) {
      await User.create(u);
      console.log(`[Seeder] Created ${u.role}: ${u.email}`);
    }

    console.log('[Seeder] Seeding completed successfully!');
  } catch (err) {
    console.error('[Seeder] Error during seeding:', err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedUsers();
