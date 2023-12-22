import {
    addProduct,
    getAllProduct,
    getDetailProduct,
    updateProduct,
    deleteProduct,
    upload,
  } from "../controllers/productController";
  import express from "express";
  
  const routerProduct = express.Router();
  
  routerProduct.post("/", addProduct);
  routerProduct.get("/", getAllProduct);
  routerProduct.put("/:id", updateProduct);
  routerProduct.delete("/:id", deleteProduct);
  routerProduct.get("/:id", getDetailProduct);
  
  export default routerProduct;