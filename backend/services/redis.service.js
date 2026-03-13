// backend/services/redis.service.js

const redis = require('redis');

// Create a Redis client
const redisClient = redis.createClient({
  // If you have a REDIS_URL in your .env file, it will use that.
  // Otherwise, it defaults to connecting to localhost:6379, which is perfect for local development.
  url: process.env.REDIS_URL 
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis
redisClient.connect();

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