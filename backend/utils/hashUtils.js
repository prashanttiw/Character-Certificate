const bcrypt = require("bcryptjs"); // safer to explicitly use 'bcryptjs'

/**
 * Hash a plain password securely using bcrypt
 * @param {string} password - The plain password to hash
 * @returns {Promise<string>} - The hashed password
 */
async function hashPassword(password) {
  if (!password) throw new Error("Password must not be empty.");
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password with stored hashed password
 * @param {string} plain - The plain input password
 * @param {string} hashed - The stored hashed password
 * @returns {Promise<boolean>} - True if matched
 */
async function comparePassword(plain, hashed) {
  if (!plain || !hashed) return false;
  return bcrypt.compare(plain, hashed);
}

module.exports = {
  hashPassword,
  comparePassword
};
