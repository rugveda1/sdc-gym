const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
    email: 'test@example.com',
    password: 'password123'
};

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'];

async function verifyWorkouts() {
    try {
        // 1. Signup/Login
        const timestamp = Date.now();
        const user = {
            email: `test${timestamp}@example.com`,
            password: 'password123',
            name: 'Test User'
        };

        console.log('Signing up new test user...');
        try {
            await axios.post(`${BASE_URL}/signup`, user);
        } catch (e) {
            // Ignore if user already exists (though timestamp makes it unlikely)
            console.log('Signup failed (maybe user exists), trying login...');
        }

        console.log('Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/login`, { email: user.email, password: user.password });
        const token = loginRes.data.token;
        console.log('Login successful.');

        // 2. Check each muscle group
        for (const muscle of MUSCLE_GROUPS) {
            console.log(`\nTesting ${muscle}...`);
            const startRes = await axios.post(
                `${BASE_URL}/workout/start`,
                { muscle },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const videos = startRes.data.videos;
            console.log(`Videos returned for ${muscle}:`, videos);

            if (videos.length === 2 && videos[0].includes('1.mp4') && videos[1].includes('2.mp4')) {
                console.log(`✅ ${muscle} verification PASSED`);
            } else {
                console.error(`❌ ${muscle} verification FAILED. Expected 2 videos ending in 1.mp4 and 2.mp4`);
            }
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Could not connect to server. Is it running on port 3000?');
        } else {
            console.error('❌ Error during verification:', error.response ? error.response.data : error.message);
        }
    }
}

verifyWorkouts();
