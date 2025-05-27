const mongoose = require('mongoose');

const deletedUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  deletedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeletedUser', deletedUserSchema);
