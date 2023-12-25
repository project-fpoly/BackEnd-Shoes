import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: String,
    resetTokenExpiry: Date,
    role: {
      type: String,
      default: "member",
    },
    avt: {
      type: String,
    },
    deliveryAddress: {
      type: Array,
    },
    gender: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    phoneNumbers: {
      type: Array,
    },
  },
  { versionKey: false, timestamps: true }
);

export default mongoose.model("User", userSchema);
