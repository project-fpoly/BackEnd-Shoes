import express from "express";
import routerAuth from "./auth";
import routerProduct from "./product";


const router = express.Router();
router.use("/auth", routerAuth);
router.use("/product", routerProduct);

export default router;
