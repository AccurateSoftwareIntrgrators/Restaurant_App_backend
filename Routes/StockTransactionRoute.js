import express from "express";
import {
  getAllStockTransactions,
  getStockTransactionById,
  createStockTransaction,
} from "../Controllers/StockTransactionController.js";

const StockTransactionRoute = express.Router();

StockTransactionRoute.route("/").get(getAllStockTransactions).post(createStockTransaction);

// Transactions are a log, so there is no PATCH / DELETE
StockTransactionRoute.route("/:id").get(getStockTransactionById);

export default StockTransactionRoute;