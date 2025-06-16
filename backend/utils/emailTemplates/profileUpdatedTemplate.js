const profileUpdatedTemplate = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 10px;">
      <h2>Profile Updated Successfully</h2>
      <p>Hello <b>${name}</b>,</p>
      <p>This is to inform you that your profile details in the Character Certificate System have been successfully updated.</p>
      <p>If you did not perform this update, please contact the admin immediately.</p>
      <p>Thank you for using the system.</p>
    </div>
  `;
};

module.exports = profileUpdatedTemplate;
