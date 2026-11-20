import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Position = sequelize.define("Position", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(255), allowNull: true },
});

export default Position;