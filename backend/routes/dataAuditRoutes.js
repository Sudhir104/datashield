const express = require('express');
const dataAuditController = require('../controllers/dataAuditController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', dataAuditController.getAudit);
router.post('/flows', dataAuditController.addDataFlow);
router.patch('/flows/:flowId', dataAuditController.updateDataFlow);
router.delete('/flows/:flowId', dataAuditController.deleteDataFlow);

module.exports = router;
