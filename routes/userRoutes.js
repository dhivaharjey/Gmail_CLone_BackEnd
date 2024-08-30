import express from "express";
import {
  checkAuth,
  deleteProfileImage,
  forgetPassword,
  getUserDetails,
  refreshToken,
  resetPassword,
  uploadProfileImage,
  userLogin,
  userRegister,
} from "../controller/user-controller.js";
import { verifyToken } from "../middleware/resetToken.js";
import authenticateToken from "../middleware/auth.js";
import { upload } from "../Utils/profileImage.js";

const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/login", userLogin);
userRouter.post(
  "/upload-profile-image",
  authenticateToken,
  upload.single("profileImage"),
  uploadProfileImage
);
userRouter.delete(
  "/delete-profile-image",
  authenticateToken,
  deleteProfileImage
);
userRouter.get("/get-user-details", authenticateToken, getUserDetails);
userRouter.post("/forgot-password", forgetPassword);
userRouter.get("/verify-token/:token", verifyToken, (req, res) => {
  return res
    .status(200)
    .json({ status: true, message: "Token is verified and valid" });
});
userRouter.post("/reset-password/:token", verifyToken, resetPassword);
userRouter.post("/refresh-token", refreshToken);
userRouter.get("/check-auth", checkAuth);
export default userRouter;
