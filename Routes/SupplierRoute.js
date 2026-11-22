    import express from "express";
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../Controllers/SupplierController.js";

const SupplierRoute = express.Router();

SupplierRoute.route("/").get(getAllSuppliers).post(createSupplier);

SupplierRoute.route("/:id")
  .get(getSupplierById)
  .patch(updateSupplier)
  .delete(deleteSupplier);

export default SupplierRoute;