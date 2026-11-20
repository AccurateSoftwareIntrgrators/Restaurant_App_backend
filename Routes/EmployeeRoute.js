import express from "express";
import { getAllEmployees, createEmployee, getSingleEmployee, updateEmployee, deleteEmployee } from "../Controllers/EmployeeController.js";


const EmployeeRoute = express.Router();

EmployeeRoute.route("/").get(getAllEmployees).post(createEmployee);

EmployeeRoute.route("/:id").get(getSingleEmployee).patch(updateEmployee).delete(deleteEmployee);

export default EmployeeRoute;