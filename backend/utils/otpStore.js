const otpStore = {};

const DEFAULT_PURPOSE = "default";

const normalizePart = (value) => String(value || "").trim().toLowerCase();

const buildKey = (purpose, identifier) =>
  `${normalizePart(purpose)}:${normalizePart(identifier)}`;

const resolveArgs = (purposeOrIdentifier, identifierOrOtp, otpOrData, maybeData) => {
  if (maybeData !== undefined) {
    return {
      purpose: purposeOrIdentifier,
      identifier: identifierOrOtp,
      otp: otpOrData,
      data: maybeData,
    };
  }

  return {
    purpose: DEFAULT_PURPOSE,
    identifier: purposeOrIdentifier,
    otp: identifierOrOtp,
    data: otpOrData,
  };
};

const resolveLookupArgs = (purposeOrIdentifier, maybeIdentifier) => {
  if (maybeIdentifier !== undefined) {
    return {
      purpose: purposeOrIdentifier,
      identifier: maybeIdentifier,
    };
  }

  return {
    purpose: DEFAULT_PURPOSE,
    identifier: purposeOrIdentifier,
  };
};

const saveOtpData = (purposeOrIdentifier, identifierOrOtp, otpOrData, maybeData) => {
  const { purpose, identifier, otp, data } = resolveArgs(
    purposeOrIdentifier,
    identifierOrOtp,
    otpOrData,
    maybeData
  );

  otpStore[buildKey(purpose, identifier)] = {
    otp,
    data,
    createdAt: Date.now(),
  };
};

const getOtpData = (purposeOrIdentifier, maybeIdentifier) => {
  const { purpose, identifier } = resolveLookupArgs(
    purposeOrIdentifier,
    maybeIdentifier
  );

  return otpStore[buildKey(purpose, identifier)];
};

const verifyOtp = (purposeOrIdentifier, identifierOrOtp, maybeEnteredOtp) => {
  const { purpose, identifier } = resolveLookupArgs(
    purposeOrIdentifier,
    maybeEnteredOtp !== undefined ? identifierOrOtp : undefined
  );
  const enteredOtp = maybeEnteredOtp !== undefined ? maybeEnteredOtp : identifierOrOtp;
  const record = otpStore[buildKey(purpose, identifier)];

  if (!record) return false;
  return record.otp === enteredOtp;
};

const clearOtpData = (purposeOrIdentifier, maybeIdentifier) => {
  const { purpose, identifier } = resolveLookupArgs(
    purposeOrIdentifier,
    maybeIdentifier
  );

  delete otpStore[buildKey(purpose, identifier)];
};

const isOtpExpired = (purposeOrIdentifier, identifierOrExpiryMinutes, maybeExpiryMinutes) => {
  let purpose = DEFAULT_PURPOSE;
  let identifier = purposeOrIdentifier;
  let expiryMinutes = 10;

  if (maybeExpiryMinutes !== undefined) {
    purpose = purposeOrIdentifier;
    identifier = identifierOrExpiryMinutes;
    expiryMinutes = maybeExpiryMinutes;
  } else if (
    identifierOrExpiryMinutes !== undefined &&
    typeof identifierOrExpiryMinutes !== "number"
  ) {
    purpose = purposeOrIdentifier;
    identifier = identifierOrExpiryMinutes;
  } else if (typeof identifierOrExpiryMinutes === "number") {
    expiryMinutes = identifierOrExpiryMinutes;
  }

  const record = otpStore[buildKey(purpose, identifier)];

  if (!record) return true;

  const now = Date.now();
  const expiry = record.createdAt + expiryMinutes * 60 * 1000;
  return now > expiry;
};

const resetOtpStore = () => {
  Object.keys(otpStore).forEach((key) => {
    delete otpStore[key];
  });
};

module.exports = {
  saveOtpData,
  getOtpData,
  verifyOtp,
  clearOtpData,
  isOtpExpired,
  resetOtpStore,
};
