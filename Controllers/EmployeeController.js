import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from "sequelize";
import { Employee, Position, EmployeeType } from "../Models/index.js";
import logger from "../src/logger.js";

const employeeIncludes = [
  { model: Position, as: "position", attributes: ["id", "name"] },
  { model: EmployeeType, as: "employeeType", attributes: ["id", "name"] },
];

//===== Controller functions for Employee =====

//===============================
// Get all employees
//===============================
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: { isDeleted: false },
      include: employeeIncludes,
      order: [["id", "ASC"]],
    });
    logger.info({ count: employees.length }, "Fetched all employees");
    res.status(200).json(employees);
  } catch (err) {
    logger.error({ err }, "Error fetching all employees");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get single employee
//===============================
const getSingleEmployee = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Fetching employee by ID");

  try {
    const employee = await Employee.findOne({
      where: { id, isDeleted: false },
      include: employeeIncludes,
    });
    if (!employee) {
      logger.warn({ id }, "Employee not found");
      return res.status(404).json({ message: "Employee not found" });
    }

    logger.info({ id }, "Fetched employee by ID");
    res.status(200).json(employee);
  } catch (err) {
    logger.error({ err }, "Error fetching employee by ID");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create employee
//===============================
const createEmployee = async (req, res) => {
  const { name, email, nationalId, phone, address, emergencyContact, positionId, salary, employmentDate, employeeStatus, employeeTypeId, employeeId } = req.body;
  logger.info({ name, employeeId, positionId, employeeTypeId }, "Creating new employee");

  try {
    const isEmployeeIdExists = await Employee.findOne({ where: { employeeId } });
    if (isEmployeeIdExists) {
      logger.warn({ employeeId }, "Employee ID already exists");
      return res.status(400).json({ message: "Employee ID already exists" });
    }

    const created = await Employee.create({
      name,
      email,
      nationalId,
      phone,
      address,
      emergencyContact,
      positionId,
      salary,
      employmentDate,
      employeeStatus,
      employeeTypeId,
      employeeId,
    });

    // Re-fetch so the response includes the related names
    const employee = await Employee.findByPk(created.id, { include: employeeIncludes });

    logger.info({ id: created.id }, "Employee created successfully");
    res.status(201).json(employee);
  } catch (err) {
    if (err instanceof ForeignKeyConstraintError) {
      logger.warn({ err }, "Invalid positionId / employeeTypeId");
      return res.status(400).json({ message: "Invalid positionId or employeeTypeId" });
    }
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Duplicate email / nationalId / employeeId");
      return res.status(400).json({ message: "Email, national ID, or employee ID already exists" });
    }
    if (err instanceof ValidationError) {
      logger.warn({ err }, "Employee validation failed");
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    if (err.parent?.code === "22P02") {
      logger.warn({ err }, "Invalid employeeStatus");
      return res.status(400).json({ message: "Invalid employeeStatus (use active or inactive)" });
    }
    logger.error({ err }, "Error creating employee");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Update employee
//===============================
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, email, nationalId, phone, address, emergencyContact, positionId, salary, employmentDate, employeeStatus, employeeTypeId } = req.body;
  logger.info({ id, name, positionId, employeeTypeId }, "Updating employee");

  try {
    const employee = await Employee.findOne({ where: { id, isDeleted: false } });
    if (!employee) {
      logger.warn({ id }, "Employee not found");
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.update({
      name,
      email,
      nationalId,
      phone,
      address,
      emergencyContact,
      positionId,
      salary,
      employmentDate,
      employeeStatus,
      employeeTypeId,
    });

    const updated = await Employee.findByPk(id, { include: employeeIncludes });

    logger.info({ id }, "Employee updated successfully");
    res.status(200).json(updated);
  } catch (err) {
    if (err instanceof ForeignKeyConstraintError) {
      logger.warn({ err }, "Invalid positionId / employeeTypeId");
      return res.status(400).json({ message: "Invalid positionId or employeeTypeId" });
    }
    if (err instanceof UniqueConstraintError) {
      logger.warn({ err }, "Duplicate email / nationalId");
      return res.status(400).json({ message: "Email or national ID already exists" });
    }
    if (err instanceof ValidationError) {
      logger.warn({ err }, "Employee validation failed");
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    if (err.parent?.code === "22P02") {
      logger.warn({ err }, "Invalid employeeStatus");
      return res.status(400).json({ message: "Invalid employeeStatus (use active or inactive)" });
    }
    logger.error({ err }, "Error updating employee");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Delete employee (soft delete)
//===============================
const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Deleting employee");

  try {
    const employee = await Employee.findOne({ where: { id, isDeleted: false } });
    if (!employee) {
      logger.warn({ id }, "Employee not found");
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.update({ isDeleted: true });
    logger.info({ id }, "Employee deleted successfully");
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Error deleting employee");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getAllEmployees,
  getSingleEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};