import express from "express";
import routerAuth from "./auth";
<<<<<<<<< Temporary merge branch 1
import routerCategory from "./category";
=========
import routerBill from "./bill";
>>>>>>>>> Temporary merge branch 2

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/   ", routerBill);

router.use("/categories", routerCategory);

export default router;
