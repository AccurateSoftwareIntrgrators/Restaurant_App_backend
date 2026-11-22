import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

// Every stock change is logged here, so you can see why the quantity moved.
const StockTransaction = sequelize.define("StockTransaction", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  inventoryItemId: { type: DataTypes.INTEGER, allowNull: false },
  employeeId: { type: DataTypes.INTEGER, allowNull: true }, // who did it
  type: {
    type: DataTypes.ENUM("PURCHASE", "USAGE", "WASTE", "RETURN", "ADJUSTMENT"),
    allowNull: false,
  },
  quantity: { type: DataTypes.DECIMAL(10, 3), allowNull: false }, // always positive; type decides + or -
  costPerUnit: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  note: { type: DataTypes.STRING(255), allowNull: true },
  transactionDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

export default StockTransaction;