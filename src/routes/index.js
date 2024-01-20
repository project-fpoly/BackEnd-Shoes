import express from "express";
import routerAuth from "./auth.js";
import routerComment from "./comment.js";

const router = express.Router();
router.use("/auth", routerAuth);
// router.use("/bill", routerBill);

// router.use("/categories", routerCategory);
router.use("/comments", routerComment);

export default router;
