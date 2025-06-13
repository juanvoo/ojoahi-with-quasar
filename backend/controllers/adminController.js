import pool from "../config/database.js"
import logger from "../utils/logger.js"
import { asyncHandler } from "../middleware/errorHandler.js"

// Dashboard principal del admin
export const getDashboard = asyncHandler(async (req, res) => {
  try {
    // Estadísticas generales
    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'blind' THEN 1 ELSE 0 END) as blind_users,
        SUM(CASE WHEN role = 'volunteer' THEN 1 ELSE 0 END) as volunteers,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_month
      FROM users
    `)

    const [requestStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_requests,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_requests_week
      FROM help_requests
    `)

    const [messageStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT sender_id) as active_senders,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as messages_today
      FROM messages
    `)

    // Actividad reciente
    const [recentActivity] = await pool.execute(`
      SELECT 
        'user_registered' as type,
        username as title,
        'Nuevo usuario registrado' as description,
        created_at
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'help_request' as type,
        title,
        'Nueva solicitud de ayuda' as description,
        created_at
      FROM help_requests 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      ORDER BY created_at DESC
      LIMIT 10
    `)

    res.json({
      success: true,
      stats: {
        users: userStats[0],
        requests: requestStats[0],
        messages: messageStats[0]
      },
      recentActivity
    })
  } catch (error) {
    logger.error("Error en dashboard admin:", error)
    res.status(500).json({
      success: false,
      message: "Error al cargar dashboard"
    })
  }
})

// Gestión de usuarios
export const getUsers = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params = []

    if (role) {
      whereClause += " AND role = ?"
      params.push(role)
    }

    if (status === 'active') {
      whereClause += " AND is_active = 1"
    } else if (status === 'inactive') {
      whereClause += " AND is_active = 0"
    }

    if (search) {
      whereClause += " AND (username LIKE ? OR email LIKE ? OR name LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const [users] = await pool.execute(`
      SELECT 
        id, username, email, name, role, is_active, created_at, updated_at,
        (SELECT COUNT(*) FROM help_requests WHERE blind_user_id = users.id OR volunteer_id = users.id) as total_requests,
        (SELECT COUNT(*) FROM messages WHERE sender_id = users.id) as total_messages
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset])

    const [totalCount] = await pool.execute(`
      SELECT COUNT(*) as count FROM users ${whereClause}
    `, params)

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    })
  } catch (error) {
    logger.error("Error obteniendo usuarios:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios"
    })
  }
})

export const toggleUserStatus = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params
    const { is_active } = req.body

    await pool.execute(
      "UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?",
      [is_active, userId]
    )

    logger.info(`Usuario ${userId} ${is_active ? 'activado' : 'desactivado'} por admin ${req.session.user.id}`)

    res.json({
      success: true,
      message: `Usuario ${is_active ? 'activado' : 'desactivado'} correctamente`
    })
  } catch (error) {
    logger.error("Error cambiando estado de usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error al cambiar estado del usuario"
    })
  }
})

export const verifyUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params
    const { verified } = req.body

    await pool.execute(
      "UPDATE users SET is_verified = ?, updated_at = NOW() WHERE id = ?",
      [verified, userId]
    )

    logger.info(`Usuario ${userId} ${verified ? 'verificado' : 'no verificado'} por admin ${req.session.user.id}`)

    res.json({
      success: true,
      message: `Usuario ${verified ? 'verificado' : 'no verificado'} correctamente`
    })
  } catch (error) {
    logger.error("Error verificando usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error al verificar usuario"
    })
  }
})

