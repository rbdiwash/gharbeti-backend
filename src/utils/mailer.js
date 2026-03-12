const nodemailer = require("nodemailer");

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  console.log(host, user, pass);
  if (!host || !user || !pass) {
    throw new Error(
      "SMTP not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env (e.g. SMTP_HOST=smtp.gmail.com, SMTP_USER=your@gmail.com, SMTP_PASS=app-password).",
    );
  }

  return nodemailer.createTransport({
    // host,
    // port: Number(process.env.SMTP_PORT || 465),
    // secure: String(process.env.SMTP_SECURE || "true") === "true",
    service: "gmail",
    auth: { user, pass },
  });
}

async function sendMail({ to, subject, text, html }) {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
