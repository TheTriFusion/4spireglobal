const pool = require('./db/db');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        console.log('Starting seeding process...');
        const password = await bcrypt.hash('password123', 10);
        
        // 1. Create 28 Users
        const userIds = [];
        for (let i = 1; i <= 28; i++) {
            const res = await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
                [`User ${i}`, `user${i}@example.com`, password, 'user']
            );
            userIds.push(res.rows[0].id);
        }
        console.log('Created 28 users.');

        // 2. Create 100 Templates
        const titles = [
            'Modern Portfolio', 'E-commerce React', 'Business Landing Page', 
            'Creative Agency UI', 'Minimalist Blog', 'Admin Dashboard Pro',
            'SaaS Landing Template', 'Photography Showcase', 'Real Estate Portal',
            'Food Delivery Web', 'Fitness Tracker App', 'Education LMS',
            'Crypto Wallet UI', 'NFT Marketplace', 'Travel Booking',
            'Health & Wellness', 'Law Firm Website', 'Architect Portfolio'
        ];

        for (let i = 1; i <= 100; i++) {
            const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
            const randomTitle = titles[Math.floor(Math.random() * titles.length)] + ' v' + (i % 5 + 1);
            const randomPrice = (Math.random() * 50 + 9).toFixed(2);
            
            // Use LoremFlickr with website/app keywords. Reliable and fast.
            const thumbnailUrl = `https://loremflickr.com/800/450/website,app?lock=${i}`;
            
            await pool.query(
                'INSERT INTO templates (user_id, title, price, thumbnail, file_url, status) VALUES ($1, $2, $3, $4, $5, $6)',
                [
                    randomUser, 
                    randomTitle, 
                    randomPrice, 
                    thumbnailUrl, 
                    'uploads/files/placeholder.zip', 
                    'approved'
                ]
            );
        }
        console.log('Created 100 approved templates.');
        console.log('Seeding complete successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
