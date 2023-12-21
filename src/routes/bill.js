import { Router } from "express";
import {
  UpdateBill,
  createBill,
  deleteBill,
  getAllBill,
  getBillById,
  updateBill,
} from "../controllers/bill";

const routerBill = Router();

routerBill.post("/createBill", createBill);
routerBill.get("/getBillById", getBillById);
routerBill.get("/getAllBill", getAllBill);
routerBill.delete("/deleteBill/:id", deleteBill);
routerBill.patch("/updateBill", updateBill);

export default routerAuth;
