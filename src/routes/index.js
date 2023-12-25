import express from "express";
import routerAuth from "./auth";
import routerBill from "./bill";

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/   ", routerBill);

export default router;
