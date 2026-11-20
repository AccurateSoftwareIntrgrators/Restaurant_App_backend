import express from "express";
import { getAllPositions, createPosition, updatePosition, deletePosition } from "../Controllers/PositionController.js";


const PositionRoute = express.Router();

PositionRoute.route("/").get(getAllPositions).post(createPosition);

PositionRoute.route("/:id").patch(updatePosition).delete(deletePosition);

export default PositionRoute;