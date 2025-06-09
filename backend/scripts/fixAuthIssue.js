import bcrypt from "bcrypt"
import pool from "../config/database.js"
import dotenv from "dotenv"

dotenv.config()

async function fixAuthIssue() {
  console.log("🔧 SOLUCIONANDO PROBLEMA DE AUTENTICACIÓN")
  console.log("==========================================")

  try {
    // 1. Verificar conexión
    console.log("\n1️⃣ Verificando conexión a la base de datos...")
    const connection = await pool.getConnection()
    console.log("✅ Conexión establecida")

    // 2. Limpiar usuarios existentes
    console.log("\n2️⃣ Limpiando usuarios existentes...")
    await connection.execute("DELETE FROM users")
    console.log("✅ Usuarios eliminados")

    // 3. Crear usuarios con contraseñas correctas
    console.log("\n3️⃣ Creando usuarios con contraseñas hasheadas correctamente...")

    const password = "password123"
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log(`🔑 Contraseña original: ${password}`)
    console.log(`🔐 Hash generado: ${hashedPassword}`)

    // Verificar que el hash funciona
    const testVerification = await bcrypt.compare(password, hashedPassword)
    console.log(`🔍 Verificación del hash: ${testVerification ? "✅ CORRECTO" : "❌ INCORRECTO"}`)

    if (!testVerification) {
      throw new Error("El hash generado no es válido")
    }

    // Crear usuarios
    const users = [
      {
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        role: "blind",
        name: "Usuario de Prueba",
      },
      {
        username: "juan_ciego",
        email: "juan@example.com",
        password: hashedPassword,
        role: "blind",
        name: "Juan Pérez",
      },
      {
        username: "maria_voluntaria",
        email: "maria@example.com",
        password: hashedPassword,
        role: "volunteer",
        name: "María García",
      },
      {
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        name: "Administrador",
      },
    ]

    for (const user of users) {
      const [result] = await connection.execute(
        "INSERT INTO users (username, email, password, role, name, is_admin) VALUES (?, ?, ?, ?, ?, ?)",
        [user.username, user.email, user.password, user.role, user.name, user.role === "admin"],
      )

      console.log(`✅ Usuario creado: ${user.username} (ID: ${result.insertId})`)

      // Verificar inmediatamente que el usuario se puede autenticar
      const [checkUser] = await connection.execute("SELECT * FROM users WHERE id = ?", [result.insertId])
      const savedUser = checkUser[0]

      const canAuth = await bcrypt.compare(password, savedUser.password)
      console.log(
        `   🔐 Verificación de autenticación: ${canAuth ? "✅ PUEDE AUTENTICARSE" : "❌ NO PUEDE AUTENTICARSE"}`,
      )
    }

    // 4. Verificar que todos los usuarios pueden autenticarse
    console.log("\n4️⃣ Verificación final de todos los usuarios...")
    const [allUsers] = await connection.execute("SELECT id, username, email, password FROM users")

    for (const user of allUsers) {
      const canAuth = await bcrypt.compare(password, user.password)
      console.log(`👤 ${user.username}: ${canAuth ? "✅ OK" : "❌ FALLO"}`)
    }

    connection.release()
    console.log("\n✅ PROBLEMA SOLUCIONADO")
    console.log("\n📧 Credenciales para todos los usuarios:")
    console.log("   Email: test@example.com, juan@example.com, maria@example.com, admin@example.com")
    console.log("   Contraseña: password123")
  } catch (error) {
    console.error("❌ ERROR:", error)
  } finally {
    await pool.end()
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAuthIssue().catch(console.error)
}

export default fixAuthIssue
