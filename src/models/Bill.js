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
  price: {
    type: Number,
    required: false,
  },
  images: {
    type: Array,
    required: false,
  },
  color: {
    type: String,
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
      email: { type: String, required: true },
      fullname: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: Number, required: true },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    payment_method: {
      type: String,
      default: "Thanh toán tiền mặt",
    },
    totalPrice: {
      type: Number,
      required: false,
    },
    quantity: {
      type: Number,
    },

    isPaid: { type: Boolean, default: false },
    isDelivered: { type: String, default: "Chờ xác nhận" },
  },
  { versionKey: false, timestamps: true }
);

export default mongoose.model("Bill", BillSchema);
