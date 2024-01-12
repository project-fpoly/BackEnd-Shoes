import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Cart from "../models/Cart";
import { cartSchema } from "../validations/cart";
import nodemailer from "nodemailer";
import User from "../models/User";
dotenv.config();
const { SECRET_CODE, GMAIL_ADMIN, PASS_ADMIN } = process.env;

// Tạo một giỏ hàng mới
const createCart = async (req, res) => {
  try {
    const {
      cartItem,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    // Lấy ID của người dùng từ access token
    const userId = req.user._id;
    // Kiểm tra hợp lệ dữ liệu đầu vào
    const { error } = cartSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Lưu giỏ hàng vào cơ sở dữ liệu với userId
    const cart = new Cart({
      cartItem,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      user: userId,
    });
    const savedCart = await cart.save();
    res.json({ message: "Add cart complete", savedCart });
    const user = await User.findById(userId);
    const userEmail = user.email;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_ADMIN,
        pass: PASS_ADMIN,
      },
    });

    const mailOptions = {
      from: GMAIL_ADMIN,
      to: userEmail,
      subject: "Xác nhận đơn hàng",
      text: "Đơn hàng của bạn đã được đặt thành công.",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Gửi email thất bại:", error);
      } else {
        console.log("Gửi email thành công:", info.response);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Lấy tất cả giỏ hàng của một người dùng
const getAllCarts = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    // Đếm tổng số giỏ hàng
    const totalCarts = await Cart.countDocuments({ user: userId });

    // Lấy giỏ hàng theo trang và số lượng giới hạn
    const carts = await Cart.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      carts,
      pagination: {
        totalCarts,
        totalPages: Math.ceil(totalCarts / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Lấy một giỏ hàng theo ID
const getCartById = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: cartId } = req.params;

    const cart = await Cart.findOne({ _id: cartId, user: userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cập nhật một giỏ hàng theo ID
const updateCart = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: cartId } = req.params;
    const updatedCartData = req.body;

    // Kiểm tra hợp lệ dữ liệu đầu vào
    const { error } = cartSchema.validate(updatedCartData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      { _id: cartId, user: userId },
      updatedCartData,
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.json({ message: "Update cart complete", updatedCart });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Xóa một giỏ hàng theo ID
const deleteCart = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: cartId } = req.params;

    const deletedCart = await Cart.findOneAndDelete({
      _id: cartId,
      user: userId,
    });

    if (!deletedCart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.json({ message: "Cart deleted", deletedCart });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Middleware xác thực Mã thông báo
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_CODE, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = decodedToken;
    next();
  });
}

export {
  createCart,
  getCartById,
  updateCart,
  deleteCart,
  getAllCarts,
  authenticateToken,
};
