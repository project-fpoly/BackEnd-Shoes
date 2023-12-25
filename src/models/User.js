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
    role: {
      type: String,
      default: "member",
    },
    avt: {
        type: String
    }
<<<<<<<<< Temporary merge branch 1
    ,
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
        type: Array
    }
}, { versionKey: false, timestamps: true })
=========
}, { versionKey: false, timestamps: true})
>>>>>>>>> Temporary merge branch 2
