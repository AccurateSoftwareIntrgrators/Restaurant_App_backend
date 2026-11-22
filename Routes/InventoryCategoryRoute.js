import express from "express";
import {
  getAllInventoryCategories,
  getInventoryCategoryById,
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
} from "../Controllers/InventoryCategoryController.js";

const InventoryCategoryRoute = express.Router();

InventoryCategoryRoute.route("/").get(getAllInventoryCategories).post(createInventoryCategory);

InventoryCategoryRoute.route("/:id")
  .get(getInventoryCategoryById)
  .patch(updateInventoryCategory)
  .delete(deleteInventoryCategory);

export default InventoryCategoryRoute;