// Monitoreo de solicitudes
export const getHelpRequests = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, date_from, date_to } = req.query
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params = []

    if (status) {
      whereClause += " AND hr.status = ?"
      params.push(status)
    }

    if (priority) {
      whereClause += " AND hr.priority = ?"
      params.push(priority)
    }

    if (date_from) {
      whereClause += " AND hr.created_at >= ?"
      params.push(date_from)
    }

    if (date_to) {
      whereClause += " AND hr.created_at <= ?"
      params.push(date_to)
    }

    const [requests] = await pool.execute(`
      SELECT 
        hr.*,
        u1.username as blind_user_name,
        u1.email as blind_user_email,
        u2.username as volunteer_name,
        u2.email as volunteer_email
      FROM help_requests hr
      LEFT JOIN users u1 ON hr.blind_user_id = u1.id
      LEFT JOIN users u2 ON hr.volunteer_id = u2.id
      ${whereClause}
      ORDER BY hr.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset])

    const [totalCount] = await pool.execute(`
      SELECT COUNT(*) as count FROM help_requests hr ${whereClause}
    `, params)

    res.json({
      success: true,
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    })
  } catch (error) {
    logger.error("Error obteniendo solicitudes:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener solicitudes"
    })
  }
})

export const reassignRequest = asyncHandler(async (req, res) => {
  try {
    const { requestId } = req.params
    const { volunteer_id } = req.body

    await pool.execute(
      "UPDATE help_requests SET volunteer_id = ?, status = 'accepted', updated_at = NOW() WHERE id = ?",
      [volunteer_id, requestId]
    )

    // Crear notificación para el nuevo voluntario
    if (volunteer_id) {
      await pool.execute(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
        [volunteer_id, "Solicitud reasignada", "Se te ha asignado una nueva solicitud de ayuda", "help_request"]
      )
    }

    logger.info(`Solicitud ${requestId} reasignada a voluntario ${volunteer_id} por admin ${req.session.user.id}`)

    res.json({
      success: true,
      message: "Solicitud reasignada correctamente"
    })
  } catch (error) {
    logger.error("Error reasignando solicitud:", error)
    res.status(500).json({
      success: false,
      message: "Error al reasignar solicitud"
    })
  }
})

export const updateRequestPriority = asyncHandler(async (req, res) => {
  try {
    const { requestId } = req.params
    const { priority } = req.body

    await pool.execute(
      "UPDATE help_requests SET priority = ?, updated_at = NOW() WHERE id = ?",
      [priority, requestId]
    )

    logger.info(`Prioridad de solicitud ${requestId} cambiada a ${priority} por admin ${req.session.user.id}`)

    res.json({
      success: true,
      message: "Prioridad actualizada correctamente"
    })
  } catch (error) {
    logger.error("Error actualizando prioridad:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar prioridad"
    })
  }
})

// Sistema de reportes
export const getAnalytics = asyncHandler(async (req, res) => {
  try {
    const { period = '30' } = req.query

    // Usuarios por día
    const [userGrowth] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [period])

    // Solicitudes por estado
    const [requestsByStatus] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM help_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY status
    `, [period])

    // Actividad de mensajes
    const [messageActivity] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM messages
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [period])

    // Top voluntarios
    const [topVolunteers] = await pool.execute(`
      SELECT 
        u.username,
        u.name,
        COUNT(hr.id) as completed_requests,
        AVG(r.rating) as avg_rating
      FROM users u
      LEFT JOIN help_requests hr ON u.id = hr.volunteer_id AND hr.status = 'completed'
      LEFT JOIN reviews r ON u.id = r.volunteer_id
      WHERE u.role = 'volunteer'
      GROUP BY u.id
      ORDER BY completed_requests DESC
      LIMIT 10
    `)

    res.json({
      success: true,
      analytics: {
        userGrowth,
        requestsByStatus,
        messageActivity,
        topVolunteers
      }
    })
  } catch (error) {
    logger.error("Error obteniendo analytics:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener analytics"
    })
  }
})

export const exportData = asyncHandler(async (req, res) => {
  try {
    const { type, format = 'json' } = req.query

    let data = []
    let filename = ''

    switch (type) {
      case 'users':
        const [users] = await pool.execute(`
          SELECT id, username, email, name, role, is_active, created_at
          FROM users
          ORDER BY created_at DESC
        `)
        data = users
        filename = `users_export_${new Date().toISOString().split('T')[0]}`
        break

      case 'requests':
        const [requests] = await pool.execute(`
          SELECT 
            hr.*,
            u1.username as blind_user_name,
            u2.username as volunteer_name
          FROM help_requests hr
          LEFT JOIN users u1 ON hr.blind_user_id = u1.id
          LEFT JOIN users u2 ON hr.volunteer_id = u2.id
          ORDER BY hr.created_at DESC
        `)
        data = requests
        filename = `requests_export_${new Date().toISOString().split('T')[0]}`
        break

      default:
        return res.status(400).json({
          success: false,
          message: "Tipo de exportación no válido"
        })
    }

    if (format === 'csv') {
      // Convertir a CSV
      const csv = convertToCSV(data)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`)
      res.send(csv)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`)
      res.json(data)
    }

    logger.info(`Datos exportados: ${type} por admin ${req.session.user.id}`)
  } catch (error) {
    logger.error("Error exportando datos:", error)
    res.status(500).json({
      success: false,
      message: "Error al exportar datos"
    })
  }
})

