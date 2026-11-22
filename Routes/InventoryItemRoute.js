import express from "express";
import {
  getAllInventoryItems,
  getLowStockItems,
  getExpiringItems,
  getInventoryItemById,
  getInventoryItemTransactions,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../Controllers/InventoryItemController.js";

const InventoryItemRoute = express.Router();

InventoryItemRoute.route("/").get(getAllInventoryItems).post(createInventoryItem);

// Fixed paths must come before "/:id"
InventoryItemRoute.get("/low-stock", getLowStockItems);
InventoryItemRoute.get("/expiring", getExpiringItems);

InventoryItemRoute.route("/:id")
  .get(getInventoryItemById)
  .patch(updateInventoryItem)
  .delete(deleteInventoryItem);

InventoryItemRoute.get("/:id/transactions", getInventoryItemTransactions);

export default InventoryItemRoute;