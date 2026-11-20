import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const EmployeeType = sequelize.define("EmployeeType", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
});

export default EmployeeType;