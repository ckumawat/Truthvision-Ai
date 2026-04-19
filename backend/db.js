const mysql = require('mysql2');

// Connection pool with Environment Variables
const pool = mysql.createPool({
  // Railway par ye values process.env se aayengi, 
  // laptop par ye default 'localhost' aur 'root' use karega.
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'chetanmysql',
  database: process.env.MYSQLDATABASE || 'truthvision',
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Use promise wrapper for async/await (Modern and cleaner)
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to MySQL database!');
  connection.release();
});

module.exports = promisePool;