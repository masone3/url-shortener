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

module.exports = { shortenUrl, redirectToOriginal };