const {
  OTP_EXPIRATION_SECONDS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  saveOtpData,
  getOtpRecord,
  verifyOtpAndGetData,
  getCooldownRemainingSeconds,
  resetOtpServiceState,
} = require("../services/redis.service");

describe("Redis OTP Service", () => {
  beforeEach(async () => {
    await resetOtpServiceState();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await resetOtpServiceState();
  });

  it("stores OTP records with purpose-scoped data", async () => {
    const result = await saveOtpData("register", "student@example.com", "123456", {
      name: "Test Student",
    });

    const record = await getOtpRecord("register", "student@example.com");

    expect(result.isStored).toBe(true);
    expect(record).toMatchObject({
      otp: "123456",
      data: { name: "Test Student" },
      attempts: 0,
    });
  });

  it("blocks OTP resend inside the cooldown window", async () => {
    await saveOtpData("register", "student@example.com", "123456", {
      name: "Test Student",
    });

    const secondAttempt = await saveOtpData(
      "register",
      "student@example.com",
      "654321",
      { name: "Another Student" }
    );

    expect(secondAttempt).toMatchObject({
      isStored: false,
      reason: "cooldown",
    });
    expect(secondAttempt.retryAfterSeconds).toBeGreaterThan(0);
    expect(secondAttempt.retryAfterSeconds).toBeLessThanOrEqual(
      OTP_RESEND_COOLDOWN_SECONDS
    );
  });

  it("tracks invalid attempts and locks the OTP after too many tries", async () => {
    await saveOtpData("forgot-password", "student@example.com", "654321", {
      purpose: "reset-password",
    });

    for (let attempt = 1; attempt < OTP_MAX_ATTEMPTS; attempt += 1) {
      const result = await verifyOtpAndGetData(
        "forgot-password",
        "student@example.com",
        "000000"
      );

      expect(result).toMatchObject({
        isValid: false,
        reason: "invalid",
        attemptsLeft: OTP_MAX_ATTEMPTS - attempt,
      });
    }

    const lockedResult = await verifyOtpAndGetData(
      "forgot-password",
      "student@example.com",
      "000000"
    );

    expect(lockedResult).toMatchObject({
      isValid: false,
      reason: "too_many_attempts",
      attemptsLeft: 0,
    });

    const recordAfterLock = await getOtpRecord(
      "forgot-password",
      "student@example.com"
    );
    expect(recordAfterLock).toBeNull();
  });

  it("returns expired when OTP verification happens after TTL", async () => {
    const nowSpy = jest.spyOn(Date, "now");

    nowSpy.mockReturnValue(1_000);
    await saveOtpData("register", "student@example.com", "123456", {
      name: "Late Student",
    });

    nowSpy.mockReturnValue((OTP_EXPIRATION_SECONDS + 2) * 1000);

    const result = await verifyOtpAndGetData(
      "register",
      "student@example.com",
      "123456"
    );

    expect(result).toMatchObject({
      isValid: false,
      reason: "expired",
    });
  });

  it("clears the OTP after a successful verification", async () => {
    await saveOtpData("register", "student@example.com", "123456", {
      name: "Verified Student",
    });

    const result = await verifyOtpAndGetData(
      "register",
      "student@example.com",
      "123456"
    );

    const record = await getOtpRecord("register", "student@example.com");
    const cooldownRemaining = await getCooldownRemainingSeconds(
      "register",
      "student@example.com"
    );

    expect(result).toMatchObject({
      isValid: true,
      data: { name: "Verified Student" },
    });
    expect(record).toBeNull();
    expect(cooldownRemaining).toBeGreaterThan(0);
  });
});
