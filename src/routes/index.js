import express from "express";
import routerAuth from "./auth";
import routerBill from "./bill";
import routerCategory from "./category";
import routerComment from "./comment";

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/bill", routerBill);

router.use("/categories", routerCategory);
router.use("/comments", routerComment);

export default router;
