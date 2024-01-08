import { Router } from "express";

import {
  createCart,
  getCartById,
  updateCart,
  deleteCart,
  getAllCarts,
  authenticateToken,
} from "../controllers/Cart";

const routerCart = Router();

routerCart.post("/carts", authenticateToken, createCart);
routerCart.get("/carts/:id", authenticateToken, getCartById);
routerCart.put("/carts/:id", authenticateToken, updateCart);
routerCart.delete("/carts/:id", authenticateToken, deleteCart);
routerCart.get("/carts", authenticateToken, getAllCarts);

export default routerCart;
