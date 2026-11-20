import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from "sequelize";
import { Position } from "../Models/index.js";
import logger from "../src/logger.js";

//===== Controller functions for Position =====

//===============================
// Get all positions
//===============================
const getAllPositions = async (req, res) => {
  try {
    const positions = await Position.findAll({ order: [["id", "ASC"]] });
    logger.info({ count: positions.length }, "Fetched all positions");
    res.status(200).json(positions);
  } catch (err) {
    logger.error({ err }, "Error fetching positions");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create position
//===============================
const createPosition = async (req, res) => {
  const { name, description } = req.body;
  logger.info({ name }, "Creating new position");

  try {
    const position = await Position.create({ name, description });
    logger.info({ id: position.id }, "Position created successfully");
    res.status(201).json(position);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Position already exists");
      return res.status(400).json({ message: "Position already exists" });
    }
    if (err instanceof ValidationError) {
      logger.warn({ err }, "Position validation failed");
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error creating position");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Update position
//===============================
const updatePosition = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  logger.info({ id, name }, "Updating position");

  try {
    const position = await Position.findByPk(id);
    if (!position) {
      logger.warn({ id }, "Position not found");
      return res.status(404).json({ message: "Position not found" });
    }

    await position.update({ name, description });
    logger.info({ id }, "Position updated successfully");
    res.status(200).json(position);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Position name already exists");
      return res.status(400).json({ message: "Position already exists" });
    }
    if (err instanceof ValidationError) {
      logger.warn({ err }, "Position validation failed");
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error updating position");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Delete position
//===============================
const deletePosition = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Deleting position");

  try {
    const position = await Position.findByPk(id);
    if (!position) {
      logger.warn({ id }, "Position not found");
      return res.status(404).json({ message: "Position not found" });
    }

    await position.destroy();
    logger.info({ id }, "Position deleted successfully");
    res.status(200).json({ message: "Position deleted successfully" });
  } catch (err) {
    if (err instanceof ForeignKeyConstraintError) {
      logger.warn({ err }, "Position is in use by employees");
      return res.status(400).json({ message: "Cannot delete a position that employees are assigned to" });
    }
    logger.error({ err }, "Error deleting position");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { getAllPositions, createPosition, updatePosition, deletePosition };