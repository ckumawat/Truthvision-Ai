const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'chetanmysql', // Default XAMPP/MySQL password is empty
  database: 'truthvision',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection (optional, comment out if DB not available)
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
  connection.release();
});

module.exports = pool;