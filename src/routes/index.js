import express from "express";
import routerCategory from "./category";

const router = express.Router();
router.use("/auth", routerAuth);

router.use("/categories", routerCategory);

export default router;
