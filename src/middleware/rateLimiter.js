const rateLimiter = require('express-rate-limit');

const shortenLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per IP per window
    message: { error: 'Too many URLs created from this IP, please try again later.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { shortenLimiter };