import mongoose, { Schema } from "mongoose";

const BillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    shoeId: [
      {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Shoe",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    payment_method: {
      type: String,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
    },
    image: {
      type: String,
    },
    date_buy: {
      type: Date,
    },
    address: {
      type: String,
    },
    color: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true }
);

export default mongoose.model("Bill", BillSchema);
