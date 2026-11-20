import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";
import logger from "../src/logger.js";
const log = logger.child({ module: "MenuItem" });

const MenuItem = sequelize.define(
  "MenuItem",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT },
    foodTypeId: { type: DataTypes.INTEGER, allowNull: false },
    orderTypeId: { type: DataTypes.INTEGER, allowNull: false },
    locationId: { type: DataTypes.INTEGER, allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
    isDele: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    hooks: {
      // Runs after sequelize.sync() finishes this table
      afterSync: () => {
        log.info({ table: MenuItem.getTableName() }, "MenuItem table is ready");
      },

      afterCreate: (item) => {
        log.info(
          { itemId: item.id, name: item.name, price: item.price },
          "Menu item created",
        );
      },

      afterUpdate: (item) => {
        log.info({ itemId: item.id }, "Menu item updated");
      },

      afterDestroy: (item) => {
        log.warn({ itemId: item.id }, "Menu item deleted");
      },
    },
  },
);

export default MenuItem;
