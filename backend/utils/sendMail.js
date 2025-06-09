const nodemailer = require("nodemailer");

const sendMail = async (to, subject, text) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"Character Cert App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Mail sent: ", info.messageId);
  } catch (error) {
    console.error("❌ Mail Error: ", error);
  }
};

module.exports = sendMail;
