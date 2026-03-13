// backend/services/redis.service.js

const redis = require('redis');
const otpStore = require("../utils/otpStore");

const shouldUseMemoryStore =
  process.env.NODE_ENV === "test" || !process.env.REDIS_URL;

let redisClient = null;

if (!shouldUseMemoryStore) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  redisClient.connect().catch((err) => {
    console.log("Redis connection failed, falling back to in-memory OTP store.", err.message);
    redisClient = null;
  });
}

// We'll set OTPs to expire in 10 minutes (600 seconds)
const OTP_EXPIRATION_SECONDS = 600;

/**
 * Stores a user's temporary registration data and OTP in Redis.
 * The data will automatically expire.
 * @param {string} email - The user's email, used as the key.
 * @param {string} otp - The one-time password.
 * @param {object} data - The user's registration data (name, rollNo, etc.).
 */
const saveOtpData = async (email, otp, data) => {
  if (!redisClient) {
    otpStore.saveOtpData(email, otp, data);
    return;
  }

  const key = `otp:${email}`;
  const value = JSON.stringify({ otp, data });
  await redisClient.setEx(key, OTP_EXPIRATION_SECONDS, value);
};

/**
 * Retrieves OTP data from Redis and verifies the provided OTP.
 * @param {string} email - The user's email.
 * @param {string} enteredOtp - The OTP entered by the user.
 * @returns {object|null} The stored user data if the OTP is valid, otherwise null.
 */
const verifyOtpAndGetData = async (email, enteredOtp) => {
  if (!redisClient) {
    if (otpStore.isOtpExpired(email) || !otpStore.verifyOtp(email, enteredOtp)) {
      return null;
    }

    const record = otpStore.getOtpData(email);
    otpStore.clearOtpData(email);
    return record?.data || null;
  }

  const key = `otp:${email}`;
  const result = await redisClient.get(key);

  if (!result) {
    return null; // OTP has expired or doesn't exist
  }

  const { otp, data } = JSON.parse(result);

  if (otp === enteredOtp) {
    // Once verified, we should delete the OTP so it can't be used again.
    await redisClient.del(key);
    return data;
  }

  return null; // OTP was incorrect
};

module.exports = {
  saveOtpData,
  verifyOtpAndGetData,
};
