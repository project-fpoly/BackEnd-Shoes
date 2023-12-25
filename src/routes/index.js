import express from "express";
import routerAuth from "./auth";
import routerCart from "./cart";
import routerCategory from "./category";

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/order", routerCart);

router.use("/categories", routerCategory);

export default router;
