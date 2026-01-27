import { emailConfig } from "@/config.email";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.password,
  }
});

export const sendMail = async () => {
  await transporter.sendMail({
    to: emailConfig.user,
    from: "Basic Account",
    subject: "Forgot Password",
    text: "This is the test email",
  });
}