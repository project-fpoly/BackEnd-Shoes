import express from "express";
import routerAuth from "./auth";
import routerBill from "./bill";
import routerCategory from "./category";
import routerCart from "./cart";
const router = express.Router();
router.use("/auth", routerAuth);
router.use("/bill", routerBill);
router.use("/order", routerCart);
router.use("/categories", routerCategory);

export default router;
