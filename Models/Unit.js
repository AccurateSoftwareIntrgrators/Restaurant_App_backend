import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Unit = sequelize.define("Unit", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true }, // Kilogram
  abbreviation: { type: DataTypes.STRING(10), allowNull: false, unique: true }, // kg
  isDele: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default Unit;