const { getDb, prepare } = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  await getDb(); // Initialize database

  const email = 'admin@veeragroup.com';
  const password = bcrypt.hashSync('admin123', 10);

  const existing = prepare('SELECT * FROM admins WHERE email = ?').get(email);
  if (existing) {
    console.log('Admin already exists:', email);
    return;
  }

  prepare('INSERT INTO admins (email, password, role) VALUES (?, ?, ?)').run(email, password, 'admin');
  console.log('Admin seeded successfully!');
  console.log('Email:', email);
  console.log('Password: admin123');
}

seedAdmin().catch(console.error);
