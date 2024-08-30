import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const dbConnection = process.env.MONGODB_CONNECTION_STRING;
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(dbConnection);
    console.log("Connected to mongodb");
    return connection;
  } catch (error) {
    console.log("Error", error.message);
  }
};

export default connectDB;
