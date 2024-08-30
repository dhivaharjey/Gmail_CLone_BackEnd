import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });
  const resetLink = `${process.env.FRONT_END_URL}/reset-password/${token}`;
  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: "Password Reset Link",
    text: `Click the following link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email");
  }
};
