const passwordChangedTemplate = (name) => `
  <div style="font-family: Arial; padding: 20px;">
    <h2>Password Changed Successfully</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your password was successfully updated.</p>
    <p>If you didn’t do this, please contact support immediately.</p>
    <br/>
    <p>Regards,<br/>Character Certificate System</p>
  </div>
`;

module.exports = passwordChangedTemplate;
