const crypto = require("crypto");

const OTP_EXPIRY_MS_REGISTRATION = 60 * 60 * 1000; // 1 hour
const OTP_EXPIRY_MS_RESET = 10 * 60 * 1000; // 10 minutes

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

module.exports = {
  generateOtp,
  hashOtp,
  OTP_EXPIRY_MS_REGISTRATION,
  OTP_EXPIRY_MS_RESET,
};
