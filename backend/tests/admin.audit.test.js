const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Admin = require("../admin/models/Admin.model");
const otpStore = require("../utils/otpStore");

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.disconnect();
  await mongoose.connect(uri);
});

afterAll(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  await mongoose.disconnect();
  await mongo.stop();
});

describe("Admin Audit API", () => {
  const adminEmail = "admin@example.com";
  const adminPassword = "AdminPass@123";
  const studentEmail = "auditstudent@example.com";
  const studentPassword = "Student@123";

  beforeAll(async () => {
    await Admin.create({
      name: "System Admin",
      email: adminEmail,
      password: adminPassword,
      role: "superadmin",
    });
  });

  it("allows admin login and read-only audit log access", async () => {
    await request(app).post("/api/auth/register/send-otp").send({
      name: "Audit Student",
      email: studentEmail,
      rollNo: "AUDIT2026",
      mobile: "9998887776",
      password: studentPassword,
    });

    const otp = otpStore.getOtpData("register", studentEmail)?.otp;

    await request(app).post("/api/auth/register/verify-otp").send({
      email: studentEmail,
      otp,
    });

    const adminLoginResponse = await request(app)
      .post("/api/admin/auth/login")
      .send({
        email: adminEmail,
        password: adminPassword,
      });

    expect(adminLoginResponse.statusCode).toBe(200);
    expect(adminLoginResponse.body.token).toBeDefined();

    const adminToken = adminLoginResponse.body.token;

    const summaryResponse = await request(app)
      .get("/api/admin/logs/summary")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryResponse.body.totalLogs).toBeGreaterThan(0);

    const logsResponse = await request(app)
      .get("/api/admin/logs")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({ search: "registration", limit: 10 });

    expect(logsResponse.statusCode).toBe(200);
    expect(logsResponse.body.items.length).toBeGreaterThan(0);

    const logId = logsResponse.body.items[0]._id;
    const detailResponse = await request(app)
      .get(`/api/admin/logs/${logId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body.log._id).toBe(logId);
  });

  it("blocks student tokens from admin log endpoints", async () => {
    const studentLoginResponse = await request(app).post("/api/auth/login").send({
      emailOrRollNo: studentEmail,
      password: studentPassword,
    });

    const studentToken = studentLoginResponse.body.token;

    const response = await request(app)
      .get("/api/admin/logs")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(response.statusCode).toBe(403);
  });
});
