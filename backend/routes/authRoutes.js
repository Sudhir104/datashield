const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation, runValidation } = require('../middleware/validators');

const router = express.Router();

router.post('/register', authLimiter, registerValidation, runValidation, authController.register);
router.post('/login', authLimiter, loginValidation, runValidation, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
