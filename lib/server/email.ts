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

export const sendResetToken = async (token: string) => {
  await transporter.sendMail({
    to: emailConfig.user,
    from: "Basic Account",
    subject: "Forgot Password",
    html: `
      <html>
        <body>
          <a href="http://localhost:3000/password/reset?auth=${token}">Reset my Password</a>
        </body>
      </html>
    `,
  });
}