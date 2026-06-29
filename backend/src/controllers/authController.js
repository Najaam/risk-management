const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (await User.findOne({ email })) { res.status(400); throw new Error('Email already exists'); }
  const user = await User.create({ name, email, password, role });
  res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name, email, role: user.role } });
});
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) { res.status(401); throw new Error('Invalid credentials'); }
  res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
exports.me = asyncHandler(async (req, res) => res.json(req.user));
