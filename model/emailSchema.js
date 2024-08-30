import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  to: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  subject: String,
  body: String,
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  image: String,
  name: {
    type: String,
    required: true,
  },

  starred: {
    type: Boolean,
    required: true,
    default: false,
  },
  snooze: {
    type: Boolean,
    required: true,
    default: false,
  },
  trash: {
    type: Boolean,
    required: true,
    default: false,
  },
  type: {
    type: String,
    required: true,
  },
});

const Email = mongoose.model("Email", emailSchema);
export default Email;
