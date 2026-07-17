const prisma = require('../config/db');

async function main() {
    const url = await prisma.url.create({
        data: {
            shortCode: 'test123',
            originalUrl: 'https://example.com',
        },
    });
    console.log('Created URL:', url);

    const all = await prisma.url.findMany();
    console.log('All URLs:', all);
}

main()
    .catch((e) => console.error(e))
    .finally(() => process.exit());