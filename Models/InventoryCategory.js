import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const InventoryCategory = sequelize.define("InventoryCategory", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(255), allowNull: true },
  isDele: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default InventoryCategory;