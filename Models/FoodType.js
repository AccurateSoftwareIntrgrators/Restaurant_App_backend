import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const FoodType = sequelize.define("FoodType", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  isDele: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default FoodType;
