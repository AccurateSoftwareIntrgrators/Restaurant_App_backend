import express from "express";
import {
  getAllFoodTypes,
  getFoodTypeById,
  createFoodType,
  updateFoodType,
  deleteFoodType,
} from "../Controllers/FoodTypeController.js";

const FoodTypeRoute = express.Router();

FoodTypeRoute.route("/").get(getAllFoodTypes).post(createFoodType);

FoodTypeRoute.route("/:id")
  .get(getFoodTypeById)
  .patch(updateFoodType)
  .delete(deleteFoodType);

export default FoodTypeRoute;
