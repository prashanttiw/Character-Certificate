const redis = require("redis");
const otpStore = require("../utils/otpStore");

const shouldUseMemoryStore =
  process.env.NODE_ENV === "test" || !process.env.REDIS_URL;

const OTP_EXPIRATION_SECONDS = 600;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

let redisClient = null;
const memoryCooldownStore = {};

const normalizeValue = (value) => String(value || "").trim().toLowerCase();

const buildOtpKey = (purpose, identifier) =>
  `otp:${normalizeValue(purpose)}:${normalizeValue(identifier)}`;

const buildCooldownKey = (purpose, identifier) =>
  `otp-cooldown:${normalizeValue(purpose)}:${normalizeValue(identifier)}`;

if (!shouldUseMemoryStore) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  redisClient.connect().catch((err) => {
    console.log(
      "Redis connection failed, falling back to in-memory OTP store.",
      err.message
    );
    redisClient = null;
  });
}

const getMemoryCooldownRemaining = (cooldownKey) => {
  const record = memoryCooldownStore[cooldownKey];

  if (!record) {
    return 0;
  }

  const remainingSeconds = Math.ceil((record.expiresAt - Date.now()) / 1000);

  if (remainingSeconds <= 0) {
    delete memoryCooldownStore[cooldownKey];
    return 0;
  }

  return remainingSeconds;
};

const setCooldown = async (purpose, identifier) => {
  const cooldownKey = buildCooldownKey(purpose, identifier);

  if (!redisClient) {
    memoryCooldownStore[cooldownKey] = {
      expiresAt: Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000,
    };
    return;
  }

  await redisClient.setEx(cooldownKey, OTP_RESEND_COOLDOWN_SECONDS, "1");
};

const getCooldownRemainingSeconds = async (purpose, identifier) => {
  const cooldownKey = buildCooldownKey(purpose, identifier);

  if (!redisClient) {
    return getMemoryCooldownRemaining(cooldownKey);
  }

  const ttl = await redisClient.ttl(cooldownKey);
  return ttl > 0 ? ttl : 0;
};

const setOtpRecord = async (purpose, identifier, record, ttlSeconds = OTP_EXPIRATION_SECONDS) => {
  if (!redisClient) {
    otpStore.saveOtpData(purpose, identifier, record.otp, {
      ...(record.data || {}),
    });

    const memoryRecord = otpStore.getOtpData(purpose, identifier);
    if (memoryRecord) {
      memoryRecord.createdAt = record.createdAt ?? memoryRecord.createdAt;
      memoryRecord.attempts = record.attempts ?? 0;
    }
    return;
  }

  await redisClient.setEx(
    buildOtpKey(purpose, identifier),
    ttlSeconds,
    JSON.stringify(record)
  );
};

const saveOtpData = async (purpose, identifier, otp, data = {}) => {
  const cooldownRemainingSeconds = await getCooldownRemainingSeconds(
    purpose,
    identifier
  );

  if (cooldownRemainingSeconds > 0) {
    return {
      isStored: false,
      reason: "cooldown",
      retryAfterSeconds: cooldownRemainingSeconds,
    };
  }

  const record = {
    otp,
    data,
    createdAt: Date.now(),
    attempts: 0,
  };

  if (!redisClient) {
    await setOtpRecord(purpose, identifier, record);
    await setCooldown(purpose, identifier);
    return {
      isStored: true,
      retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    };
  }

  await setOtpRecord(purpose, identifier, record);
  await setCooldown(purpose, identifier);

  return {
    isStored: true,
    retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
  };
};

const getOtpRecord = async (purpose, identifier) => {
  if (!redisClient) {
    if (otpStore.isOtpExpired(purpose, identifier, OTP_EXPIRATION_SECONDS / 60)) {
      otpStore.clearOtpData(purpose, identifier);
      return null;
    }

    return otpStore.getOtpData(purpose, identifier) || null;
  }

  const key = buildOtpKey(purpose, identifier);
  const result = await redisClient.get(key);

  return result ? JSON.parse(result) : null;
};

const updateOtpRecord = async (purpose, identifier, record) => {
  if (!redisClient) {
    const existingRecord = otpStore.getOtpData(purpose, identifier);
    if (!existingRecord) {
      return;
    }

    existingRecord.otp = record.otp;
    existingRecord.data = record.data;
    existingRecord.createdAt = record.createdAt;
    existingRecord.attempts = record.attempts ?? 0;
    return;
  }

  const key = buildOtpKey(purpose, identifier);
  const ttl = await redisClient.ttl(key);
  const effectiveTtl = ttl > 0 ? ttl : OTP_EXPIRATION_SECONDS;

  await setOtpRecord(purpose, identifier, record, effectiveTtl);
};

const clearOtpData = async (purpose, identifier) => {
  if (!redisClient) {
    otpStore.clearOtpData(purpose, identifier);
    return;
  }

  await redisClient.del(buildOtpKey(purpose, identifier));
};

const verifyOtpAndGetData = async (purpose, identifier, enteredOtp) => {
  const record = await getOtpRecord(purpose, identifier);

  if (!record) {
    return {
      isValid: false,
      reason: "expired",
      data: null,
    };
  }

  if (record.otp !== enteredOtp) {
    const nextAttempts = (record.attempts || 0) + 1;

    if (nextAttempts >= OTP_MAX_ATTEMPTS) {
      await clearOtpData(purpose, identifier);
      return {
        isValid: false,
        reason: "too_many_attempts",
        data: null,
        attemptsLeft: 0,
      };
    }

    record.attempts = nextAttempts;
    await updateOtpRecord(purpose, identifier, record);

    return {
      isValid: false,
      reason: "invalid",
      data: null,
      attemptsLeft: OTP_MAX_ATTEMPTS - nextAttempts,
    };
  }

  await clearOtpData(purpose, identifier);

  return {
    isValid: true,
    reason: null,
    data: record.data || null,
    attemptsLeft: OTP_MAX_ATTEMPTS - (record.attempts || 0),
  };
};

const resetOtpServiceState = async () => {
  Object.keys(memoryCooldownStore).forEach((key) => {
    delete memoryCooldownStore[key];
  });
  otpStore.resetOtpStore();
};

module.exports = {
  OTP_EXPIRATION_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_MAX_ATTEMPTS,
  saveOtpData,
  getOtpRecord,
  clearOtpData,
  verifyOtpAndGetData,
  getCooldownRemainingSeconds,
  resetOtpServiceState,
};
