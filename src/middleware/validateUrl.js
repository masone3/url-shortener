const MAX_URL_LENGTH = 2048;
const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'file:', 'vbscript:'];

function validateUrl(req, res, next) {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A "url" field is required in the request body.' });
  }

  if (url.length > MAX_URL_LENGTH) {
    return res.status(400).json({ error: `URL must be under ${MAX_URL_LENGTH} characters.` });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'URL must use http or https.' });
  }

  if (BLOCKED_PROTOCOLS.some((proto) => url.toLowerCase().trim().startsWith(proto))) {
    return res.status(400).json({ error: 'This URL scheme is not allowed.' });
  }

  next();
}

module.exports = validateUrl;