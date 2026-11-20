import express from "express";
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../Controllers/LocationController.js";

const LocationRoute = express.Router();

LocationRoute.route("/").get(getAllLocations).post(createLocation);

LocationRoute.route("/:id")
  .get(getLocationById)
  .patch(updateLocation)
  .delete(deleteLocation);

export default LocationRoute;
