import Joi from "joi"

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
      "string.alphanum": "El nombre de usuario solo puede contener letras y números",
      "string.min": "El nombre de usuario debe tener al menos 3 caracteres",
      "string.max": "El nombre de usuario no puede tener más de 30 caracteres",
      "any.required": "El nombre de usuario es requerido",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Debe ser un email válido",
      "any.required": "El email es requerido",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "La contraseña debe tener al menos 6 caracteres",
      "any.required": "La contraseña es requerida",
    }),
    role: Joi.string().valid("blind", "volunteer").required().messages({
      "any.only": "El rol debe ser 'blind' o 'volunteer'",
      "any.required": "El rol es requerido",
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Debe ser un email válido",
      "any.required": "El email es requerido",
    }),
    password: Joi.string().required().messages({
      "any.required": "La contraseña es requerida",
    }),
  }),

  updateProfile: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional(),
    name: Joi.string().max(100).optional().allow(""),
    email: Joi.string().email().optional(),
    phone: Joi.string().max(20).optional().allow(""),
    address: Joi.string().max(255).optional().allow(""),
    bio: Joi.string().max(500).optional().allow(""),
    availability: Joi.string().max(255).optional().allow(""),
    profile_image: Joi.string().uri().optional().allow(""),
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required().messages({
      "any.required": "La contraseña actual es requerida",
    }),
    new_password: Joi.string().min(6).required().messages({
      "string.min": "La nueva contraseña debe tener al menos 6 caracteres",
      "any.required": "La nueva contraseña es requerida",
    }),
  }),
}

// Help request validation schemas
export const helpRequestSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(100).required().messages({
      "string.min": "El título debe tener al menos 5 caracteres",
      "string.max": "El título no puede tener más de 100 caracteres",
      "any.required": "El título es requerido",
    }),
    description: Joi.string().min(10).max(1000).required().messages({
      "string.min": "La descripción debe tener al menos 10 caracteres",
      "string.max": "La descripción no puede tener más de 1000 caracteres",
      "any.required": "La descripción es requerida",
    }),
    location: Joi.string().min(5).max(255).required().messages({
      "string.min": "La ubicación debe tener al menos 5 caracteres",
      "string.max": "La ubicación no puede tener más de 255 caracteres",
      "any.required": "La ubicación es requerida",
    }),
    date: Joi.date().min("now").required().messages({
      "date.min": "La fecha debe ser futura",
      "any.required": "La fecha es requerida",
    }),
    time: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.pattern.base": "La hora debe tener el formato HH:MM",
        "any.required": "La hora es requerida",
      }),
    category: Joi.string().valid("acompanamiento", "compras", "lectura", "tramites", "otro").required().messages({
      "any.only": "La categoría debe ser una de las opciones válidas",
      "any.required": "La categoría es requerida",
    }),
    notes: Joi.string().max(500).optional().allow("").messages({
      "string.max": "Las notas no pueden tener más de 500 caracteres",
    }),
  }),

  update: Joi.object({
    title: Joi.string().min(5).max(100).optional(),
    description: Joi.string().min(10).max(1000).optional(),
    location: Joi.string().min(5).max(255).optional(),
    date: Joi.date().min("now").optional(),
    time: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    category: Joi.string().valid("acompanamiento", "compras", "lectura", "tramites", "otro").optional(),
    notes: Joi.string().max(500).optional().allow(""),
    status: Joi.string().valid("pending", "accepted", "in_progress", "completed", "cancelled").optional(),
  }),
}

// Message validation schemas
export const messageSchemas = {
  send: Joi.object({
    receiver_id: Joi.number().integer().positive().required().messages({
      "number.base": "El ID del receptor debe ser un número",
      "number.integer": "El ID del receptor debe ser un número entero",
      "number.positive": "El ID del receptor debe ser positivo",
      "any.required": "El ID del receptor es requerido",
    }),
    content: Joi.string().min(1).max(1000).required().messages({
      "string.min": "El mensaje no puede estar vacío",
      "string.max": "El mensaje no puede tener más de 1000 caracteres",
      "any.required": "El contenido del mensaje es requerido",
    }),
    conversation_id: Joi.number().integer().positive().optional(),
  }),
}

// Reservation validation schemas
export const reservationSchemas = {
  create: Joi.object({
    help_request_id: Joi.number().integer().positive().required().messages({
      "number.base": "El ID de la solicitud debe ser un número",
      "number.integer": "El ID de la solicitud debe ser un número entero",
      "number.positive": "El ID de la solicitud debe ser positivo",
      "any.required": "El ID de la solicitud es requerido",
    }),
    notes: Joi.string().max(500).optional().allow(""),
  }),

  update: Joi.object({
    status: Joi.string().valid("pending", "accepted", "rejected", "completed", "cancelled").required(),
    notes: Joi.string().max(500).optional().allow(""),
  }),
}

// Review validation schemas
export const reviewSchemas = {
  create: Joi.object({
    reservation_id: Joi.number().integer().positive().required(),
    volunteer_id: Joi.number().integer().positive().required(),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      "number.min": "La calificación debe ser entre 1 y 5",
      "number.max": "La calificación debe ser entre 1 y 5",
      "any.required": "La calificación es requerida",
    }),
    comment: Joi.string().max(500).optional().allow(""),
  }),
}

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }))

      return res.status(400).json({
        success: false,
        message: "Errores de validación",
        errors,
      })
    }

    next()
  }
}
