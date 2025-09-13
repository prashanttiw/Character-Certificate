module.exports = function(name, otp) {
  return `
    <h2>Password Reset Requested</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your OTP to reset the password is:</p>
    <h1 style="color:#3366cc;">${otp}</h1>
    <p>This OTP will expire in 10 minutes. Do not share it with anyone.</p>
    <p><i>- Character Certificate System</i></p>
  `;
};
