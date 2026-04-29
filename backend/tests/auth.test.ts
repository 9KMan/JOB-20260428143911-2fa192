import request from "supertest";
import app from "../src/index";

describe("Auth API", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should return validation error for invalid email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "invalid-email",
          password: "password123",
          tenantName: "Test Tenant",
          tenantSlug: "test-tenant",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return validation error for short password", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "test@example.com",
          password: "short",
          tenantName: "Test Tenant",
          tenantSlug: "test-tenant",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid slug", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          tenantName: "Test Tenant",
          tenantSlug: "Invalid Slug",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should return validation error for missing credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid email format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "not-an-email",
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("should return validation error for missing refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /health", () => {
    it("should return healthy status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe("healthy");
    });
  });
});
