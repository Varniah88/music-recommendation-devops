const User = require('../model/user');

// Get user
const getUser = async (req, res, next) => {
    const userId = req.userId;
    
    const user = await User.findById(userId).select('-password')
      .catch(err => next(err));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  };

// Update user
const updateUser = async (req, res, next) => {
    const userId = req.userId;
    const updateData = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    )
    .select('-password')
    .catch(err => next(err));
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated', user: updatedUser });
  };

// Delete user
const deleteUser = async (req, res, next) => {
    const userId = req.userId;
    
    const deletedUser = await User.findByIdAndDelete(userId)
      .catch(err => next(err));
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted' });
  };

module.exports = { getUser, updateUser, deleteUser};