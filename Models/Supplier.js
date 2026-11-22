import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Supplier = sequelize.define("Supplier", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  contactPerson: { type: DataTypes.STRING(100), allowNull: true },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  email: { type: DataTypes.STRING(100), allowNull: true, validate: { isEmail: true } },
  address: { type: DataTypes.TEXT, allowNull: true },
  isDele: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default Supplier;