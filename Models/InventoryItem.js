import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";
import logger from "../src/logger.js";
const log = logger.child({ module: "InventoryItem" });

const InventoryItem = sequelize.define(
  "InventoryItem",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    sku: { type: DataTypes.STRING(50), allowNull: true, unique: true },
    description: { type: DataTypes.TEXT },

    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    unitId: { type: DataTypes.INTEGER, allowNull: false },
    supplierId: { type: DataTypes.INTEGER, allowNull: true },
    locationId: { type: DataTypes.INTEGER, allowNull: true }, // storage place

    quantityInStock: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    reorderLevel: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 }, // low-stock threshold
    costPerUnit: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    expiryDate: { type: DataTypes.DATEONLY, allowNull: true },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isDele: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    hooks: {
      afterSync: () => {
        log.info({ table: InventoryItem.getTableName() }, "InventoryItem table is ready");
      },
      afterCreate: (item) => {
        log.info({ itemId: item.id, name: item.name }, "Inventory item created");
      },
      afterUpdate: (item) => {
        log.info({ itemId: item.id, qty: item.quantityInStock }, "Inventory item updated");
        if (Number(item.quantityInStock) <= Number(item.reorderLevel)) {
          log.warn({ itemId: item.id, name: item.name }, "Low stock");
        }
      },
    },
  },
);

export default InventoryItem;