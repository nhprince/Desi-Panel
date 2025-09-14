const { User, HostingAccount, Domain } = require('../models');

const details = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'createdAt', 'updatedAt'],
      include: [{
        model: HostingAccount,
        as: 'hostingAccount',
        attributes: ['id', 'diskSpaceLimitMb', 'bandwidthLimitGb', 'createdAt', 'updatedAt'],
        include: [{
          model: Domain,
          as: 'domains',
          attributes: ['id', 'name', 'type', 'createdAt', 'updatedAt'],
        }]
      }]
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('Account details error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const { validationResult } = require('express-validator');
const { comparePassword, hashPassword } = require('../utils/password');

const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, newPassword, currentPassword } = req.body;
  if (!email && !newPassword) {
    return res.status(400).json({ message: 'Nothing to update' });
  }
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const ok = await comparePassword(currentPassword || '', user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

    // Update email if provided
    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
      user.email = email;
    }

    // Update password if provided
    if (newPassword) {
      user.passwordHash = await hashPassword(newPassword);
    }

    await user.save();
    return res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { details, updateProfile };
