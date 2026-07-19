const express = require('express');
const checklistController = require('../controllers/checklistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/seed', checklistController.seedForCompany);
router.get('/', checklistController.getChecklist);
router.patch('/:id/toggle', checklistController.toggleItem);

module.exports = router;
