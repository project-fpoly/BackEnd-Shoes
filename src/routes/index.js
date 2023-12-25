import express from "express";
import routerAuth from "./auth";

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/bill", routerBill);

router.use("/categories", routerCategory);

export default router;
