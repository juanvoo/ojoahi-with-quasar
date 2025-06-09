import pool from "../config/database.js"
import logger from "./logger.js"

/**
 * Utilidad para diagnosticar problemas en el sistema de chat
 */
export const debugChat = async () => {
  try {
    logger.info("🔍 Iniciando diagnóstico del sistema de chat...")

    // 1. Verificar si existen las tablas necesarias
    logger.info("📊 Verificando tablas de chat...")
    const [tables] = await pool.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('conversations', 'messages', 'notifications')
    `)

    const tableNames = tables.map((t) => t.table_name)
    logger.info(`📋 Tablas encontradas: ${tableNames.join(", ")}`)

    const missingTables = ["conversations", "messages", "notifications"].filter((t) => !tableNames.includes(t))

    if (missingTables.length > 0) {
      logger.error(`❌ Tablas faltantes: ${missingTables.join(", ")}`)
      return {
        success: false,
        error: `Faltan tablas: ${missingTables.join(", ")}`,
        solution: "Ejecutar el script scripts/05-create-chat-tables.sql",
      }
    }

    // 2. Verificar estructura de las tablas
    logger.info("🏗️ Verificando estructura de tablas...")

    // Verificar conversations
    const [conversationsColumns] = await pool.execute(`
      SHOW COLUMNS FROM conversations
    `)

    const conversationColumnNames = conversationsColumns.map((c) => c.Field)
    logger.info(`📋 Columnas en conversations: ${conversationColumnNames.join(", ")}`)

    // Verificar messages
    const [messagesColumns] = await pool.execute(`
      SHOW COLUMNS FROM messages
    `)

    const messageColumnNames = messagesColumns.map((c) => c.Field)
    logger.info(`📋 Columnas en messages: ${messageColumnNames.join(", ")}`)

    // 3. Verificar datos existentes
    logger.info("🔢 Verificando datos existentes...")

    const [conversationsCount] = await pool.execute(`
      SELECT COUNT(*) as count FROM conversations
    `)

    const [messagesCount] = await pool.execute(`
      SELECT COUNT(*) as count FROM messages
    `)

    logger.info(`📊 Conversaciones: ${conversationsCount[0].count}, Mensajes: ${messagesCount[0].count}`)

    // 4. Verificar integridad referencial
    if (messagesCount[0].count > 0) {
      logger.info("🔗 Verificando integridad referencial...")

      const [orphanedMessages] = await pool.execute(`
        SELECT COUNT(*) as count FROM messages m
        LEFT JOIN conversations c ON m.conversation_id = c.id
        WHERE c.id IS NULL
      `)

      if (orphanedMessages[0].count > 0) {
        logger.error(`❌ Se encontraron ${orphanedMessages[0].count} mensajes huérfanos`)
      } else {
        logger.info("✅ No se encontraron mensajes huérfanos")
      }
    }

    // 5. Verificar últimos mensajes
    if (messagesCount[0].count > 0) {
      logger.info("📝 Últimos 5 mensajes:")

      const [lastMessages] = await pool.execute(`
        SELECT m.id, m.conversation_id, m.sender_id, m.receiver_id, 
               LEFT(m.content, 30) as content_preview, m.is_read, 
               m.created_at, u.username as sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        ORDER BY m.created_at DESC
        LIMIT 5
      `)

      lastMessages.forEach((msg) => {
        logger.info(
          `📨 ID: ${msg.id}, De: ${msg.sender_name}, Leído: ${msg.is_read ? "Sí" : "No"}, Contenido: ${msg.content_preview}...`,
        )
      })
    }

    // 6. Verificar última conversación
    if (conversationsCount[0].count > 0) {
      logger.info("💬 Última conversación:")

      const [lastConversation] = await pool.execute(`
        SELECT c.id, c.user1_id, c.user2_id, c.last_message_id, c.created_at,
               u1.username as user1_name, u2.username as user2_name
        FROM conversations c
        JOIN users u1 ON c.user1_id = u1.id
        JOIN users u2 ON c.user2_id = u2.id
        ORDER BY c.updated_at DESC
        LIMIT 1
      `)

      if (lastConversation.length > 0) {
        const conv = lastConversation[0]
        logger.info(`💬 ID: ${conv.id}, Entre: ${conv.user1_name} y ${conv.user2_name}, Creada: ${conv.created_at}`)

        // Verificar mensajes de esta conversación
        const [conversationMessages] = await pool.execute(
          `
          SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?
        `,
          [conv.id],
        )

        logger.info(`📨 Mensajes en esta conversación: ${conversationMessages[0].count}`)
      }
    }

    return {
      success: true,
      tables: tableNames,
      conversationsCount: conversationsCount[0].count,
      messagesCount: messagesCount[0].count,
    }
  } catch (error) {
    logger.error("❌ Error durante el diagnóstico del chat:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Corrige problemas comunes en el sistema de chat
 */
export const fixChatIssues = async () => {
  try {
    logger.info("🔧 Iniciando corrección de problemas del chat...")

    // 1. Actualizar last_message_id en conversaciones
    logger.info("🔄 Actualizando last_message_id en conversaciones...")

    await pool.execute(`
      UPDATE conversations c
      SET last_message_id = (
        SELECT MAX(id) FROM messages 
        WHERE conversation_id = c.id
      )
      WHERE EXISTS (
        SELECT 1 FROM messages 
        WHERE conversation_id = c.id
      )
    `)

    // 2. Marcar mensajes huérfanos como leídos
    logger.info("👁️ Marcando mensajes huérfanos como leídos...")

    await pool.execute(`
      UPDATE messages m
      LEFT JOIN conversations c ON m.conversation_id = c.id
      SET m.is_read = TRUE
      WHERE c.id IS NULL
    `)

    // 3. Verificar y corregir fechas
    logger.info("📅 Verificando y corrigiendo fechas...")

    await pool.execute(`
      UPDATE messages
      SET created_at = NOW()
      WHERE created_at IS NULL
    `)

    await pool.execute(`
      UPDATE conversations
      SET created_at = NOW(), updated_at = NOW()
      WHERE created_at IS NULL OR updated_at IS NULL
    `)

    logger.info("✅ Correcciones aplicadas con éxito")

    return {
      success: true,
      message: "Correcciones aplicadas con éxito",
    }
  } catch (error) {
    logger.error("❌ Error durante la corrección de problemas:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Crea una conversación de prueba entre dos usuarios
 */
export const createTestConversation = async (user1Id, user2Id, messageContent = "Mensaje de prueba") => {
  try {
    logger.info(`🧪 Creando conversación de prueba entre usuarios ${user1Id} y ${user2Id}...`)

    // 1. Verificar que los usuarios existan
    const [users] = await pool.execute(
      `
      SELECT id, username FROM users WHERE id IN (?, ?)
    `,
      [user1Id, user2Id],
    )

    if (users.length !== 2) {
      logger.error("❌ No se encontraron ambos usuarios")
      return {
        success: false,
        error: "No se encontraron ambos usuarios",
      }
    }

    // 2. Verificar si ya existe una conversación
    const [existingConv] = await pool.execute(
      `
      SELECT id FROM conversations 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `,
      [user1Id, user2Id, user2Id, user1Id],
    )

    let conversationId

    if (existingConv.length > 0) {
      conversationId = existingConv[0].id
      logger.info(`📝 Usando conversación existente: ${conversationId}`)
    } else {
      // 3. Crear nueva conversación
      const [result] = await pool.execute(
        `
        INSERT INTO conversations (user1_id, user2_id, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
      `,
        [Math.min(user1Id, user2Id), Math.max(user1Id, user2Id)],
      )

      conversationId = result.insertId
      logger.info(`🆕 Nueva conversación creada: ${conversationId}`)
    }

    // 4. Crear mensaje de prueba
    const [messageResult] = await pool.execute(
      `
      INSERT INTO messages (conversation_id, sender_id, receiver_id, content, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `,
      [conversationId, user1Id, user2Id, messageContent],
    )

    // 5. Actualizar last_message_id
    await pool.execute(
      `
      UPDATE conversations SET last_message_id = ?, updated_at = NOW()
      WHERE id = ?
    `,
      [messageResult.insertId, conversationId],
    )

    logger.info(`✅ Mensaje de prueba creado: ${messageResult.insertId}`)

    return {
      success: true,
      conversationId,
      messageId: messageResult.insertId,
    }
  } catch (error) {
    logger.error("❌ Error al crear conversación de prueba:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}
