const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key = crypto.scryptSync(process.env.SECRET_KEY, 'salt', 32);
const iv = Buffer.alloc(16, 0);

function encryptField(value) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptField(encrypted) {
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return encrypted; // fallback
  }
}

module.exports = {
  encryptField,
  decryptField,
};
