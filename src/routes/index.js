import express from "express";
import routerAuth from "./auth";
import routerBill from "./bill";
import routerCategory from "./category";
import routerProduct from "./product";

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/bill", routerBill);

router.use("/product", routerProduct);
router.use("/categories", routerCategory);

export default router;




