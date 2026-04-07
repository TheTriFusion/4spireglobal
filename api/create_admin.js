const pool = require('./db/db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET role = $4',
            ['Admin User', 'admin@gmail.com', hashedPassword, 'admin']
        );
        console.log('Admin created: admin@gmail.com / admin123');
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
}

createAdmin();
