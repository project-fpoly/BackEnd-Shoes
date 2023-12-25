import express from "express";
import routerAuth from "./auth";
<<<<<<< HEAD
import routerBill from "./bill";
=======
import routerCategory from "./category";
>>>>>>> da9b94690d6446b27254ff3856f25d7000424232

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/   ", routerBill);

router.use("/categories", routerCategory);

export default router;
