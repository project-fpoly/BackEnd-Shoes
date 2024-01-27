import { Router } from "express";

import {
  createCart,
  getCartById,
  updateCart,
  deleteCart,
  getAllCarts,
} from "../controllers/Cart";
import { authenticateToken } from "../middlewares/checkOrders";
import { checkCreateOder } from "../middlewares/checkAddOrder";
const routerCart = Router();

routerCart.post("/carts", checkCreateOder, createCart);
routerCart.get("/carts/:id", authenticateToken, getCartById);
routerCart.put("/carts/:id", authenticateToken, updateCart);
routerCart.delete("/carts/:id", authenticateToken, deleteCart);
routerCart.get("/carts", authenticateToken, getAllCarts);

export default routerCart;
