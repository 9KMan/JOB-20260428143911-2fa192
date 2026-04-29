import request from "supertest";
import app from "../src/index";

describe("Tenant API", () => {
  describe("GET /api/v1/tenants", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/v1/tenants");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/tenants", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/v1/tenants")
        .send({
          name: "Test Tenant",
          slug: "test-tenant",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Validation", () => {
    it("should validate slug format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          tenantName: "Test Tenant",
          tenantSlug: "Invalid Slug With Spaces",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should require tenant name", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          tenantSlug: "test",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /health", () => {
    it("should return healthy status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/api/v1/unknown");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("not found");
    });
  });
});
