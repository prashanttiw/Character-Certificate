

const registrationOtpTemplate = (name, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #0055ff;">Welcome to Character Certificate Portal</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your One-Time Password (OTP) for email verification is:</p>
      <h1 style="color: #1a73e8;">${otp}</h1>
      <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      <br />
      <p>Regards,<br/>Character Certificate System Team</p>
    </div>
  `;
};

module.exports = registrationOtpTemplate;
