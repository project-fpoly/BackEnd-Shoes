import { Router } from "express";

import {
  createCart,
  getCartById,
  updateCart,
  deleteCart,
  getAllCarts,
} from "../controllers/Cart";

const routerCart = Router();

routerCart.post("/carts", createCart);
routerCart.get("/carts/:id", getCartById);
routerCart.put("/carts/:id", updateCart);
routerCart.delete("/carts/:id", deleteCart);
routerCart.get("/carts", getAllCarts);

export default routerCart;
