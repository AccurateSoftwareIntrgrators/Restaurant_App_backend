import {  OrderType } from "../Models/index.js";
import logger from "../src/logger.js";


//===== Controller functions for MenuItem =====

//===============================
// Get all order types
//===============================
const getAllOrderTypes = async (req, res) => {
  try {
    const orderTypes = await OrderType.findAll({
      where: { isDele: false },
      order: [["id", "ASC"]],
    });
    logger.info({ count: orderTypes.length }, "Fetched all order types");
    res.status(200).json(orderTypes);
  } catch (err) {
    logger.error({ err }, "Error fetching order types");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get single order type
//===============================
const getOrderTypeById = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Fetching order type by ID");

  try {
    const orderType = await OrderType.findOne({
      where: { id, isDele: false },
    });
    if (!orderType) {
      logger.warn({ id }, "Order type not found");
      return res.status(404).json({ message: "Order type not found" });
    }

    logger.info({ id }, "Fetched order type by ID");
    res.status(200).json(orderType);
  } catch (err) {
    logger.error({ err }, "Error fetching order type by ID");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create order type
//===============================
const createOrderType = async (req, res) => {
  const { name } = req.body;
  logger.info({ name }, "Creating new order type");

  try {
    const created = await OrderType.create({
      name,
    });
    logger.info({ id: created.id }, "Order type created successfully");
    res.status(201).json(created);
  } catch (err) {
    logger.error({ err }, "Error creating order type");
    res.status(500).json({ message: "Internal Server Error" });
  }
};



//===============================
// Update order type
//===============================
const updateOrderType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  logger.info({ id, name }, "Updating order type");

  try {
    const orderType = await OrderType.findOne({ where: { id, isDele: false } });
    if (!orderType) {
      logger.warn({ id }, "Order type not found");
      return res.status(404).json({ message: "Order type not found" });
    }

    await orderType.update({
      name,
    });


    logger.info({ id }, "Order type updated successfully");
    res.status(200).json(orderType);
  } catch (err) {
    logger.error({ err }, "Error updating order type");
    res.status(500).json({ message: "Internal Server Error" });
  }
}
  
//===============================
// Delete order type (soft delete)
//===============================
const deleteOrderType = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Deleting order type");

  try {
    const orderType = await OrderType.findOne({ where: { id, isDele: false } });
    if (!orderType) {
      logger.warn({ id }, "Order type not found");
      return res.status(404).json({ message: "Order type not found" });
    }

    await orderType.update({ isDele: true });
    logger.info({ id }, "Order type deleted successfully");
    res.status(200).json({ message: "Order type deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Error deleting order type ");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getAllOrderTypes,
  getOrderTypeById,
  createOrderType,
  updateOrderType,
  deleteOrderType,
}