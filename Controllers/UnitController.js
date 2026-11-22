import { UniqueConstraintError, ValidationError } from "sequelize";
import { Unit, InventoryItem } from "../Models/index.js";
import logger from "../src/logger.js";

const removeUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

//===== Controller functions for Unit =====

//===============================
// Get all units
//===============================
const getAllUnits = async (req, res) => {
  try {
    const records = await Unit.findAll({
      where: { isDele: false },
      order: [["id", "ASC"]],
    });
    logger.info({ count: records.length }, "Fetched all units");
    res.status(200).json(records);
  } catch (err) {
    logger.error({ err }, "Error fetching units");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get single unit
//===============================
const getUnitById = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Fetching unit by ID");

  try {
    const record = await Unit.findOne({ where: { id, isDele: false } });
    if (!record) {
      logger.warn({ id }, "Unit not found");
      return res.status(404).json({ message: "Unit not found" });
    }

    res.status(200).json(record);
  } catch (err) {
    logger.error({ err }, "Error fetching unit by ID");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create unit
//===============================
const createUnit = async (req, res) => {
  const { name, abbreviation } = req.body;
  logger.info({ name }, "Creating new unit");

  try {
    const created = await Unit.create({ name, abbreviation });
    logger.info({ id: created.id }, "Unit created successfully");
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Duplicate unit name");
      return res.status(409).json({ message: "Unit name or abbreviation already exists" });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error creating unit");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Update unit
//===============================
const updateUnit = async (req, res) => {
  const { id } = req.params;
  const { name, abbreviation } = req.body;
  logger.info({ id, name }, "Updating unit");

  try {
    const record = await Unit.findOne({ where: { id, isDele: false } });
    if (!record) {
      logger.warn({ id }, "Unit not found");
      return res.status(404).json({ message: "Unit not found" });
    }

    await record.update(removeUndefined({ name, abbreviation }));
    logger.info({ id }, "Unit updated successfully");
    res.status(200).json(record);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Duplicate unit name");
      return res.status(409).json({ message: "Unit name or abbreviation already exists" });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error updating unit");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Delete unit (soft delete)
//===============================
const deleteUnit = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Deleting unit");

  try {
    const record = await Unit.findOne({ where: { id, isDele: false } });
    if (!record) {
      logger.warn({ id }, "Unit not found");
      return res.status(404).json({ message: "Unit not found" });
    }

    const inUse = await InventoryItem.count({ where: { unitId: id, isDele: false } });
    if (inUse > 0) {
      logger.warn({ id, inUse }, "Unit is still in use");
      return res.status(409).json({ message: `Unit is used by ${inUse} inventory item(s)` });
    }

    await record.update({ isDele: true });
    logger.info({ id }, "Unit deleted successfully");
    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Error deleting unit");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
};