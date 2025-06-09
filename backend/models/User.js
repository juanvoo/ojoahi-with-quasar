import pool from "../config/database.js"
import bcrypt from "bcrypt"
import logger from "../utils/logger.js"

class User {
  static async create({ username, email, password, role, user_type }) {
    try {
      const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      logger.info(`🔐 Creando usuario con hash: ${hashedPassword.substring(0, 20)}...`)

      const [result] = await pool.execute(
        "INSERT INTO users (username, email, password, role, user_type, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [username, email, hashedPassword, role, user_type || role],
      )

      logger.info(`✅ Usuario creado: ${username} (ID: ${result.insertId})`)
      return result.insertId
    } catch (error) {
      logger.error("❌ Error al crear usuario:", error)
      throw error
    }
  }

  static async findByEmail(email) {
    try {
      logger.info(`🔍 Buscando usuario por email: ${email}`)

      const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email])
      const user = rows[0]

      if (user) {
        logger.info(`👤 Usuario encontrado: ${user.username} (ID: ${user.id})`)
        logger.info(`🔑 Hash almacenado: ${user.password}`)
      } else {
        logger.info(`❌ No se encontró usuario con email: ${email}`)
      }

      return user
    } catch (error) {
      logger.error("❌ Error al buscar usuario por email:", error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, username, email, role, 
                IFNULL(name, '') as name,
                IFNULL(phone, '') as phone, 
                IFNULL(address, '') as address,
                IFNULL(bio, '') as bio,
                IFNULL(availability, '') as availability,
                IFNULL(profile_image, '') as profile_image,
                is_admin,
                created_at, updated_at
         FROM users 
         WHERE id = ?`,
        [id],
      )

      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      logger.error("❌ Error al buscar usuario por ID:", error)
      throw error
    }
  }

  static async findByIdWithPassword(id) {
    try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id])
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      logger.error("❌ Error al buscar usuario con contraseña:", error)
      throw error
    }
  }

  static async getVolunteers() {
    try {
      const [rows] = await pool.execute(
        `SELECT id, username, name, bio, profile_image, 
                (SELECT AVG(rating) FROM reviews WHERE volunteer_id = users.id) as avg_rating,
                (SELECT COUNT(*) FROM reviews WHERE volunteer_id = users.id) as review_count
         FROM users 
         WHERE role = 'volunteer' 
         ORDER BY username`,
      )
      return rows
    } catch (error) {
      logger.error("❌ Error al obtener voluntarios:", error)
      throw error
    }
  }

  static async updateProfile(userId, userData) {
    try {
      const { username, name, email, phone, address, bio, availability } = userData

      // Check for unique constraints
      if (email) {
        const [emailCheck] = await pool.execute("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId])
        if (emailCheck.length > 0) {
          throw new Error("El email ya está en uso por otro usuario")
        }
      }

      if (username) {
        const [usernameCheck] = await pool.execute("SELECT id FROM users WHERE username = ? AND id != ?", [
          username,
          userId,
        ])
        if (usernameCheck.length > 0) {
          throw new Error("El nombre de usuario ya está en uso")
        }
      }

      // Build dynamic update query
      const updateFields = []
      const params = []

      if (username) {
        updateFields.push("username = ?")
        params.push(username)
      }
      if (name !== undefined) {
        updateFields.push("name = ?")
        params.push(name)
      }
      if (email) {
        updateFields.push("email = ?")
        params.push(email)
      }
      if (phone !== undefined) {
        updateFields.push("phone = ?")
        params.push(phone)
      }
      if (address !== undefined) {
        updateFields.push("address = ?")
        params.push(address)
      }
      if (bio !== undefined) {
        updateFields.push("bio = ?")
        params.push(bio)
      }
      if (availability !== undefined) {
        updateFields.push("availability = ?")
        params.push(availability)
      }

      if (updateFields.length === 0) {
        return await this.findById(userId)
      }

      updateFields.push("updated_at = NOW()")
      params.push(userId)

      const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`
      await pool.execute(sql, params)

      logger.info(`✅ Perfil actualizado para usuario ID: ${userId}`)
      return await this.findById(userId)
    } catch (error) {
      logger.error("❌ Error al actualizar perfil:", error)
      throw error
    }
  }

  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.findByIdWithPassword(userId)
      if (!user) {
        throw new Error("Usuario no encontrado")
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) {
        throw new Error("La contraseña actual es incorrecta")
      }

      // Hash new password
      const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

      // Update password
      await pool.execute("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?", [hashedPassword, userId])

      logger.info(`✅ Contraseña cambiada para usuario ID: ${userId}`)
      return true
    } catch (error) {
      logger.error("❌ Error al cambiar contraseña:", error)
      throw error
    }
  }

  static async updateProfileImage(userId, imagePath) {
    try {
      await pool.execute("UPDATE users SET profile_image = ?, updated_at = NOW() WHERE id = ?", [imagePath, userId])

      logger.info(`✅ Imagen de perfil actualizada para usuario ID: ${userId}`)
      return await this.findById(userId)
    } catch (error) {
      logger.error("❌ Error al actualizar imagen de perfil:", error)
      throw error
    }
  }

  // Migration method for legacy passwords
  static async migratePassword(userId, plainPassword) {
    try {
      const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)

      await pool.execute("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?", [hashedPassword, userId])

      logger.info(`✅ Contraseña migrada para usuario ID: ${userId}`)
      return true
    } catch (error) {
      logger.error("❌ Error al migrar contraseña:", error)
      throw error
    }
  }

  static async getStats(userId) {
    try {
      const [reservations] = await pool.execute(
        'SELECT COUNT(*) as total FROM reservations WHERE volunteer_id = ? AND status = "completed"',
        [userId],
      )

      const [reviews] = await pool.execute(
        "SELECT COUNT(*) as total, AVG(rating) as average FROM reviews WHERE volunteer_id = ?",
        [userId],
      )

      return {
        totalReservations: reservations[0].total || 0,
        totalReviews: reviews[0].total || 0,
        averageRating: reviews[0].average ? Number.parseFloat(reviews[0].average).toFixed(1) : "0.0",
      }
    } catch (error) {
      logger.error("❌ Error al obtener estadísticas:", error)
      throw error
    }
  }
}

export default User
