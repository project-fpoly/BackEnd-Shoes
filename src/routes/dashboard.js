import { Router } from "express";
import { getDataChart, getList, postList } from "../controllers/dashboard.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const routerDashboard = Router()

routerDashboard.get("/list",checkPermission, getList);
routerDashboard.get("/data/:id",checkPermission, getDataChart);
routerDashboard.post("/list",checkPermission, postList);
// routerDashboard.put("/list/:id",checkPermission, updateList);
// routerDashboard.delete("/list/:id",checkPermission, deleteList);
export default routerDashboard