import express from "express";
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../Controllers/MenuItemController.js";

const MenuItemRoute = express.Router();

MenuItemRoute.route("/").get(getAllMenuItems).post(createMenuItem);

MenuItemRoute.route("/:id")
  .get(getMenuItemById)
  .patch(updateMenuItem)
  .delete(deleteMenuItem);

export default MenuItemRoute;