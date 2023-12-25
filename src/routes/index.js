import express from "express";
import routerAuth from "./auth";
<<<<<<< HEAD
import routerCart from "./cart";
=======
import routerCategory from "./category";
>>>>>>> da9b94690d6446b27254ff3856f25d7000424232

const router = express.Router();
router.use("/auth", routerAuth);
router.use("/order", routerCart);

router.use("/categories", routerCategory);

export default router;
