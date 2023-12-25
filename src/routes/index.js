import express from "express";
import routerAuth from "./auth";
import routerCategory from "./category";
import routerProduct from "./product";

const router = express.Router();
router.use("/auth", routerAuth);

router.use("/categories", routerCategory);

export default router;




