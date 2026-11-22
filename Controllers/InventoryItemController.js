import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError, Op } from "sequelize";
import {
  sequelize,
  InventoryItem,
  InventoryCategory,
  Unit,
  Supplier,
  Location,
  StockTransaction,
  Employee,
} from "../Models/index.js";
import logger from "../src/logger.js";

const inventoryItemIncludes = [
  { model: InventoryCategory, as: "category", attributes: ["id", "name"] },
  { model: Unit, as: "unit", attributes: ["id", "name", "abbreviation"] },
  { model: Supplier, as: "supplier", attributes: ["id", "name", "phone"] },
  { model: Location, as: "location", attributes: ["id", "name"] },
];

// Only keep fields the client actually sent (so PATCH doesn't overwrite with undefined)
const removeUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

// quantity_in_stock <= reorder_level, only for items that have a reorder level set
const lowStockCondition = () => [
  { reorderLevel: { [Op.gt]: 0 } },
  sequelize.where(
    sequelize.col("InventoryItem.quantity_in_stock"),
    Op.lte,
    sequelize.col("InventoryItem.reorder_level"),
  ),
];

//===== Controller functions for InventoryItem =====

//===============================
// Get all inventory items
// Optional query: ?categoryId= &supplierId= &locationId= &search= &lowStock=true
//===============================
const getAllInventoryItems = async (req, res) => {
  const { categoryId, supplierId, locationId, search, lowStock } = req.query;

  try {
    const where = { isDele: false };
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (locationId) where.locationId = locationId;
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (lowStock === "true") where[Op.and] = lowStockCondition();

    const items = await InventoryItem.findAll({
      where,
      include: inventoryItemIncludes,
      order: [["name", "ASC"]],
    });
    logger.info({ count: items.length }, "Fetched all inventory items");
    res.status(200).json(items);
  } catch (err) {
    logger.error({ err }, "Error fetching inventory items");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get low stock items
//===============================
const getLowStockItems = async (req, res) => {
  try {
    const items = await InventoryItem.findAll({
      where: { isDele: false, isActive: true, [Op.and]: lowStockCondition() },
      include: inventoryItemIncludes,
      order: [["name", "ASC"]],
    });
    logger.info({ count: items.length }, "Fetched low stock items");
    res.status(200).json(items);
  } catch (err) {
    logger.error({ err }, "Error fetching low stock items");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get items expiring soon (default 7 days)  ?days=14
//===============================
const getExpiringItems = async (req, res) => {
  const days = Number(req.query.days) || 7;

  try {
    const limit = new Date();
    limit.setDate(limit.getDate() + days);
    const limitDate = limit.toISOString().slice(0, 10); // DATEONLY

    const items = await InventoryItem.findAll({
      where: {
        isDele: false,
        expiryDate: { [Op.ne]: null, [Op.lte]: limitDate },
      },
      include: inventoryItemIncludes,
      order: [["expiryDate", "ASC"]],
    });
    logger.info({ count: items.length, days }, "Fetched expiring items");
    res.status(200).json(items);
  } catch (err) {
    logger.error({ err }, "Error fetching expiring items");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get single inventory item
//===============================
const getInventoryItemById = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Fetching inventory item by ID");

  try {
    const item = await InventoryItem.findOne({
      where: { id, isDele: false },
      include: inventoryItemIncludes,
    });
    if (!item) {
      logger.warn({ id }, "Inventory item not found");
      return res.status(404).json({ message: "Inventory item not found" });
    }

    logger.info({ id }, "Fetched inventory item by ID");
    res.status(200).json(item);
  } catch (err) {
    logger.error({ err }, "Error fetching inventory item by ID");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get stock history of one item
//===============================
const getInventoryItemTransactions = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await InventoryItem.findOne({ where: { id, isDele: false } });
    if (!item) {
      logger.warn({ id }, "Inventory item not found");
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const transactions = await StockTransaction.findAll({
      where: { inventoryItemId: id },
      include: [{ model: Employee, as: "employee", attributes: ["id", "name"] }],
      order: [["transactionDate", "DESC"], ["id", "DESC"]],
    });
    logger.info({ id, count: transactions.length }, "Fetched item stock history");
    res.status(200).json(transactions);
  } catch (err) {
    logger.error({ err }, "Error fetching item stock history");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create inventory item
// (opening stock is added through a PURCHASE stock transaction, not here)
//===============================
const createInventoryItem = async (req, res) => {
  const {
    name, sku, description, categoryId, unitId, supplierId, locationId,
    reorderLevel, costPerUnit, expiryDate, isActive,
  } = req.body;
  logger.info({ name, categoryId, unitId }, "Creating new inventory item");

  try {
    const created = await InventoryItem.create(
      removeUndefined({
        name, sku, description, categoryId, unitId, supplierId, locationId,
        reorderLevel, costPerUnit, expiryDate, isActive,
      }),
    );

    // Re-fetch so the response includes the related names
    const item = await InventoryItem.findByPk(created.id, { include: inventoryItemIncludes });

    logger.info({ id: created.id }, "Inventory item created successfully");
    res.status(201).json(item);
  } catch (err) {
    if (err instanceof ForeignKeyConstraintError) {
      logger.warn({ err }, "Invalid categoryId / unitId / supplierId / locationId");
      return res.status(400).json({ message: "Invalid categoryId, unitId, supplierId or locationId" });
    }
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Duplicate SKU");
      return res.status(409).json({ message: "SKU already exists" });
    }
    if (err instanceof ValidationError) {
      logger.warn({ err }, "Inventory item validation failed");
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error creating inventory item");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Update inventory item
// (quantityInStock is NOT editable here, use /stock-transactions)
//===============================
const updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const {
    name, sku, description, categoryId, unitId, supplierId, locationId,
    reorderLevel, costPerUnit, expiryDate, isActive,
  } = req.body;
  logger.info({ id, name }, "Updating inventory item");

  try {
    const item = await InventoryItem.findOne({ where: { id, isDele: false } });
    if (!item) {
      logger.warn({ id }, "Inventory item not found");
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await item.update(
      removeUndefined({
        name, sku, description, categoryId, unitId, supplierId, locationId,
        reorderLevel, costPerUnit, expiryDate, isActive,
      }),
    );

    const updated = await InventoryItem.findByPk(id, { include: inventoryItemIncludes });

    logger.info({ id }, "Inventory item updated successfully");
    res.status(200).json(updated);
  } catch (err) {
    if (err instanceof ForeignKeyConstraintError) {
      logger.warn({ err }, "Invalid categoryId / unitId / supplierId / locationId");
      return res.status(400).json({ message: "Invalid categoryId, unitId, supplierId or locationId" });
    }
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Duplicate SKU");
      return res.status(409).json({ message: "SKU already exists" });
    }
    if (err instanceof ValidationError) {
      logger.warn({ err }, "Inventory item validation failed");
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error updating inventory item");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Delete inventory item (soft delete)
//===============================
const deleteInventoryItem = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Deleting inventory item");

  try {
    const item = await InventoryItem.findOne({ where: { id, isDele: false } });
    if (!item) {
      logger.warn({ id }, "Inventory item not found");
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await item.update({ isDele: true });
    logger.info({ id }, "Inventory item deleted successfully");
    res.status(200).json({ message: "Inventory item deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Error deleting inventory item");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getAllInventoryItems,
  getLowStockItems,
  getExpiringItems,
  getInventoryItemById,
  getInventoryItemTransactions,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};