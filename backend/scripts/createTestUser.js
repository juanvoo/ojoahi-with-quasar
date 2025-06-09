import bcrypt from "bcrypt"
import pool from "../config/database.js"
import logger from "../utils/logger.js"
import dotenv from "dotenv"

dotenv.config()

async function createTestUser() {
  try {
    logger.info("🔄 Creando usuario de prueba...")

    const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12
    const password = "password123"
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    logger.info(`Hash generado: ${hashedPassword}`)

    // Eliminar usuario existente si existe
    await pool.execute("DELETE FROM users WHERE email = ?", ["test@example.com"])

    // Crear nuevo usuario
    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password, role, name) VALUES (?, ?, ?, ?, ?)",
      ["testuser", "test@example.com", hashedPassword, "blind", "Usuario de Prueba"],
    )

    logger.info(`✅ Usuario de prueba creado con ID: ${result.insertId}`)
    logger.info("📧 Email: test@example.com")
    logger.info("🔑 Contraseña: password123")

    // Verificar que el usuario se puede autenticar
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", ["test@example.com"])
    const user = users[0]

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password)
      logger.info(`🔍 Verificación de contraseña: ${isMatch ? "✅ CORRECTA" : "❌ INCORRECTA"}`)
    }
  } catch (error) {
    logger.error("❌ Error creando usuario de prueba:", error)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUser()
}

export default createTestUser
