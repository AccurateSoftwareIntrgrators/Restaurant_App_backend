import express from "express";
import {
  getAllOrderTypes,
  getOrderTypeById,
  createOrderType,
  updateOrderType,
  deleteOrderType,
} from "../Controllers/OrderTypeController.js";

const OrderTypeRoute = express.Router();

OrderTypeRoute.route("/").get(getAllOrderTypes).post(createOrderType);

OrderTypeRoute.route("/:id")
  .get(getOrderTypeById)
  .patch(updateOrderType)
  .delete(deleteOrderType);

export default OrderTypeRoute;
