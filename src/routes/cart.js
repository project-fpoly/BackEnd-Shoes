import { Router } from "express";

import {
  createCart,
  getCartById,
  updateCart,
  deleteCart,
  getAllCarts,
  getAllCartsAdmin,
  getCartByIdAdmin,
} from "../controllers/Cart";
import { authenticateToken, checkCreateOder } from "../middlewares/checkOrders";
import { checkPermissionManager } from "../middlewares/checkPermission";
const routerCart = Router();

routerCart.post("/carts", checkCreateOder, createCart);
routerCart.get("/carts/:id", authenticateToken, getCartById);
routerCart.get("/carts", authenticateToken, getAllCarts);
routerCart.put("/carts/:id", checkPermissionManager, updateCart);
routerCart.delete("/carts/:id", checkPermissionManager, deleteCart);
routerCart.get("/admin/carts", checkPermissionManager, getAllCartsAdmin);
routerCart.get("/admin/carts", checkPermissionManager, getCartByIdAdmin);

export default routerCart;
