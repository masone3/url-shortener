# URL Shortener

A full-stack URL shortener with QR code generation, Redis caching, and rate limiting.

## Live Demo
[Add your deployed URL here once live]

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL via Prisma ORM (v7, adapter-based)
- **Cache:** Redis (cache-aside pattern on redirects)
- **Short code generation:** nanoid
- **QR codes:** `qrcode` package
- **Testing:** Jest + Supertest
- **Frontend:** Vanilla HTML/CSS/JS
- **Containerization:** Docker Compose (Postgres + Redis)

## Features

- Shorten any valid URL to a compact code
- Redirect via short code, with Redis caching for fast lookups
- Auto-generated QR code for every short link
- Click tracking with a stats endpoint
- Rate limiting on URL creation (20 requests / 15 min per IP)
- Input validation (length limits, protocol allowlisting)
- Simple accessible web UI

## Getting Started

### Prerequisites
- Node.js 18+
- Docker (for Postgres + Redis)

### Setup

1. Clone the repo
   \`\`\`bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   \`\`\`

2. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`

3. Copy the environment template and fill in your values
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Start Postgres and Redis
   \`\`\`bash
   docker compose up -d
   \`\`\`

5. Run database migrations
   \`\`\`bash
   npx prisma migrate dev
   \`\`\`

6. Start the dev server
   \`\`\`bash
   npm run dev
   \`\`\`

7. Open [http://localhost:3000](http://localhost:3000)

### Running Tests

\`\`\`bash
npm test
\`\`\`

## API Reference

### `POST /shorten`
Creates a shortened URL.

**Body:**
\`\`\`json
{ "url": "https://example.com/some/long/path" }
\`\`\`

**Response (201):**
\`\`\`json
{
  "shortCode": "aB3xK9z",
  "shortUrl": "http://localhost:3000/aB3xK9z",
  "originalUrl": "https://example.com/some/long/path",
  "createdAt": "2026-07-17T04:45:05.279Z"
}
\`\`\`

### `GET /:code`
Redirects to the original URL.

### `GET /:code/qr`
Returns a PNG QR code encoding the short URL.

### `GET /:code/stats`
Returns click analytics.

**Response (200):**
\`\`\`json
{
  "shortCode": "aB3xK9z",
  "originalUrl": "https://example.com/some/long/path",
  "clicks": 12,
  "createdAt": "2026-07-17T04:45:05.279Z",
  "updatedAt": "2026-07-17T10:12:33.001Z"
}
\`\`\`

## Architecture Notes

- Prisma 7's adapter pattern is used (`@prisma/adapter-pg`) rather than the classic engine-based client.
- Redirects use a cache-aside pattern: Redis is checked first, falling back to Postgres on a miss, then populating the cache with a 24-hour TTL. Click counts are always read live from Postgres (not cache) to avoid staleness in analytics.

## License

MIT