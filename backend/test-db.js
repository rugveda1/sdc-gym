const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await prisma.$connect();
        console.log('✅ Connected successfully.');

        console.log('Attempting to create a test user...');
        const email = `test_${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: {
                email: email,
                password: 'hashed_password_placeholder',
                name: 'Test User'
            }
        });
        console.log('✅ User created successfully:', user);

        console.log('Cleaning up...');
        await prisma.user.delete({ where: { id: user.id } });
        console.log('✅ Test user deleted.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
