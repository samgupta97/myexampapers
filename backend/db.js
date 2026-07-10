// =============================================
// Database Connection Pool (mysql2)
// =============================================

var mysql = require('mysql2');
var dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// Create a connection pool
var pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'myexampapers',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the pool with .promise() so we can use .then()/.catch()
module.exports = pool.promise();
