const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

const registerUser = async ({ name, email, password, studentId, department, role }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists with this email address');
    error.statusCode = 400;
    throw error;
  }

  // Create new user (role defaults to 'student')
  const user = await User.create({
    name,
    email,
    password,
    studentId: studentId || '',
    department: department || '',
    role: role || 'student'
  });

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department
    },
    token
  };
};

const loginUser = async ({ email, password }) => {
  // Find user by email with password included
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Match password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department
    },
    token
  };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  getUserProfile
};
