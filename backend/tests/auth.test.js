// tests/fullSystem.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Student = require("../models/Student");
const otpStore = require("../utils/otpStore");

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.disconnect(); // ⛔ Disconnect any existing connection first
  await mongoose.connect(uri); // ✅ Fresh clean connection
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (let key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("Full Character Certificate System Flow", () => {
  const email = "testuser@example.com";
  const password = "Test@1234";
  let token;

  it("should send OTP for registration", async () => {
    const res = await request(app).post("/api/auth/register/send-otp").send({
      name: "Test User",
      email,
      rollNo: "ROLL2025001",
      mobile: "9876543210",
      password
    });

    console.log("RESPONSE (Register OTP):", res.body);
    expect(res.statusCode).toBe(200);
  });

  it("should verify OTP and register student", async () => {
    const otp = otpStore.getOtpData(email)?.otp;
    const res = await request(app).post("/api/auth/register/verify-otp").send({ email, otp });

    console.log("RESPONSE (Verify OTP):", res.body);
    expect(res.statusCode).toBe(201);
  });

  it("should login student and get JWT token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      emailOrRollNo: email,
      password
    });

    console.log("RESPONSE (Login):", res.body);
    expect(res.statusCode).toBe(200);
    token = res.body.token;
    expect(token).toBeDefined();
  });

  it("should send OTP for forgot password", async () => {
    const res = await request(app).post("/api/auth/forgot-password/send-otp").send({ email });

    console.log("RESPONSE (Forgot Password OTP):", res.body);
    expect(res.statusCode).toBe(200);
  });

  it("should reset password after verifying OTP", async () => {
    const otp = otpStore.getOtpData(email)?.otp;
    const res = await request(app).post("/api/auth/forgot-password/verify-otp").send({
      email,
      otp,
      newPassword: "NewTest@123"
    });

    console.log("RESPONSE (Reset Password):", res.body);
    expect(res.statusCode).toBe(200);
  });

  it("should login with new password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      emailOrRollNo: email,
      password: "NewTest@123"
    });

    console.log("RESPONSE (Login with New Password):", res.body);
    expect(res.statusCode).toBe(200);
  });

  it("should apply for a certificate", async () => {
    const res = await request(app)
      .post("/api/student/apply")
      .set("Authorization", `Bearer ${token}`)
      .field("gender", "Male")
      .field("maritalStatus", "Single")
      .field("careOf", "Father")
      .field("course", "B.Tech")
      .field("school", "Engineering")
      .field("department", "Computer Science")
      .field("academicSession", "2020-2024")
      .attach("aadhaar", Buffer.from("fake-aadhaar"), "aadhaar.pdf")
      .attach("marksheet", Buffer.from("fake-marksheet"), "marksheet.pdf");

    console.log("RESPONSE (Apply Certificate):", res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Application saved/i);
  });

  it("should not allow excessive OTP requests (rate limiter)", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post("/api/auth/register/send-otp").send({
        name: "Spammer",
        email: `spam${i}@example.com`,
        rollNo: `SPAM${i}`,
        mobile: `999999999${i}`,
        password
      });
    }

    const res = await request(app).post("/api/auth/register/send-otp").send({
      name: "Spammer 6",
      email: "spam6@example.com",
      rollNo: "SPAM6",
      mobile: "9999999996",
      password
    });

    console.log("RESPONSE (Rate Limiter):", res.body);
    expect(res.statusCode).toBe(429);
  });

  it("should reject invalid JWT on protected route", async () => {
    const res = await request(app)
      .post("/api/student/apply")
      .set("Authorization", `Bearer invalidtoken`);

    console.log("RESPONSE (Invalid JWT):", res.body);
    expect(res.statusCode).toBe(401);
  });
});
