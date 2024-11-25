import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import routes from "./routes/emailRoute.js";
import userRouter from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json({ extended: true }));

connectDB();

app.use("/", routes);
app.use("/user", userRouter);

app.listen(process.env.PORT, () => {
  console.log("App is running in the PORT =", process.env.PORT);
});
