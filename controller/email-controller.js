import { request, response } from "express";
import Email from "../model/emailSchema.js";
import User from "../model/userSchema.js";
import nodemailer from "nodemailer";
export const saveEmails = async (req, res) => {
  try {
    const email = new Email({
      ...req.body,
      user: req.user.id,
    });
    await email.save();

    res.status(200).json({ status: true, message: "Email saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getEmails = async (req, res) => {
  try {
    const query = { user: req.user.id };

    if (req.params.type === "trash") {
      query.trash = true;
    } else if (req.params.type === "starred") {
      query.starred = true;
      query.trash = false;
    } else if (req.params.type === "snooze") {
      query.snooze = true;
      query.trash = false;
    } else if (req.params.type === "allmail") {
      query.trash = { $ne: true };
    } else {
      query.type = req.params.type;
      query.trash = false;
    }

    const emails = await Email.find(query);
    return res.status(200).json({ emails });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

export const moveEmailsToTrash = async (req, response) => {
  try {
    await Email.updateMany(
      { _id: { $in: req.body }, user: req.user.id }, // Only update emails for the authenticated user
      { $set: { trash: true, starred: false, snooze: false, type: "" } }
    );
    return response.status(200).json("Emails Deleted Successfully");
  } catch (error) {
    response.status(500).json(error.message);
  }
};

export const toggleSnoozeddEmails = async (req, response) => {
  try {
    await Email.updateOne(
      { _id: req.body.id, user: req.user.id }, // Only update email for the authenticated user
      { $set: { snooze: req.body.value } }
    );
    return response.status(200).json("Email is Snoozed");
  } catch (error) {
    return response.status(500).json(error.message);
  }
};
export const toggleStarredEmails = async (req, response) => {
  try {
    await Email.updateOne(
      { _id: req.body.id, user: req.user.id }, // Only update email for the authenticated user
      { $set: { starred: req.body.value } }
    );
    return response.status(200).json("Email is Starred ");
  } catch (error) {
    return response.status(500).json(error.message);
  }
};

export const deleteEmailsPermanently = async (req, response) => {
  try {
    await Email.deleteMany({ _id: { $in: req.body }, user: req.user.id });
    return response.status(200).json("Emails are deleted Successfully");
  } catch (error) {
    return response.status(500).json(error.message);
  }
};

export const sendEmail = async (req, res) => {
  const { to, subject, body, name } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found" });
    }
    const transpoter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: user.email,
      name: user.userName,
      to,
      subject,
      text: body,
      html: `<p>${body}</p>`,
    };
    await transpoter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ status: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      status: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};
