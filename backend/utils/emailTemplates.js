const generateSubmissionEmail = (name, rollNo, date) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #007bff;">Character Certificate Application Received</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>We have received your application for the character certificate.</p>
      <ul>
        <li><strong>Roll No:</strong> ${rollNo}</li>
        <li><strong>Date:</strong> ${new Date(date).toLocaleString()}</li>
      </ul>
      <p>We will notify you once your application is processed.</p>
      <br/>
      <p style="color: #555;">Regards,<br/><strong>Character Certificate Cell</strong></p>
    </div>
  `;
};

module.exports = generateSubmissionEmail;
