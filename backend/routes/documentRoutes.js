const express = require('express');
const documentController = require('../controllers/documentController');
const { protect, restrictTo } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// AI generation is expensive - apply a tighter limiter specifically here
const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { status: 'fail', message: 'Document generation limit reached. Please try again later.' },
});

router.use(protect);

router.get('/', documentController.listDocuments);
router.get('/:id', documentController.getDocument);
router.post('/generate', restrictTo('owner', 'admin'), generationLimiter, documentController.generateDocument);

module.exports = router;
