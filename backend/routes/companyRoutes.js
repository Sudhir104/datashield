const express = require('express');
const companyController = require('../controllers/companyController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/me', companyController.getMyCompany);
router.patch('/me', restrictTo('owner', 'admin'), companyController.updateMyCompany);

module.exports = router;
