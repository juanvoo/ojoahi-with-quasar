import mysql from "mysql2/promise"
import dotenv from "dotenv"
import logger from "../utils/logger.js"

dotenv.config()

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ojoahi_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: "utf8mb4",
}

const pool = mysql.createPool(config)

// Test database connection
async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection()
    logger.info("✅ Conexión a la base de datos establecida correctamente")
    connection.release()
  } catch (error) {
    logger.error("❌ Error al conectar a la base de datos:", error)
    throw error
  }
}

// Initialize database connection check
checkDatabaseConnection()

// Handle pool errors
pool.on("connection", (connection) => {
  logger.info(`Nueva conexión establecida como id ${connection.threadId}`)
})

pool.on("error", (err) => {
  logger.error("Error en el pool de conexiones:", err)
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    checkDatabaseConnection()
  } else {
    throw err
  }
})

export default pool
