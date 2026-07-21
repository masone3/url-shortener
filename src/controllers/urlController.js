const urlService = require('../services/urlService');

async function shortenUrl(req, res) {
  try {
    const { url } = req.body;
    const created = await urlService.createShortUrl(url);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    res.status(201).json({
      shortCode: created.shortCode,
      shortUrl: `${baseUrl}/${created.shortCode}`,
      originalUrl: created.originalUrl,
      createdAt: created.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong shortening the URL.' });
  }
}

async function getQRCode(req, res) {
  try {
    const { code } = req.params;
    const record = await urlService.getUrlByShortCode(code);

    if (!record) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${record.shortCode}`;

    const qrBuffer = await urlService.generateQRCode(shortUrl);

    res.set('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong generating the QR code.' });
  }
}

async function redirectToOriginal(req, res) {
  try {
    const { code } = req.params;
    const record = await urlService.getUrlByShortCode(code);

    if (!record) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    console.log(`[${code}] served from: ${record.fromCache ? 'CACHE' : 'DATABASE'}`);

    await urlService.incrementClicks(code);
    res.redirect(record.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong redirecting.' });
  }
}

async function getStats(req, res, next) {
  try {
    const { code } = req.params;
    const stats = await urlService.getStats(code);

    if (!stats) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { shortenUrl, redirectToOriginal, getQRCode, getStats };