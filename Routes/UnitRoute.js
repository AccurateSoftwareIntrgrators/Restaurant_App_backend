import express from "express";
import {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../Controllers/UnitController.js";

const UnitRoute = express.Router();

UnitRoute.route("/").get(getAllUnits).post(createUnit);

UnitRoute.route("/:id")
  .get(getUnitById)
  .patch(updateUnit)
  .delete(deleteUnit);

export default UnitRoute;