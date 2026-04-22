import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const bd = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'edutech',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

bd.getConnection()
  .then(c => { console.log('✅ BD edutech conectada'); c.release(); })
  .catch(e => console.error('❌ Error BD:', e.message));

export default bd;
