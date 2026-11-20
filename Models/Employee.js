import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Employee = sequelize.define("Employee", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  nationalId: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  phone: { type: DataTypes.STRING(15), allowNull: true },
  address: { type: DataTypes.STRING(200), allowNull: true },
  emergencyContact: { type: DataTypes.STRING(100), allowNull: true },
  position: { type: DataTypes.STRING(100), allowNull: false },
  salary: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  employmentDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  employeeStatus: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  employeeType: { type: DataTypes.ENUM("full-time", "part-time", "contractor"), allowNull: false, defaultValue: "full-time" },
  employeeId: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default Employee;

