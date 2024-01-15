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
        cart: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cart",
            required: true,
          },
        ],
        paymentMethod: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
        status: {
          type: String,
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Bill", BillSchema);
