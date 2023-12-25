import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
<<<<<<< HEAD
      type: String,
      required: true,
=======
        type: String,
        required: true
>>>>>>> da9b94690d6446b27254ff3856f25d7000424232
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
<<<<<<< HEAD
      type: Array,
    },
  },
  { versionKey: false, timestamps: true }
);
=======
        type: Array
    }
}, { versionKey: false, timestamps: true })
>>>>>>> da9b94690d6446b27254ff3856f25d7000424232

export default mongoose.model("User", userSchema);
