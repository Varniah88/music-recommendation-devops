const express = require('express');
const router = express.Router();
const User = require('../model/user');
const DeletedUser = require('../model/deletedUser');

// GET /api/users — return username, email, blocked, and _id
router.get('/', async (req, res) => {
  const excludeEmail = req.query.exclude;
  try {
    const filter = excludeEmail ? { email: { $ne: excludeEmail } } : {};

    // Ensure _id is included
    const users = await User.find(filter).select('username email blocked'); // _id included by default
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/users/block/:id
router.patch('/block/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { blocked: true });
    res.json({ message: 'User blocked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// PATCH /api/users/unblock/:id
router.patch('/unblock/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { blocked: false });
    res.json({ message: 'User unblocked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// DELETE /api/users/:id — Soft-delete via DeletedUser collection
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Save email to deleted_users collection
    await DeletedUser.create({ email: user.email });

    // Delete user from main User collection
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User deleted and email archived' });
  } catch (err) {
    console.error('Delete Error:', err.message); // helpful for debugging
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
