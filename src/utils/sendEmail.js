const nodemailer = require("nodemailer");

require("dotenv").config();

const sendEmail = async ({ from, to, subject, html }) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    secure: true,

    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transport.sendMail({
    from,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
