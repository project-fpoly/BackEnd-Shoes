import express from "express";
import routerAnalytic from "./analytic.js";
import routerAuth from "./auth.js";
import routerBill from "./bill.js";
import routerCart from "./cart.js";
import routerCategory from "./category.js";
import routerChat from "./chat.js";
import routerComment from "./comment.js";
import routerDashboard from "./dashboard.js";
import routerFavourite from "./fav.js";
import routerNotification from "./notification.js";
import routerProduct from "./product.js";
import routerSale from "./sale.js";
import routerVoucher from "./voucher.js";

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/bill", routerBill);

router.use("/product", routerProduct);
router.use("/chat",routerChat);
router.use("/categories", routerCategory);
router.use("/comments", routerComment);
router.use("/order", routerCart);
router.use("/notification", routerNotification);
router.use("/fav", routerFavourite);
router.use("/voucher", routerVoucher);
router.use("/sale", routerSale);
router.use("/analytics", routerAnalytic)
router.use("/dashboard", routerDashboard)

export default router;
