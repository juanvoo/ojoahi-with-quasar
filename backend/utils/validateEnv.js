import logger from "./logger.js"

export function validateEnv() {
  const required = ["DB_HOST", "DB_USER", "DB_NAME"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    logger.error(`Variables de entorno faltantes: ${missing.join(", ")}`)
    process.exit(1)
  }

  // Warnings for recommended variables
  const recommended = ["SESSION_SECRET", "NODE_ENV"]

  const missingRecommended = recommended.filter((key) => !process.env[key])

  if (missingRecommended.length > 0) {
    logger.warn(`Variables de entorno recomendadas faltantes: ${missingRecommended.join(", ")}`)
  }

  logger.info("✅ Validación de variables de entorno completada")
}
