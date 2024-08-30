import express from "express";
import {
  deleteEmailsPermanently,
  getEmails,
  moveEmailsToTrash,
  saveEmails,
  sendEmail,
  toggleSnoozeddEmails,
  toggleStarredEmails,
} from "../controller/email-controller.js";

import authenticateToken from "../middleware/auth.js";

const routes = express.Router();

routes.post("/save", authenticateToken, saveEmails);
routes.get("/emails/:type", authenticateToken, getEmails);
routes.post("/save-draft", authenticateToken, saveEmails);
routes.post("/trash", authenticateToken, moveEmailsToTrash);
routes.post("/starred", authenticateToken, toggleStarredEmails);
routes.delete("/delete", authenticateToken, deleteEmailsPermanently);
routes.post("/snooze", authenticateToken, toggleSnoozeddEmails);
routes.post("/send-email", authenticateToken, sendEmail);

export default routes;
