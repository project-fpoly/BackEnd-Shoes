import { Router } from "express";

const routerBill = Router();

routerBill.post("/createBill", signUp);
routerBill.post("/getBillById", signUp);
routerBill.post("/getAllBill", signUp);

export default routerAuth;
