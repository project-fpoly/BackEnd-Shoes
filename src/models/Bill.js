import mongoose, { Schema } from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: false,
  },
  quantity: {
    type: Number,
    required: false,
  },
});
const BillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: false,
      ref: "User",
    },
    cartItems: [cartItemSchema],
    shippingAddress: {
      email: { type: String },
      fullname: { type: String },
      address: { type: String },
      phone: { type: Number },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    payment_method: {
      type: String,
    },
    totalPrice: {
      type: Number,
      required: false,
    },
    quantity: {
      type: Number,
    },
    color: {
      type: String,
    },
    isPaid: { type: Boolean, default: false },
    isDelivered: { type: String, default: "Chờ xác nhận" },
  },
  { versionKey: false, timestamps: true }
);

export default mongoose.model("Bill", BillSchema);
