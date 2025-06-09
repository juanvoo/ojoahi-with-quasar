USE ojoahi_db;

-- Insertar usuarios de prueba (contraseñas hasheadas para 'password123')
INSERT IGNORE INTO users (username, email, password, role, name) VALUES
('admin', 'admin@ojoahi.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQSk.LhV9B.S', 'admin', 'Administrador'),
('juan_ciego', 'juan@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQSk.LhV9B.S', 'blind', 'Juan Pérez'),
('maria_voluntaria', 'maria@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQSk.LhV9B.S', 'volunteer', 'María García'),
('carlos_ciego', 'carlos@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQSk.LhV9B.S', 'blind', 'Carlos Rodríguez'),
('ana_voluntaria', 'ana@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQSk.LhV9B.S', 'volunteer', 'Ana López');

-- Actualizar el usuario admin
UPDATE users SET is_admin = TRUE WHERE username = 'admin';

-- Insertar algunas solicitudes de ayuda de ejemplo
INSERT IGNORE INTO help_requests (id, blind_user_id, title, description, date, time, location, priority) VALUES
(1, 2, 'Ayuda con compras', 'Necesito ayuda para hacer la compra semanal en el supermercado', '2024-01-15', '10:00:00', 'Supermercado Mercadona, Calle Mayor 123', 'medium'),
(2, 4, 'Acompañamiento médico', 'Necesito acompañamiento para ir al médico', '2024-01-16', '09:30:00', 'Centro de Salud San Juan', 'high'),
(3, 2, 'Lectura de documentos', 'Necesito ayuda para leer unos documentos importantes', '2024-01-17', '16:00:00', 'Mi domicilio', 'low');

-- Insertar algunas conversaciones de ejemplo
INSERT IGNORE INTO conversations (id, user1_id, user2_id) VALUES
(1, 2, 3),
(2, 4, 5);

-- Insertar algunos mensajes de ejemplo
INSERT IGNORE INTO messages (id, conversation_id, sender_id, receiver_id, content) VALUES
(1, 1, 2, 3, 'Hola María, ¿podrías ayudarme con las compras mañana?'),
(2, 1, 3, 2, 'Hola Juan, por supuesto. ¿A qué hora te viene bien?'),
(3, 1, 2, 3, 'Perfecto, ¿te parece bien a las 10:00?'),
(4, 2, 4, 5, 'Hola Ana, necesito acompañamiento para ir al médico'),
(5, 2, 5, 4, 'Hola Carlos, estaré encantada de ayudarte');

-- Actualizar last_message_id en conversaciones
UPDATE conversations SET last_message_id = 3 WHERE id = 1;
UPDATE conversations SET last_message_id = 5 WHERE id = 2;

-- Insertar algunas notificaciones de ejemplo
INSERT IGNORE INTO notifications (user_id, title, message, type) VALUES
(2, 'Bienvenido a OjoAhi', 'Tu cuenta ha sido creada exitosamente', 'success'),
(3, 'Nueva solicitud disponible', 'Hay una nueva solicitud de ayuda en tu área', 'info'),
(4, 'Solicitud aceptada', 'Tu solicitud de ayuda ha sido aceptada por un voluntario', 'success');

SELECT 'Datos de prueba insertados correctamente' as resultado;
