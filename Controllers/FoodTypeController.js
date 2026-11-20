import {  FoodType } from "../Models/index.js";
import logger from "../src/logger.js";


//===== Controller functions for MenuItem =====

//===============================
// Get all food types
//===============================
const getAllFoodTypes = async (req, res) => {
  try {
    const foodTypes = await FoodType.findAll({
      where: { isDele: false },
      order: [["id", "ASC"]],
    });
    logger.info({ count: foodTypes.length }, "Fetched all food types");
    res.status(200).json(foodTypes);
  } catch (err) {
    logger.error({ err }, "Error fetching food types");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get single food type
//===============================
const getFoodTypeById = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Fetching food type by ID");

  try {
    const foodType = await FoodType.findOne({
      where: { id, isDele: false },
    });
    if (!foodType) {
      logger.warn({ id }, "Food type not found");
      return res.status(404).json({ message: "Food type not found" });
    }

    logger.info({ id }, "Fetched food type by ID");
    res.status(200).json(foodType);
  } catch (err) {
    logger.error({ err }, "Error fetching food type by ID");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create food type
//===============================
const createFoodType = async (req, res) => {
  const { name } = req.body;
  logger.info({ name }, "Creating new food type");

  try {
    const created = await FoodType.create({
      name,
    });
    logger.info({ id: created.id }, "Food type created successfully");
    res.status(201).json(created);
  } catch (err) {
    logger.error({ err }, "Error creating food type");
    res.status(500).json({ message: "Internal Server Error" });
  }
};



//===============================
// Update food type
//===============================
const updateFoodType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  logger.info({ id, name }, "Updating food type");

  try {
    const foodType = await FoodType.findOne({ where: { id, isDele: false } });
    if (!foodType) {
      logger.warn({ id }, "Food type not found");
      return res.status(404).json({ message: "Food type not found" });
    }

    await foodType.update({
      name,
    });


    logger.info({ id }, "Food type updated successfully");
    res.status(200).json(foodType);
  } catch (err) {
    logger.error({ err }, "Error updating food type");
    res.status(500).json({ message: "Internal Server Error" });
  }
}
  
//===============================
// Delete food type (soft delete)
//===============================
const deleteFoodType = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Deleting food type");

  try {
    const foodType = await FoodType.findOne({ where: { id, isDele: false } });
    if (!foodType) {
      logger.warn({ id }, "Food type not found");
      return res.status(404).json({ message: "Food type not found" });
    }

    await foodType.update({ isDele: true });
    logger.info({ id }, "Food type deleted successfully");
    res.status(200).json({ message: "Food type deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Error deleting food type ");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getAllFoodTypes,
  getFoodTypeById,
  createFoodType,
  updateFoodType,
  deleteFoodType,
}