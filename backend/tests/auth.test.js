import request from "supertest"
import app from "../app.js"

describe("Auth Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user with valid data", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "Test123456",
        role: "blind",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe("Usuario registrado exitosamente")
    })

    it("should reject registration with invalid email", async () => {
      const userData = {
        username: "testuser",
        email: "invalid-email",
        password: "Test123456",
        role: "blind",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it("should reject registration with weak password", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "123",
        role: "blind",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      // First register a user
      await request(app).post("/api/auth/register").send({
        username: "logintest",
        email: "login@example.com",
        password: "Test123456",
        role: "volunteer",
      })

      // Then login
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "Test123456",
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.user).toBeDefined()
      expect(response.body.user.email).toBe("login@example.com")
    })

    it("should reject login with invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "wrongpassword",
        })
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const response = await request(app).post("/api/auth/logout").expect(200)

      expect(response.body.success).toBe(true)
    })
  })
})
