import express from "express";
import routerAuth from "./auth.js";
import routerCategory from "./category.js";
import routerProduct from "./product.js";
import routerBill from "./bill.js";
import routerCart from "./cart.js";
import routerComment from "./comment.js";
import routerNotification from "./notification.js";

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/bill", routerBill);

router.use("/product", routerProduct);

router.use("/categories", routerCategory);
router.use("/comments", routerComment);
router.use("/order", routerCart);
router.use("/notification", routerNotification);

export default router;
