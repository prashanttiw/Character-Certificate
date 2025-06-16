const profileEditOtpTemplate = (name, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 10px;">
      <h2>Profile Edit Verification</h2>
      <p>Hello <b>${name}</b>,</p>
      <p>You requested to edit your profile details in the Character Certificate System.</p>
      <p>Your OTP is:</p>
      <h1 style="color: #007bff;">${otp}</h1>
      <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      <p>If you did not make this request, please ignore this email or contact support.</p>
    </div>
  `;
};

module.exports = profileEditOtpTemplate;
