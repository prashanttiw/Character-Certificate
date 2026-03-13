const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (process.env.NODE_ENV === "test") {
      return { skipped: true, to, subject };
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials are not configured. Skipping email send.");
      return { skipped: true, to, subject };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to", to);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    throw new Error("Email sending failed");
  }
};

module.exports = sendEmail;
