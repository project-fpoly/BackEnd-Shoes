import { Router } from "express";
import { createSale, deleteSale, getSales, updateSale } from "../controllers/sale.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const routerSale = Router()

routerSale.get("/",checkPermission, getSales);
routerSale.post("/",checkPermission, createSale);
routerSale.put("/:id",checkPermission, updateSale);
routerSale.delete("/:id",checkPermission, deleteSale);
export default routerSale