
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'farmago',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async function init(){
  try{
    const sqlPath = path.join(__dirname, 'init_tables.sql');
    if(fs.existsSync(sqlPath)){
      const sql = fs.readFileSync(sqlPath, 'utf8');
      const conn = await pool.getConnection();
      await conn.query(sql);
      conn.release();
      console.log('DB: auxiliary tables ensured.');
    }
  }catch(err){
    console.error('DB init error:', err.message);
  }
})();

module.exports = pool;
