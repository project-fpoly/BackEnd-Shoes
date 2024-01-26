import Cart from "../models/Cart";

const createCart = async (req, res) => {
  try {
    const {
      cartItem,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      user,
    } = req.body;

    const newCart = new Cart({
      cartItem,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      user,
    });

    const savedCart = await newCart.save();

    return res.status(200).json(savedCart);
  } catch (e) {
    return res.status(500).json({
      message: "Lỗi máy chủ ",
      error: e.message,
    });
  }
};
const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find();

    return res.status(200).json(carts);
  } catch (e) {
    return res.status(500).json({
      message: "Lỗi máy chủ",
      error: e.message,
    });
  }
};
const getCartById = async (req, res) => {
  try {
    const cartId = req.params.id;

    const cart = await Cart.findById(cartId);

    if (!cart) {
      return res.status(404).json({
        message: "Không tồn tại đơn hàng này",
      });
    }

    return res.status(200).json(cart);
  } catch (e) {
    return res.status(500).json({
      message: "Lỗi máy chủ ",
      error: e.message,
    });
  }
};

const updateCart = async (req, res) => {
  try {
    const cartId = req.params.id;
    const updateData = req.body;

    const updatedCart = await Cart.findByIdAndUpdate(cartId, updateData, {
      new: true,
    });

    if (!updatedCart) {
      return res.status(404).json({
        message: "Không tồn tại đơn hàng này",
      });
    }

    return res.status(200).json(updatedCart);
  } catch (e) {
    return res.status(500).json({
      message: "Lỗi máy chủ",
      error: e.message,
    });
  }
};

const deleteCart = async (req, res) => {
  try {
    const cartId = req.params.id;

    const deletedCart = await Cart.findByIdAndDelete(cartId);

    if (!deletedCart) {
      return res.status(404).json({
        message: "Không tồn tại đơn hàng này",
      });
    }

    return res.status(200).json({
      message: "Xóa đơn hàng thành công",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Lỗi máy chủ",
      error: e.message,
    });
  }
};

export { createCart, getCartById, updateCart, deleteCart, getAllCarts };
