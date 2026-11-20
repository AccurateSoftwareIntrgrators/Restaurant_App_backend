import express from "express";
import { getAllEmployeeTypes, createEmployeeType, updateEmployeeType, deleteEmployeeType } from "../Controllers/EmployeeTypeController.js";


const EmployeeTypeRoute = express.Router();

EmployeeTypeRoute.route("/").get(getAllEmployeeTypes).post(createEmployeeType);

EmployeeTypeRoute.route("/:id").patch(updateEmployeeType).delete(deleteEmployeeType);

export default EmployeeTypeRoute;