import bcrypt from "bcrypt"
import pool from "../config/database.js"
import dotenv from "dotenv"

dotenv.config()

async function diagnoseAuth() {
  console.log("🔍 DIAGNÓSTICO DE AUTENTICACIÓN")
  console.log("==============================")

  try {
    // 1. Verificar conexión a la base de datos
    console.log("\n1️⃣ Verificando conexión a la base de datos...")
    const connection = await pool.getConnection()
    console.log("✅ Conexión a la base de datos establecida correctamente")

    // 2. Verificar usuarios en la base de datos
    console.log("\n2️⃣ Verificando usuarios en la base de datos...")
    const [users] = await connection.execute("SELECT id, username, email, password, role FROM users LIMIT 10")

    if (users.length === 0) {
      console.log("❌ No hay usuarios en la base de datos")
    } else {
      console.log(`✅ Se encontraron ${users.length} usuarios`)

      // 3. Verificar contraseñas
      console.log("\n3️⃣ Verificando contraseñas...")
      const testPassword = "password123"

      for (const user of users) {
        console.log(`\n👤 Usuario: ${user.username} (${user.email})`)
        console.log(`🔑 Hash almacenado: ${user.password}`)

        try {
          // Verificar si es un hash de bcrypt válido
          const isBcrypt = user.password.startsWith("$2")
          console.log(`🔍 ¿Es hash bcrypt? ${isBcrypt ? "Sí" : "No"}`)

          if (isBcrypt) {
            // Intentar verificar con la contraseña de prueba
            const isMatch = await bcrypt.compare(testPassword, user.password)
            console.log(`🔐 Verificación con 'password123': ${isMatch ? "✅ CORRECTA" : "❌ INCORRECTA"}`)

            // Si no coincide, crear un hash nuevo para mostrar cómo debería ser
            if (!isMatch) {
              const newHash = await bcrypt.hash(testPassword, 12)
              console.log(`💡 Hash correcto para 'password123': ${newHash}`)

              // Actualizar la contraseña si se confirma
              const updatePassword = true // Cambiar a false para no actualizar
              if (updatePassword) {
                await connection.execute("UPDATE users SET password = ? WHERE id = ?", [newHash, user.id])
                console.log(`✅ Contraseña actualizada para ${user.username}`)
              }
            }
          } else {
            // Si no es bcrypt, hashear y actualizar
            const newHash = await bcrypt.hash(testPassword, 12)
            console.log(`💡 Generando nuevo hash: ${newHash}`)

            await connection.execute("UPDATE users SET password = ? WHERE id = ?", [newHash, user.id])
            console.log(`✅ Contraseña actualizada para ${user.username}`)
          }
        } catch (error) {
          console.log(`❌ Error verificando contraseña: ${error.message}`)
        }
      }
    }

    // 4. Crear un usuario de prueba garantizado
    console.log("\n4️⃣ Creando usuario de prueba garantizado...")
    const testUser = {
      username: "testuser",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 12),
      role: "blind",
      name: "Usuario de Prueba",
    }

    // Eliminar si existe
    await connection.execute("DELETE FROM users WHERE email = ?", [testUser.email])

    // Crear nuevo
    await connection.execute("INSERT INTO users (username, email, password, role, name) VALUES (?, ?, ?, ?, ?)", [
      testUser.username,
      testUser.email,
      testUser.password,
      testUser.role,
      testUser.name,
    ])

    console.log(`✅ Usuario de prueba creado: ${testUser.email} / password123`)

    // Liberar conexión
    connection.release()
  } catch (error) {
    console.error("❌ ERROR EN DIAGNÓSTICO:", error)
  } finally {
    // Cerrar pool
    await pool.end()
    console.log("\n✅ Diagnóstico completado")
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  diagnoseAuth().catch(console.error)
}

export default diagnoseAuth
