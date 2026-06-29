const asyncHandler = require('express-async-handler');
const User = require('../models/User');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ role: 1, name: 1 });
  res.json(users);
});

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password = 'password123', role, skills = [], weeklyCapacityHours = 40 } = req.body;
  if (!name || !email || !role) {
    res.status(400);
    throw new Error('Name, email and role are required');
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already exists');
  }
  const user = await User.create({ name, email, password, role, skills, weeklyCapacityHours });
  res.status(201).json({ id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role, skills: user.skills, weeklyCapacityHours: user.weeklyCapacityHours });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  delete update.password;
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ message: 'User deleted' });
});
