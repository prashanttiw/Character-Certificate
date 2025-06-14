
const loginAlertTemplate = (name, time) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>🚨 Login Alert</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your account was just logged into on <strong>${time}</strong>.</p>
    <p>If this wasn't you, please reset your password immediately to secure your account.</p>
    <br/>
    <p>Thanks,<br/>Character Certificate System</p>
  </div>
`;

module.exports = loginAlertTemplate;
