import { UniqueConstraintError, ValidationError } from "sequelize";
import { InventoryCategory, InventoryItem } from "../Models/index.js";
import logger from "../src/logger.js";

const removeUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

//===== Controller functions for InventoryCategory =====

//===============================
// Get all inventory categories
//===============================
const getAllInventoryCategories = async (req, res) => {
  try {
    const categories = await InventoryCategory.findAll({
      where: { isDele: false },
      order: [["id", "ASC"]],
    });
    logger.info({ count: categories.length }, "Fetched all inventory categories");
    res.status(200).json(categories);
  } catch (err) {
    logger.error({ err }, "Error fetching inventory categories");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get single inventory category
//===============================
const getInventoryCategoryById = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Fetching inventory category by ID");

  try {
    const category = await InventoryCategory.findOne({ where: { id, isDele: false } });
    if (!category) {
      logger.warn({ id }, "Inventory category not found");
      return res.status(404).json({ message: "Inventory category not found" });
    }

    res.status(200).json(category);
  } catch (err) {
    logger.error({ err }, "Error fetching inventory category by ID");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create inventory category
//===============================
const createInventoryCategory = async (req, res) => {
  const { name, description } = req.body;
  logger.info({ name }, "Creating new inventory category");

  try {
    const created = await InventoryCategory.create({ name, description });
    logger.info({ id: created.id }, "Inventory category created successfully");
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Duplicate inventory category name");
      return res.status(409).json({ message: "Category name already exists" });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error creating inventory category");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Update inventory category
//===============================
const updateInventoryCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  logger.info({ id, name }, "Updating inventory category");

  try {
    const category = await InventoryCategory.findOne({ where: { id, isDele: false } });
    if (!category) {
      logger.warn({ id }, "Inventory category not found");
      return res.status(404).json({ message: "Inventory category not found" });
    }

    await category.update(removeUndefined({ name, description }));
    logger.info({ id }, "Inventory category updated successfully");
    res.status(200).json(category);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Duplicate inventory category name");
      return res.status(409).json({ message: "Category name already exists" });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error updating inventory category");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Delete inventory category (soft delete)
//===============================
const deleteInventoryCategory = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Deleting inventory category");

  try {
    const category = await InventoryCategory.findOne({ where: { id, isDele: false } });
    if (!category) {
      logger.warn({ id }, "Inventory category not found");
      return res.status(404).json({ message: "Inventory category not found" });
    }

    const inUse = await InventoryItem.count({ where: { categoryId: id, isDele: false } });
    if (inUse > 0) {
      logger.warn({ id, inUse }, "Inventory category still has items");
      return res.status(409).json({ message: `Category is used by ${inUse} inventory item(s)` });
    }

    await category.update({ isDele: true });
    logger.info({ id }, "Inventory category deleted successfully");
    res.status(200).json({ message: "Inventory category deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Error deleting inventory category");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getAllInventoryCategories,
  getInventoryCategoryById,
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
};