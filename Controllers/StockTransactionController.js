import { ForeignKeyConstraintError, Op } from "sequelize";
import { sequelize, InventoryItem, StockTransaction, Employee, Unit } from "../Models/index.js";
import logger from "../src/logger.js";

const stockTransactionIncludes = [
  {
    model: InventoryItem,
    as: "inventoryItem",
    attributes: ["id", "name", "quantityInStock"],
    include: [{ model: Unit, as: "unit", attributes: ["id", "abbreviation"] }],
  },
  { model: Employee, as: "employee", attributes: ["id", "name"] },
];

const TYPES = ["PURCHASE", "USAGE", "WASTE", "RETURN", "ADJUSTMENT"];

// PURCHASE adds stock. USAGE / WASTE / RETURN (back to supplier) remove stock.
// ADJUSTMENT uses the signed quantity as sent (+ adds, - removes), for stock-take corrections.
const stockChange = (type, quantity) => {
  if (type === "PURCHASE") return Math.abs(quantity);
  if (type === "ADJUSTMENT") return quantity;
  return -Math.abs(quantity);
};

// Small error carrying an HTTP status, used to roll the DB transaction back
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

//===== Controller functions for StockTransaction =====

//===============================
// Get all stock transactions
// Optional query: ?inventoryItemId= &type= &from=YYYY-MM-DD &to=YYYY-MM-DD
//===============================
const getAllStockTransactions = async (req, res) => {
  const { inventoryItemId, type, from, to } = req.query;

  try {
    const where = {};
    if (inventoryItemId) where.inventoryItemId = inventoryItemId;
    if (type) where.type = type.toUpperCase();
    if (from || to) {
      where.transactionDate = {};
      if (from) where.transactionDate[Op.gte] = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        where.transactionDate[Op.lte] = end;
      }
    }

    const transactions = await StockTransaction.findAll({
      where,
      include: stockTransactionIncludes,
      order: [["transactionDate", "DESC"], ["id", "DESC"]],
    });
    logger.info({ count: transactions.length }, "Fetched all stock transactions");
    res.status(200).json(transactions);
  } catch (err) {
    logger.error({ err }, "Error fetching stock transactions");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get single stock transaction
//===============================
const getStockTransactionById = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Fetching stock transaction by ID");

  try {
    const transaction = await StockTransaction.findByPk(id, { include: stockTransactionIncludes });
    if (!transaction) {
      logger.warn({ id }, "Stock transaction not found");
      return res.status(404).json({ message: "Stock transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (err) {
    logger.error({ err }, "Error fetching stock transaction by ID");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create stock transaction
// Logs the movement AND updates the item's quantityInStock in one DB transaction
//===============================
const createStockTransaction = async (req, res) => {
  const { inventoryItemId, employeeId, quantity, costPerUnit, note, transactionDate } = req.body;
  const type = req.body.type ? String(req.body.type).toUpperCase() : undefined;
  logger.info({ inventoryItemId, type, quantity }, "Creating stock transaction");

  // ----- Validate input -----
  if (!inventoryItemId) {
    return res.status(400).json({ message: "inventoryItemId is required" });
  }
  if (!TYPES.includes(type)) {
    return res.status(400).json({ message: `type must be one of: ${TYPES.join(", ")}` });
  }
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty === 0) {
    return res.status(400).json({ message: "quantity must be a non-zero number" });
  }
  if (type !== "ADJUSTMENT" && qty < 0) {
    return res.status(400).json({ message: "quantity must be positive (only ADJUSTMENT can be negative)" });
  }

  try {
    const created = await sequelize.transaction(async (t) => {
      // Lock the row so two requests can't change the same stock at once
      const item = await InventoryItem.findOne({
        where: { id: inventoryItemId, isDele: false },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!item) throw new HttpError(404, "Inventory item not found");

      const change = stockChange(type, qty);
      const newQty = Math.round((Number(item.quantityInStock) + change) * 1000) / 1000;
      if (newQty < 0) {
        throw new HttpError(
          400,
          `Insufficient stock. Available: ${Number(item.quantityInStock)}, requested change: ${change}`,
        );
      }

      const itemUpdate = { quantityInStock: newQty };
      // A purchase price becomes the item's latest cost
      if (type === "PURCHASE" && costPerUnit !== undefined && costPerUnit !== null) {
        itemUpdate.costPerUnit = costPerUnit;
      }
      await item.update(itemUpdate, { transaction: t });

      return StockTransaction.create(
        {
          inventoryItemId,
          employeeId,
          type,
          quantity: type === "ADJUSTMENT" ? qty : Math.abs(qty),
          costPerUnit,
          note,
          ...(transactionDate ? { transactionDate } : {}),
        },
        { transaction: t },
      );
    });

    const transaction = await StockTransaction.findByPk(created.id, { include: stockTransactionIncludes });

    logger.info({ id: created.id, inventoryItemId, type }, "Stock transaction created successfully");
    res.status(201).json(transaction);
  } catch (err) {
    if (err instanceof HttpError) {
      logger.warn({ inventoryItemId, type }, err.message);
      return res.status(err.status).json({ message: err.message });
    }
    if (err instanceof ForeignKeyConstraintError) {
      logger.warn({ err }, "Invalid inventoryItemId / employeeId");
      return res.status(400).json({ message: "Invalid inventoryItemId or employeeId" });
    }
    logger.error({ err }, "Error creating stock transaction");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { getAllStockTransactions, getStockTransactionById, createStockTransaction };