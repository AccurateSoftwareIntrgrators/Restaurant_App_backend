import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from "sequelize";
import { EmployeeType } from "../Models/index.js";
import logger from "../src/logger.js";

//===== Controller functions for EmployeeType =====

//===============================
// Get all employee types
//===============================
const getAllEmployeeTypes = async (req, res) => {
  try {
    const types = await EmployeeType.findAll({ order: [["id", "ASC"]] });
    logger.info({ count: types.length }, "Fetched all employee types");
    res.status(200).json(types);
  } catch (err) {
    logger.error({ err }, "Error fetching employee types");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create employee type
//===============================
const createEmployeeType = async (req, res) => {
  const { name } = req.body;
  logger.info({ name }, "Creating new employee type");

  try {
    const type = await EmployeeType.create({ name });
    logger.info({ id: type.id }, "Employee type created successfully");
    res.status(201).json(type);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Employee type already exists");
      return res.status(400).json({ message: "Employee type already exists" });
    }
    if (err instanceof ValidationError) {
      logger.warn({ err }, "Employee type validation failed");
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error creating employee type");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Update employee type
//===============================
const updateEmployeeType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  logger.info({ id, name }, "Updating employee type");

  try {
    const type = await EmployeeType.findByPk(id);
    if (!type) {
      logger.warn({ id }, "Employee type not found");
      return res.status(404).json({ message: "Employee type not found" });
    }

    await type.update({ name });
    logger.info({ id }, "Employee type updated successfully");
    res.status(200).json(type);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Employee type name already exists");
      return res.status(400).json({ message: "Employee type already exists" });
    }
    if (err instanceof ValidationError) {
      logger.warn({ err }, "Employee type validation failed");
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    logger.error({ err }, "Error updating employee type");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Delete employee type
//===============================
const deleteEmployeeType = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Deleting employee type");

  try {
    const type = await EmployeeType.findByPk(id);
    if (!type) {
      logger.warn({ id }, "Employee type not found");
      return res.status(404).json({ message: "Employee type not found" });
    }

    await type.destroy();
    logger.info({ id }, "Employee type deleted successfully");
    res.status(200).json({ message: "Employee type deleted successfully" });
  } catch (err) {
    if (err instanceof ForeignKeyConstraintError) {
      logger.warn({ err }, "Employee type is in use by employees");
      return res.status(400).json({ message: "Cannot delete an employee type that employees are assigned to" });
    }
    logger.error({ err }, "Error deleting employee type");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { getAllEmployeeTypes, createEmployeeType, updateEmployeeType, deleteEmployeeType };