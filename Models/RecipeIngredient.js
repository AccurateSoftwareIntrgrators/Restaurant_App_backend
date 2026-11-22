import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

// Links a MenuItem to the inventory it consumes per portion.
const RecipeIngredient = sequelize.define(
  "RecipeIngredient",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    menuItemId: { type: DataTypes.INTEGER, allowNull: false },
    inventoryItemId: { type: DataTypes.INTEGER, allowNull: false },
    quantityRequired: { type: DataTypes.DECIMAL(10, 3), allowNull: false }, // per 1 portion, in the item's unit
  },
  {
    indexes: [{ unique: true, fields: ["menu_item_id", "inventory_item_id"] }],
  },
);

export default RecipeIngredient;