import { Router } from "express";

import {
  addCartItems,
  getCartItems,
  removeCartItem,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  getAllOrderAdmin,
  getCartByIdAdmin,
  findUserOrders,
} from "../controllers/Cart";
import { authenticateToken, checkCreateOder } from "../middlewares/checkOrders";
import { checkPermissionManager } from "../middlewares/checkPermission";
const routerCart = Router();

// cart
// Carts
routerCart.post("/carts", authenticateToken, addCartItems); // Thêm một mục hàng vào giỏ hàng
routerCart.get("/carts", authenticateToken, getCartItems); // Lấy danh sách các mục hàng trong giỏ hàng
routerCart.delete("/carts/:id", authenticateToken, removeCartItem); // Xóa một mục hàng khỏi giỏ hàng

// Bills (Orders)
routerCart.post("/bills", authenticateToken, createOrder); // Tạo một đơn hàng mới
routerCart.get("/bills", authenticateToken, findUserOrders); // Lấy danh sách các đơn hàng của người dùng
routerCart.get("/bills/:id", authenticateToken, getOrderById); // Lấy thông tin chi tiết của một đơn hàng

// Admin Routes
routerCart.get("/admin/bills", getAllOrderAdmin); // Lấy danh sách tất cả đơn hàng (cho quản trị viên)
routerCart.delete("/admin/bills/:id", deleteOrder); // Xóa một đơn hàng(cho quản trị viên)
routerCart.put("/admin/bills/:id", updateOrder); // Cập nhật thông tin của một đơn hàng(cho quản trị viên)
routerCart.get("/admin/bills/:id", checkPermissionManager, getCartByIdAdmin); // Lấy thông tin chi tiết của một đơn hàng (cho quản trị viên)

export default routerCart;
