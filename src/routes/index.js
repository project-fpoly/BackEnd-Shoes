import express from "express";
import routerAuth from "./auth";
import routerCategory from "./category";
import routerProduct from "./product";
import routerBill from "./bill";
import routerCart from "./cart";
import routerComment from "./comment";
import routerNotification from "./notification";

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/bill", routerBill);

router.use("/product", routerProduct);

router.use("/categories", routerCategory);
router.use("/comments", routerComment);
router.use("/order", routerCart);
router.use("/notification", routerNotification);

export default router;
