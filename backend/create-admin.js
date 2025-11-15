const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function createAdminUser() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'local_db',
        user: 'sarang',
        password: 'sarang@123'
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Hash the password
        const password = 'Admin@123';
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed');

        // Check if admin user already exists
        const checkResult = await client.query(
            'SELECT id FROM users WHERE email = $1',
            ['admin@example.com']
        );

        if (checkResult.rows.length > 0) {
            // Update existing user
            const updateResult = await client.query(
                `UPDATE users
                 SET username = $1,
                     password_hash = $2,
                     "Firstname" = $3,
                     "Lastname" = $4,
                     role_id = $5
                 WHERE email = $6
                 RETURNING id, username, email`,
                ['admin', hashedPassword, 'Admin', 'User', 1, 'admin@example.com']
            );
            console.log('Admin user updated:', updateResult.rows[0]);
        } else {
            // Insert new user
            const insertResult = await client.query(
                `INSERT INTO users (username, email, password_hash, "Firstname", "Lastname", role_id, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())
                 RETURNING id, username, email`,
                ['admin', 'admin@example.com', hashedPassword, 'Admin', 'User', 1]
            );
            console.log('Admin user created:', insertResult.rows[0]);
        }

        console.log('\n=================================');
        console.log('Admin credentials:');
        console.log('Email: admin@example.com');
        console.log('Password: Admin@123');
        console.log('=================================\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

createAdminUser();
