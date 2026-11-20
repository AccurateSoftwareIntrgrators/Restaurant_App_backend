import {  Location } from "../Models/index.js";
import logger from "../src/logger.js";


//===== Controller functions for MenuItem =====

//===============================
// Get all locations
//===============================
const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({
      where: { isDele: false },
      order: [["id", "ASC"]],
    });
    logger.info({ count: locations.length }, "Fetched all locations");
    res.status(200).json(locations);
  } catch (err) {
    logger.error({ err }, "Error fetching locations");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Get single location
//===============================
const getLocationById = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Fetching location by ID");

  try {
    const location = await Location.findOne({
      where: { id, isDele: false },
    });
    if (!location) {
      logger.warn({ id }, "Location not found");
      return res.status(404).json({ message: "Location not found" });
    }

    logger.info({ id }, "Fetched location by ID");
    res.status(200).json(location);
  } catch (err) {
    logger.error({ err }, "Error fetching location by ID");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//===============================
// Create location
//===============================
const createLocation = async (req, res) => {
  const { name } = req.body;
  logger.info({ name }, "Creating new location");

  try {
    const created = await Location.create({
      name,
    });
    logger.info({ id: created.id }, "Location created successfully");
    res.status(201).json(created);
  } catch (err) {
    logger.error({ err }, "Error creating location");
    res.status(500).json({ message: "Internal Server Error" });
  }
};



//===============================
// Update location
//===============================
const updateLocation = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  logger.info({ id, name }, "Updating location");

  try {
    const location = await Location.findOne({ where: { id, isDele: false } });
    if (!location) {
      logger.warn({ id }, "Location not found");
      return res.status(404).json({ message: "Location not found" });
    }

    await location.update({
      name,
    });


    logger.info({ id }, "Location updated successfully");
    res.status(200).json(location);
  } catch (err) {
    logger.error({ err }, "Error updating location");
    res.status(500).json({ message: "Internal Server Error" });
  }
}
  
//===============================
// Delete location (soft delete)
//===============================
const deleteLocation = async (req, res) => {
  const { id } = req.params;
  logger.info({ id }, "Deleting location");

  try {
    const location = await Location.findOne({ where: { id, isDele: false } });
    if (!location) {
      logger.warn({ id }, "Location not found");
      return res.status(404).json({ message: "Location not found" });
    }

    await location.update({ isDele: true });
    logger.info({ id }, "Location deleted successfully");
    res.status(200).json({ message: "Location deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Error deleting location ");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
}