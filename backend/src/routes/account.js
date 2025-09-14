const express = require('express');
const router = express.Router();
const { details, updateProfile } = require('../controllers/accountController');
const { authMiddleware } = require('../middleware/auth');
const { updateMeValidator } = require('../validators/userValidators');

router.get('/details', authMiddleware, details);
router.put('/profile', authMiddleware, updateMeValidator, updateProfile);

module.exports = router;
