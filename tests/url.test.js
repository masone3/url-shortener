const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');
const redis = require('../src/config/redis');

describe('URL Shortener API', () => {
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  let createdShortCode;

  afterAll(async () => {
    // Clean up test data
    if (createdShortCode) {
      await prisma.url.deleteMany({ where: { shortCode: createdShortCode } });
    }
    await prisma.$disconnect();
    redis.disconnect();
  });

  describe('POST /shorten', () => {
    it('creates a short URL for a valid link', async () => {
      const res = await request(app)
        .post('/shorten')
        .send({ url: testUrl });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('shortCode');
      expect(res.body).toHaveProperty('shortUrl');
      expect(res.body.originalUrl).toBe(testUrl);

      createdShortCode = res.body.shortCode;
    });

    it('rejects a missing url field', async () => {
      const res = await request(app).post('/shorten').send({});
      expect(res.status).toBe(400);
    });

    it('rejects a malformed url', async () => {
      const res = await request(app)
        .post('/shorten')
        .send({ url: 'not-a-real-url' });
      expect(res.status).toBe(400);
    });

    it('rejects a blocked protocol', async () => {
      const res = await request(app)
        .post('/shorten')
        .send({ url: 'javascript:alert(1)' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /:code', () => {
    it('redirects to the original URL for a valid code', async () => {
      const res = await request(app).get(`/${createdShortCode}`);
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(testUrl);
    });

    it('returns 404 for a non-existent code', async () => {
      const res = await request(app).get('/thisCodeDoesNotExist123');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /:code/stats', () => {
    it('returns click stats for a valid code', async () => {
      const res = await request(app).get(`/${createdShortCode}/stats`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('clicks');
      expect(res.body).toHaveProperty('originalUrl', testUrl);
    });

    it('returns 404 for a non-existent code', async () => {
      const res = await request(app).get('/thisCodeDoesNotExist123/stats');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /:code/qr', () => {
    it('returns a PNG image for a valid code', async () => {
      const res = await request(app).get(`/${createdShortCode}/qr`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/png');
    });
  });
});