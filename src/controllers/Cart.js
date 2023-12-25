import Cart from "../models/Cart";
import { cartSchema } from "../validations/cart";
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
    const { error, value } = cartSchema.validate({
      cartItem,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      user,
    });
    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    const newCart = new Cart(value);

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
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = parseInt(req.query.limit) || 10; // Giới hạn số lượng bản ghi trên mỗi trang, mặc định là 10

    const skipCount = (page - 1) * limit; // Số bản ghi cần bỏ qua

    const totalCount = await Cart.countDocuments(); // Tổng số bản ghi trong collection

    const carts = await Cart.find().skip(skipCount).limit(limit).exec();

    if (carts.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy giỏ hàng nào",
      });
    }

    return res.status(200).json({
      message: `Tìm thấy ${carts.length} giỏ hàng`,
      carts: carts,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
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

    const { error, value } = cartSchema.validate(updateData);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const updatedCart = await Cart.findByIdAndUpdate(cartId, value, {
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
