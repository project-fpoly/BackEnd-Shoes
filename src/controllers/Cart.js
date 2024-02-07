import dotenv from "dotenv";
import { Cart, CartItem } from "../models/Cart";
import { validateCart } from "../validations/cart";
import nodemailer from "nodemailer";
import Product from "../models/Product";
import Bill from "../models/Bill";
dotenv.config();
const { GMAIL_ADMIN, PASS_ADMIN } = process.env;

// Tạo một giỏ hàng mới
const addCartItems = async (req, res) => {
  try {
    const quantity = req.body.quantity;
    const product = req.body.product;
    const userId = req.user?._id;

    let cart;

    if (userId) {
      // Người dùng đã đăng nhập
      cart = await Cart.findOne({ user: userId });

      if (!cart) {
        cart = new Cart({
          user: userId,
          cartItems: [],
          totalPrice: 0, // Thêm trường totalPrice vào cart
        });
      }
    } else {
      // Người dùng không đăng nhập, lưu vào session storage
      cart = req.session.cart;

      if (!cart) {
        cart = {
          cartItems: [],
          totalPrice: 0, // Thêm trường totalPrice vào cart
        };
      }
    }

    const productModel = await Product.findById(product);

    if (!productModel) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    const productPrice = productModel.price;
    const productImage = productModel.images;

    const existingCartItem = cart.cartItems.find(
      (item) => item.product.toString() === product
    );

    if (existingCartItem) {
      // Tăng số lượng nếu sản phẩm đã tồn tại trong giỏ hàng
      existingCartItem.quantity += quantity;
      existingCartItem.price = productPrice * existingCartItem.quantity;
    } else {
      // Thêm sản phẩm mới vào giỏ hàng
      const newCartItem = {
        product: product,
        quantity: quantity,
        price: productPrice * quantity,
        images: productImage,
      };
      cart.cartItems.push(newCartItem);
    }

    // Cập nhật tổng tiền trong giỏ hàng
    cart.totalPrice = 0;
    cart.cartItems.forEach((item) => {
      cart.totalPrice += item.price;
    });

    if (!userId) {
      // Lưu giỏ hàng vào session storage khi người dùng không đăng nhập
      req.session.cart = cart;
    } else {
      await cart.save();
    }

    res
      .status(200)
      .json({ message: "Sản phẩm đã được thêm vào giỏ hàng", cart });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng" });
    console.log(error);
  }
};

const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const userId = req.user?._id;
    const userEmail = shippingAddress.email;
    // const productModel = await Product.findById(product);
    // console.log(productModel);
    let cart;

    if (userId) {
      // Người dùng đã đăng nhập
      cart = await Cart.findOne({ user: userId }).populate("cartItems.product");
    } else {
      // Người dùng không đăng nhập
      cart = req.session.cart;
    }

    if (!cart || cart.cartItems.length === 0) {
      // Kiểm tra giỏ hàng có sản phẩm không
      return res.status(400).json({ error: "Giỏ hàng trống" });
    }

    // Tạo đơn hàng từ giỏ hàng và sử dụng trường totalPrice từ giỏ hàng
    const order = new Bill({
      user: userId,
      cartItems: [
        ...cart.cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          images: item.images,
        })),
      ],
      shippingAddress,
      totalPrice: cart.totalPrice, // Sử dụng trường totalPrice từ giỏ hàng
    });

    if (userEmail) {
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
        subject: "Bạn đã đặt hàng thành công",
        text: `"Đơn hàng của bạn đã được đặt thành công."`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Gửi email thất bại:", error);
        } else {
          console.log("Gửi email thành công:", info.response);
        }
      });
    }

    await order.save();

    // Xóa giỏ hàng sau khi tạo đơn hàng thành công
    if (userId) {
      await Cart.findByIdAndDelete(cart._id);
    } else {
      req.session.cart = {
        cartItems: [],
      };
    }

    res
      .status(200)
      .json({ message: "Đơn hàng đã được tạo thành công", data: order });
  } catch (error) {
    res.status(500).json({ error: "Đã xảy ra lỗi khi tạo đơn hàng" });
    console.log(error);
  }
};

// Lấy tất cả giỏ hàng của một người dùng
const getCartItems = async (req, res) => {
  try {
    const userId = req.user?._id;

    let cart;

    if (userId) {
      // Người dùng đã đăng nhập
      cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
      }
    } else {
      // Người dùng không đăng nhập, lấy từ session storage
      cart = req.session.cart;

      if (!cart) {
        return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
      }
    }

    res.status(200).json({ cart: cart });
  } catch (error) {
    res.status(500).json({ error: "Đã xảy ra lỗi khi lấy thông tin giỏ hàng" });
    console.log(error);
  }
};
const removeCartItem = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user?._id;
    let cart;

    if (userId) {
      // Người dùng đã đăng nhập
      cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
      }
    } else {
      // Người dùng không đăng nhập, lấy từ session storage
      cart = req.session.cart;

      if (!cart) {
        return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
      }
    }

    // Tìm vị trí của sản phẩm trong giỏ hàng
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex === -1) {
      // Không tìm thấy sản phẩm trong giỏ hàng
      return res
        .status(404)
        .json({ error: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    // Xóa sản phẩm khỏi giỏ hàng
    cart.cartItems.splice(productIndex, 1);

    if (userId) {
      // Lưu giỏ hàng vào cơ sở dữ liệu nếu người dùng đã đăng nhập
      await cart.save();
    } else {
      // Lưu giỏ hàng vào session storage nếu người dùng không đăng nhập
      req.session.cart = cart;
    }

    res.status(200).json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Đã xảy ra lỗi khi xóa sản phẩm khỏi giỏ hàng" });
    console.log(error);
  }
};
const findUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10, start, end } = req.query;
    let query = {};

    if (!userId) {
      return res.status(400).json({ error: "Người dùng chưa đăng nhập" });
    }

    if (start && end) {
      const startDate = new Date(`${start}T00:00:00.000Z`);
      const endDate = new Date(`${end}T23:59:59.999Z`);

      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const totalOrders = await Bill.countDocuments({ user: userId, ...query });

    const orders = await Bill.find({ user: userId, ...query })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Đã xảy ra lỗi khi tìm kiếm đơn hàng đã tạo" });
    console.log(error);
  }
};
const getOrderById = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: cartId } = req.params;

    const order = await Bill.findOne({ _id: cartId, user: userId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const getAllOrderAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, start, end } = req.query;
    let query = {};

    if (start && end) {
      const startDate = new Date(`${start}T00:00:00.000Z`);
      const endDate = new Date(`${end}T23:59:59.999Z`);

      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const totalOrders = await Bill.countDocuments(query);

    const orders = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
// Lấy một giỏ hàng theo ID của user

// Lấy một giỏ hàng theo ID của user dành cho admin

const getCartByIdAdmin = async (req, res) => {
  try {
    const { id: cartId } = req.params;
    const cart = await Cart.findById({ _id: cartId });
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
    const { error } = validateCart.validate(updatedCartData);
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
    const { id: cartId } = req.params;

    const cart = await Cart.findOne({ _id: cartId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    if (cart.isDelivered !== "Chờ xác nhận") {
      return res.status(400).json({ error: "You cannot delete this cart" });
    }

    const deletedCart = await Cart.findOneAndDelete({ _id: cartId });

    res.json({ message: "Cart deleted", deletedCart });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  addCartItems,
  getCartItems,
  removeCartItem,
  createOrder,
  getOrderById,
  updateCart,
  deleteCart,
  getAllOrderAdmin,
  getCartByIdAdmin,
  findUserOrders,
};
