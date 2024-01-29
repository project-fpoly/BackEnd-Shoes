import mongoose from "mongoose";

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
});

const cartSchema = mongoose.Schema(
  {
    cartItems: [cartItemSchema],
    shippingAddress: {
      email: { type: String, required: true },
      fullname: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: Number, required: true },
    },
    paymentMethod: { type: String, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isUser: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: String, default: "Chờ xác nhận" },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cart", cartSchema);
