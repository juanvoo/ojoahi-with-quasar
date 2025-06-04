import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import { Server } from "socket.io";
import { createServer } from 'http';
import cors from 'cors';

// Para __dirname y __filename en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(session({
  secret: 'tu_secreto_super_secreto', // cambia esto por algo seguro en producción
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Usa true SOLO si tienes https
}));
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: 'http://localhost:9000', credentials: true }));

// Rutas
app.use('/api/auth', authRoutes);

// Endpoint autenticado para obtener el usuario actual
app.get('/api/auth/user', (req, res) => {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'No autenticado' });
  }
});

// Servidor y socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:9000', // Usa el puerto de tu frontend Quasar
    credentials: true,
  }
});

// WebSocket: Estado online/offline
io.on('connection', (socket) => {
  console.log('Socket.IO: Cliente conectado');
  socket.on('user-online', (userId) => {
    socket.data.userId = userId;
    io.emit('user-status', { userId, status: 'online' });
  });
  socket.on('disconnect', () => {
    console.log('Socket.IO: Cliente desconectado');
    if (socket.data && socket.data.userId) {
      io.emit('user-status', { userId: socket.data.userId, status: 'offline' });
    }
  });
});


// ¡IMPORTANTE! Escucha con httpServer, no app.listen
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});