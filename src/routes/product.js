import {
  addProduct,
  getAllProduct,
  getDetailProduct,
  updateProduct,
  deleteProduct,
  RestoreProduct,
  tryDeleteProduct,
  fetchMaterial,
  fetchColor,
  fetchSize,
  fetchTechSpec,
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
routerProduct.get("/material", fetchMaterial);
routerProduct.get("/color", fetchColor);
routerProduct.get("/size", fetchSize);
routerProduct.get("/tech_spec", fetchTechSpec);

export default routerProduct;