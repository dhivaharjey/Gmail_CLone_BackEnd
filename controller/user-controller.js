import express from "express";
import User from "../model/userSchema.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

import { sendResetEmail } from "../services/resetLinkMail.js";
dotenv.config();

export const userRegister = async (req, res) => {
  try {
    const { userName, day, month, year, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email is already taken ,Enter New Email Id" });
    }
    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const newUser = new User({
      userName,
      day,
      month,
      year,
      email,
      password,
    });
    await newUser.save();

    res.status(200).json({
      status: true,
      message: "Regitered Successfully!!!  Wait for log in page",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: "Internal server errors!!!!!!" });
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, error: "Invalid email" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Password does not match for user:", email);
      return res.status(400).json({ status: false, error: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "5d" }
    );

    res.status(200).json({
      status: true,
      token,
      refreshToken,
      message: "Logged In successfully!!",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: false, message: "No file uploaded" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (user.profileImage) {
      const filePath = path.resolve(
        "uploads/Images",
        path.basename(user.profileImage)
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.profileImage = req.file.path;
    await user.save();

    res.status(200).json({
      status: true,
      message: "Profile image uploaded successfully",
      filePath: req.file.path,
      user: {
        id: user._id,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

export const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (user.profileImage) {
      const filePath = path.resolve(
        "uploads/Images",
        path.basename(user.profileImage)
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      user.profileImage = null;
      await user.save();
    }

    res
      .status(200)
      .json({ status: true, message: "Profile image deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log("User found:", user);
    if (!user) {
      return res
        .status(400)
        .json({ error: "User with this email does not exist" });
    }
    if (user.resetPasswordExpires && user.resetPasswordExpires > Date.now()) {
      return res.status(400).json({
        error:
          "A password reset link has already been sent. Please check your email.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 900000; // 1 hour
    await user.save();

    await sendResetEmail(email, resetToken);

    res
      .status(200)
      .json({ status: true, message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = req.user;
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        error: "New password cannot be the same as the old password",
      });
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ status: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "5h",
      }
    );

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(500).json({ error: "Invalid or expired token" });
  }
};
export const checkAuth = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    res.status(500).json({ error: "Invalid or expired token" });
  }
};
