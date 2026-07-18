const { nanoid } = require('nanoid');
const prisma = require('../config/db');

const CODE_LENGTH = 7;

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
            originalUrl,
            shortCode,
        },
    });

    return url;
}

async function getUrlByShortCode(shortCode) {
    return prisma.url.findUnique({ where: { shortCode } });
}

async function incrementClicks(shortCode) {
    return prisma.url.update({
        where: { shortCode },
        data: { clicks: { increment: 1 } },
    });
}

module.exports = {
    generateUniqueShortCode,
    createShortUrl,
    getUrlByShortCode,
    incrementClicks,
};