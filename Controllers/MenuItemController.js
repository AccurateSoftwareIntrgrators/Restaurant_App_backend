import { ForeignKeyConstraintError } from "sequelize";
import { MenuItem, FoodType, OrderType, Location } from "../Models/index.js";
import logger from "../src/logger.js";

const menuItemIncludes = [
  { model: FoodType, as: "foodType", attributes: ["id", "name"] },
  { model: OrderType, as: "orderType", attributes: ["id", "name"] },
  { model: Location, as: "location", attributes: ["id", "name"] },
];

//===== Controller functions for MenuItem =====

//===============================
// Get all menu items
//===============================
const getAllMenuItems = async (req, res) => {
  try {
    const menu = await MenuItem.findAll({
      where: { isDele: false },
      include: menuItemIncludes,
      order: [["id", "ASC"]],
    });
    logger.info({ count: menu.length }, "Fetched all menu items");
    res.status(200).json(menu);
  } catch (err) {
    logger.error({ err }, "Error fetching menu items");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get single menu item
//===============================
const getMenuItemById = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Fetching menu item by ID");

  try {
    const menuItem = await MenuItem.findOne({
      where: { id, isDele: false },
      include: menuItemIncludes,
    });
    if (!menuItem) {
      logger.warn({ id }, "Menu item not found");
      return res.status(404).json({ message: "Menu item not found" });
    }

    logger.info({ id }, "Fetched menu item by ID");
    res.status(200).json(menuItem);
  } catch (err) {
    logger.error({ err }, "Error fetching menu item by ID");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create menu item
//===============================
const createMenuItem = async (req, res) => {
  const { name, description, price, isAvailable, foodTypeId, orderTypeId, locationId } = req.body;
  logger.info({ name, price, foodTypeId, orderTypeId, locationId }, "Creating new menu item");

  try {
    const created = await MenuItem.create({
      name,
      description,
      price,
      isAvailable,
      foodTypeId,
      orderTypeId,
      locationId,
    });

    // Re-fetch so the response includes the related names
    const menuItem = await MenuItem.findByPk(created.id, { include: menuItemIncludes });

    logger.info({ id: created.id }, "Menu item created successfully");
    res.status(201).json(menuItem);
  } catch (err) {
    if (err instanceof ForeignKeyConstraintError) {
      logger.warn({ err }, "Invalid foodTypeId / orderTypeId / locationId");
      return res.status(400).json({ message: "Invalid foodTypeId, orderTypeId or locationId" });
    }
    logger.error({ err }, "Error creating menu item");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Update menu item
//===============================
const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, isAvailable, foodTypeId, orderTypeId, locationId } = req.body;
  logger.info({ id, name, price, foodTypeId, orderTypeId, locationId }, "Updating menu item");

  try {
    const menuItem = await MenuItem.findOne({ where: { id, isDele: false } });
    if (!menuItem) {
      logger.warn({ id }, "Menu item not found");
      return res.status(404).json({ message: "Menu item not found" });
    }

    await menuItem.update({
      name,
      description,
      price,
      isAvailable,
      foodTypeId,
      orderTypeId,
      locationId,
    });

    const updated = await MenuItem.findByPk(id, { include: menuItemIncludes });

    logger.info({ id }, "Menu item updated successfully");
    res.status(200).json(updated);
  } catch (err) {
    if (err instanceof ForeignKeyConstraintError) {
      logger.warn({ err }, "Invalid foodTypeId / orderTypeId / locationId");
      return res.status(400).json({ message: "Invalid foodTypeId, orderTypeId or locationId" });
    }
    logger.error({ err }, "Error updating menu item");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Delete menu item (soft delete)
//===============================
const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Deleting menu item");

  try {
    const menuItem = await MenuItem.findOne({ where: { id, isDele: false } });
    if (!menuItem) {
      logger.warn({ id }, "Menu item not found");
      return res.status(404).json({ message: "Menu item not found" });
    }

    await menuItem.update({ isDele: true });
    logger.info({ id }, "Menu item deleted successfully");
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Error deleting menu item");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};