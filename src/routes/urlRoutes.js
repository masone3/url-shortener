const express = require('express');
const router = express.Router();

const { shortenUrl, redirectToOriginal, getQRCode, getStats } = require('../controllers/urlController');
const validateUrl = require('../middleware/validateUrl');
const { shortenLimiter } = require('../middleware/rateLimiter');

router.post('/shorten', shortenLimiter, validateUrl, shortenUrl);
router.get('/:code/qr', getQRCode);
router.get('/:code/stats', getStats);
router.get('/:code', redirectToOriginal);

module.exports = router;