import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

const cartSchema = mongoose.Schema(
  {
    cartItems: [cartItemSchema],
    shippingAddress: {
      email: { type: String },
      fullname: { type: String },
      address: { type: String },
      phone: { type: Number },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const CartItem = mongoose.model("CartItem", cartItemSchema);
const Cart = mongoose.model("Cart", cartSchema);

export { CartItem, Cart };
