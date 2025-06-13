import express from "express"
import session from "express-session"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import dotenv from "dotenv"

// Import utilities and middleware
import logger from "./utils/logger.js"
import { errorHandler, notFound } from "./middleware/errorHandler.js"
import { validateEnv } from "./utils/validateEnv.js"

// Import routes
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import chatRoutes from "./routes/chat.js"
import helpRequestRoutes from "./routes/helpRequests.js"
import reservationRoutes from "./routes/reservations.js"
import reviewRoutes from "./routes/reviews.js"
import supportRoutes from "./routes/support.js"
import notificationRoutes from "./routes/notifications.js"
import adminRoutes from "./routes/admin.js"

// Load environment variables
dotenv.config()

// Validate environment variables
validateEnv()

const app = express()
const httpServer = createServer(app)

// Security middleware - DESACTIVADO en desarrollo
if (process.env.NODE_ENV === "production") {
  app.use(helmet())
}

app.use(compression())

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "http://localhost:9000" : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || "desarrollo-secret-key-no-segura"

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: "ojoahi.sid",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
    rolling: true,
  }),
)

// Static files
app.use("/public", express.static("public"))

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/help-requests", helpRequestRoutes)
app.use("/api/reservations", reservationRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/support", supportRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/admin", adminRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  })
})

// Current user endpoint
app.get("/api/auth/user", (req, res) => {
  if (req.session?.user) {
    res.json({
      success: true,
      user: {
        id: req.session.user.id,
        username: req.session.user.username,
        email: req.session.user.email,
        role: req.session.user.role,
        is_admin: req.session.user.is_admin,
      },
    })
  } else {
    res.status(401).json({
      success: false,
      message: "No autenticado",
    })
  }
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "http://localhost:9000" : true,
    credentials: true,
  },
})

// Socket.IO connection handling
io.on("connection", (socket) => {
  logger.info(`Socket.IO: Client connected - ${socket.id}`)

  socket.on("user-online", (userId) => {
    socket.data.userId = userId
    socket.join(`user-${userId}`)
    io.emit("user-status", { userId, status: "online" })
    logger.info(`User ${userId} connected`)
  })

  socket.on("join-chat", (chatId) => {
    socket.join(`chat-${chatId}`)
    logger.info(`User joined chat ${chatId}`)
  })

  socket.on("disconnect", () => {
    logger.info(`Socket.IO: Client disconnected - ${socket.id}`)
    if (socket.data?.userId) {
      io.emit("user-status", {
        userId: socket.data.userId,
        status: "offline",
      })
    }
  })
})

// Make io available to routes
app.set("io", io)

// Start server
const PORT = process.env.PORT || 8000 // Cambiado de 3000 a 8000
httpServer.listen(PORT, () => {
  logger.info(`🚀 OjoAhi server started on port ${PORT}`)
  logger.info(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:9000"}`)
  logger.info(`🔒 Mode: ${process.env.NODE_ENV || "development"}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Closing server...")
  httpServer.close(() => {
    logger.info("Server closed successfully")
    process.exit(0)
  })
})

export default app