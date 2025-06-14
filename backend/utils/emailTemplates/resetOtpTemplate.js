const generateResetOTPTemplate = (name, otp) => `
  <div style="font-family: Arial; padding: 20px;">
    <h2>Reset Your Password</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your OTP to reset your password is:</p>
    <h1 style="color: blue;">${otp}</h1>
    <p>This OTP is valid for a short time. Do not share it with anyone.</p>
    <br/>
    <p>Regards,<br/>Character Certificate System</p>
  </div>
`;

module.exports = generateResetOTPTemplate;
