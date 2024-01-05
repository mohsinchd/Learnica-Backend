import { createTransport } from "nodemailer";
import { emailTemplate } from "./emailTemplate.js";
import { verificationTemplate } from "./verificationTemplate.js";

export const sendEmail = async (to, subject, text) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    to,
    subject,
    from: process.env.SMTP_USER,
    html: emailTemplate(text),
  });
};

export const sendVerificationEmail = async (to, subject, text) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    to,
    subject,
    from: process.env.SMTP_USER,
    html: verificationTemplate(text),
  });
};
