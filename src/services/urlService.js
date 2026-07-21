const { nanoid } = require('nanoid');
const prisma = require('../config/db');
const redis = require('../config/redis');

const CODE_LENGTH = 7;
const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const QRCode = require('qrcode');

async function generateQRCode(shortUrl) {
  const buffer = await QRCode.toBuffer(shortUrl, {
    type: 'png',
    width: 300,
    margin: 2,
  });
  return buffer;
}

async function generateUniqueShortCode() {
  let code;
  let exists = true;

  while (exists) {
    code = nanoid(CODE_LENGTH);
    const existing = await prisma.url.findUnique({ where: { shortCode: code } });
    exists = Boolean(existing);
  }

  return code;
}

async function createShortUrl(originalUrl) {
  const shortCode = await generateUniqueShortCode();

  const url = await prisma.url.create({
    data: {
      shortCode,
      originalUrl,
    },
  });

  return url;
}

async function getUrlByShortCode(shortCode) {
  const cacheKey = `url:${shortCode}`;

  // 1. Check Redis first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return { ...JSON.parse(cached), fromCache: true };
  }

  // 2. Cache miss — fall back to Postgres
  const record = await prisma.url.findUnique({ where: { shortCode } });

  if (!record) {
    return null;
  }

  // 3. Populate cache for next time
  await redis.set(cacheKey, JSON.stringify(record), 'EX', CACHE_TTL_SECONDS);

  return { ...record, fromCache: false };
}

async function incrementClicks(shortCode) {
  return prisma.url.update({
    where: { shortCode },
    data: { clicks: { increment: 1 } },
  });
}

async function getStats(shortCode) {
  const record = await prisma.url.findUnique({ where: { shortCode } });

  if (!record) {
    return null;
  }

  return {
    shortCode: record.shortCode,
    originalUrl: record.originalUrl,
    clicks: record.clicks,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

module.exports = {
  generateUniqueShortCode,
  createShortUrl,
  getUrlByShortCode,
  incrementClicks,
  generateQRCode,
  getStats,
};