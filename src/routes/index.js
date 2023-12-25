import express from "express";
import routerAuth from "./auth";
import routerCategory from "./category";
import routerProduct from "./product";
import routerBill from "./bill";

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/bill", routerBill);
router.use("/product", routerProduct);
router.use("/categories", routerCategory);

export default router;




