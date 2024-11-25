import crypto from "crypto";
import User from "../model/userSchema.js";

export const verifyToken = async (req, res, next) => {
  const token = req.params.token;
  const tokenVerification = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: tokenVerification,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
