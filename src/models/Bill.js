import mongoose from "mongoose";

const BillSchema = new mongoose.Schema(
  {
    billItem: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        shoes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shoes",
            required: true,
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now(),
        },
        paymentMethod: {
          type: String,
          required: true,
        },
        paid: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        dateBuy: {
          type: Date,
        },
        images: [
          {
            type: String,
            default: null,
          },
        ],
        addRess: {
          fullname: { type: String, required: true },
          address: { type: String, required: true },
          city: { type: String, required: true },
          phone: { type: Number, required: true },
        },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Bill", BillSchema);
