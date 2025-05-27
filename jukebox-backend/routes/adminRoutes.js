const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("../model/user");

// Get all users
router.get("/", async (req, res) => {
  const users = await User.find().select("name email blocked");
  res.json(users);
});

// Block user
router.patch("/block/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { blocked: true });
  res.json({ status: "blocked" });
});

// Unblock user
router.patch("/unblock/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { blocked: false });
  res.json({ status: "unblocked" });
});

// Admin dashboard (session-based protection)
router.get("/dashboard", (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }

  res.sendFile(path.join(__dirname, '../views/admin.html'));
});

module.exports = router;
