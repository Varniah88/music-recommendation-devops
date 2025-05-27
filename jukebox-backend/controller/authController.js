const User = require('../model/user');
const DeletedUser = require('../model/deletedUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  // Extract user data from request body
  const { username, email, password, dateOfBirth, age, gender, bio } = req.body;

  // Validate input
  if (!username || !email || !password || !dateOfBirth || !age || !gender || !bio) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const deleted = await DeletedUser.findOne({ email });
    if (deleted) {
      return res.status(403).json({ message: 'This email was previously deleted and cannot be reused.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      dateOfBirth,
      age,
      gender,
      bio,
      role: 'user'
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};


const login = async (req, res) => {
  // Extract login credentials from request body
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });


    // Send response with token and user info
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role 
      }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};



module.exports = { register, login };