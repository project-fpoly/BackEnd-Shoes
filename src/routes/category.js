import { Router } from "express";
import {
  createCategory,
  getAllCategory,
  removeCategory,
  updateCategory,
} from "../controllers/category";

const routerCategory = Router();

routerCategory.get("/", getAllCategory);
routerCategory.post("/", createCategory);
routerCategory.put(`/:id`, updateCategory);
routerCategory.delete("/:id", removeCategory);

export default routerCategory;
