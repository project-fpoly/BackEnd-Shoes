import express from "express";
import routerAuth from "./auth";
import routerCart from "./cart";

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/order", routerCart);

export default router;