// Moderación y seguridad
export const getReports = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query
    const offset = (page - 1) * limit

    const [reports] = await pool.execute(`
      SELECT 
        r.*,
        u1.username as reporter_name,
        u2.username as reported_user_name
      FROM reports r
      LEFT JOIN users u1 ON r.reporter_id = u1.id
      LEFT JOIN users u2 ON r.reported_user_id = u2.id
      WHERE r.status = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [status, parseInt(limit), offset])

    const [totalCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM reports WHERE status = ?",
      [status]
    )

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    })
  } catch (error) {
    logger.error("Error obteniendo reportes:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener reportes"
    })
  }
})

export const handleReport = asyncHandler(async (req, res) => {
  try {
    const { reportId } = req.params
    const { action, notes } = req.body // action: 'approve', 'reject', 'investigate'

    await pool.execute(
      "UPDATE reports SET status = ?, admin_notes = ?, handled_by = ?, handled_at = NOW() WHERE id = ?",
      [action, notes, req.session.user.id, reportId]
    )

    // Si se aprueba el reporte, tomar acción contra el usuario reportado
    if (action === 'approve') {
      const [report] = await pool.execute(
        "SELECT reported_user_id, reason FROM reports WHERE id = ?",
        [reportId]
      )

      if (report.length > 0) {
        // Suspender temporalmente al usuario
        await pool.execute(
          "UPDATE users SET is_active = 0, suspension_reason = ? WHERE id = ?",
          [`Reporte aprobado: ${report[0].reason}`, report[0].reported_user_id]
        )

        // Notificar al usuario reportado
        await pool.execute(
          "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
          [
            report[0].reported_user_id,
            "Cuenta suspendida",
            "Tu cuenta ha sido suspendida temporalmente debido a un reporte. Contacta con soporte para más información.",
            "warning"
          ]
        )
      }
    }

    logger.info(`Reporte ${reportId} manejado con acción ${action} por admin ${req.session.user.id}`)

    res.json({
      success: true,
      message: "Reporte manejado correctamente"
    })
  } catch (error) {
    logger.error("Error manejando reporte:", error)
    res.status(500).json({
      success: false,
      message: "Error al manejar reporte"
    })
  }
})

export const getSecurityAlerts = asyncHandler(async (req, res) => {
  try {
    // Detectar actividad sospechosa
    const [suspiciousActivity] = await pool.execute(`
      SELECT 
        'multiple_failed_logins' as type,
        'Múltiples intentos de login fallidos' as title,
        CONCAT('Usuario: ', username) as description,
        'high' as severity,
        NOW() as detected_at
      FROM users u
      WHERE (
        SELECT COUNT(*) FROM login_attempts la 
        WHERE la.user_id = u.id 
        AND la.success = 0 
        AND la.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ) >= 5
      
      UNION ALL
      
      SELECT 
        'spam_messages' as type,
        'Posible spam de mensajes' as title,
        CONCAT('Usuario: ', username, ' - ', COUNT(*), ' mensajes en 1 hora') as description,
        'medium' as severity,
        NOW() as detected_at
      FROM users u
      JOIN messages m ON u.id = m.sender_id
      WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      GROUP BY u.id
      HAVING COUNT(*) >= 50
    `)

    res.json({
      success: true,
      alerts: suspiciousActivity
    })
  } catch (error) {
    logger.error("Error obteniendo alertas de seguridad:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener alertas de seguridad"
    })
  }
})

// Función auxiliar para convertir a CSV
function convertToCSV(data) {
  if (!data.length) return ''
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      }).join(',')
    )
  ].join('\n')
  
  return csvContent
}

export default {
  getDashboard,
  getUsers,
  toggleUserStatus,
  verifyUser,
  getHelpRequests,
  reassignRequest,
  updateRequestPriority,
  getAnalytics,
  exportData,
  getReports,
  handleReport,
  getSecurityAlerts
}