function validateUrl(req, res, next) {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A "url" field is required in the request body.' });
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'URL must use http or https.' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  next();
}

module.exports = validateUrl;