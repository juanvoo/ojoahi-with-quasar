import pool from "../config/database.js"
import bcrypt from "bcrypt"
import logger from "../utils/logger.js"
import dotenv from "dotenv"

dotenv.config()

async function migratePasswords() {
  try {
    logger.info("🔄 Iniciando migración de contraseñas...")

    // Find users with non-hashed passwords
    const [users] = await pool.execute('SELECT id, username, password FROM users WHERE password NOT LIKE "$2%"')

    if (users.length === 0) {
      logger.info("✅ No hay contraseñas para migrar")
      return
    }

    logger.info(`📊 Encontradas ${users.length} contraseñas para migrar`)

    const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12
    let migratedCount = 0

    for (const user of users) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds)

        await pool.execute("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?", [hashedPassword, user.id])

        migratedCount++
        logger.info(`✅ Contraseña migrada para usuario: ${user.username} (ID: ${user.id})`)
      } catch (error) {
        logger.error(`❌ Error migrando contraseña para usuario ${user.username}:`, error)
      }
    }

    logger.info(`🎉 Migración completada. ${migratedCount}/${users.length} contraseñas migradas`)
  } catch (error) {
    logger.error("❌ Error en la migración de contraseñas:", error)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migratePasswords()
}

export default migratePasswords
