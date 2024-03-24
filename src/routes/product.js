import {
  addProduct,
  getAllProduct,
  getDetailProduct,
  updateProduct,
  deleteProduct,
  RestoreProduct,
  tryDeleteProduct,
  upload,
} from "../controllers/product.js";
import express from "express";
import { checkPermission } from "../middlewares/checkPermission.js";

const routerProduct = express.Router();

routerProduct.post("/", addProduct);
routerProduct.get("/", getAllProduct);
routerProduct.put("/:id", updateProduct);
routerProduct.patch("/:id", tryDeleteProduct);
routerProduct.patch("/:id", RestoreProduct);
routerProduct.delete("/:id", checkPermission, deleteProduct);
routerProduct.get("/:id", getDetailProduct);

export default routerProduct;