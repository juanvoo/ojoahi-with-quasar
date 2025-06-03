import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';

// Para __dirname y __filename en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});