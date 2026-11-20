import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Location = sequelize.define("Location", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  isDele: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default Location;
