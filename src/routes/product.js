import {
    addProduct,
    getAllProduct,
    getDetailProduct,
    updateProduct,
    deleteProduct,
    upload,
  } from "../controllers/product";
  import express from "express";
import { checkPermission } from "../middlewares/checkPermission";
  
  const routerProduct = express.Router();
  
  routerProduct.post("/", addProduct);
  routerProduct.get("/", getAllProduct);
  routerProduct.put("/:id", updateProduct);
  routerProduct.delete("/:id",checkPermission, deleteProduct);
  routerProduct.get("/:id", getDetailProduct);
  
  export default routerProduct;