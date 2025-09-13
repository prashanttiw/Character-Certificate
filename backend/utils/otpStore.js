const otpStore = {};

const saveOtpData = (email, otp, data) => {
  otpStore[email] = {
    otp,
    data,
    createdAt: Date.now(),
  };
};

const getOtpData = (email) => {
  return otpStore[email];
};

const verifyOtp = (email, enteredOtp) => {
  const record = otpStore[email];
  if (!record) return false;
  return record.otp === enteredOtp;
};

const clearOtpData = (email) => {
  delete otpStore[email];
};

const isOtpExpired = (email, expiryMinutes = 10) => {
  const record = otpStore[email];
  if (!record) return true;
  const now = Date.now();
  const expiry = record.createdAt + expiryMinutes * 60 * 1000;
  return now > expiry;
};

module.exports = {
  saveOtpData,
  getOtpData,
  verifyOtp,
  clearOtpData,
  isOtpExpired,
};
