import { UniqueConstraintError, ValidationError } from "sequelize";
import { Supplier, InventoryItem } from "../Models/index.js";
import logger from "../src/logger.js";

const removeUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

//===== Controller functions for Supplier =====

//===============================
// Get all suppliers
//===============================
const getAllSuppliers = async (req, res) => {
  try {
    const records = await Supplier.findAll({
      where: { isDele: false },
      order: [["id", "ASC"]],
    });
    logger.info({ count: records.length }, "Fetched all suppliers");
    res.status(200).json(records);
  } catch (err) {
    logger.error({ err }, "Error fetching suppliers");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get single supplier
//===============================
const getSupplierById = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Fetching supplier by ID");

  try {
    const record = await Supplier.findOne({ where: { id, isDele: false } });
    if (!record) {
      logger.warn({ id }, "Supplier not found");
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(record);
  } catch (err) {
    logger.error({ err }, "Error fetching supplier by ID");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create supplier
//===============================
const createSupplier = async (req, res) => {
  const { name, contactPerson, phone, email, address } = req.body;
  logger.info({ name }, "Creating new supplier");

  try {
    const created = await Supplier.create({ name, contactPerson, phone, email, address });
    logger.info({ id: created.id }, "Supplier created successfully");
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Duplicate supplier name");
      return res.status(409).json({ message: "Supplier already exists" });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error creating supplier");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Update supplier
//===============================
const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { name, contactPerson, phone, email, address } = req.body;
  logger.info({ id, name }, "Updating supplier");

  try {
    const record = await Supplier.findOne({ where: { id, isDele: false } });
    if (!record) {
      logger.warn({ id }, "Supplier not found");
      return res.status(404).json({ message: "Supplier not found" });
    }

    await record.update(removeUndefined({ name, contactPerson, phone, email, address }));
    logger.info({ id }, "Supplier updated successfully");
    res.status(200).json(record);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Duplicate supplier name");
      return res.status(409).json({ message: "Supplier already exists" });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error updating supplier");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Delete supplier (soft delete)
//===============================
const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Deleting supplier");

  try {
    const record = await Supplier.findOne({ where: { id, isDele: false } });
    if (!record) {
      logger.warn({ id }, "Supplier not found");
      return res.status(404).json({ message: "Supplier not found" });
    }

    const inUse = await InventoryItem.count({ where: { supplierId: id, isDele: false } });
    if (inUse > 0) {
      logger.warn({ id, inUse }, "Supplier is still in use");
      return res.status(409).json({ message: `Supplier is used by ${inUse} inventory item(s)` });
    }

    await record.update({ isDele: true });
    logger.info({ id }, "Supplier deleted successfully");
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Error deleting supplier");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};