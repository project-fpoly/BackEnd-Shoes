import mongoose from "mongoose";

const favItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: false,
  },
  images: {
    type: Array,
    required: false,
  },
});

const favSchema = mongoose.Schema(
  {
    cartItems: [favItemSchema],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    totalPrice: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const FavItem = mongoose.model("FavItem", favItemSchema);
const Fav = mongoose.model("Fav", favSchema);

export { FavItem, Fav };
