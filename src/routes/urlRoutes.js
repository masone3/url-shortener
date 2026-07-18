const express = require('express');
const router = express.Router();

const { shortenUrl, redirectToOriginal } = require('../controllers/urlController');
const validateUrl = require('../middleware/validateUrl');

router.post('/shorten', validateUrl, shortenUrl);
router.get('/:code', redirectToOriginal);

module.exports = router;