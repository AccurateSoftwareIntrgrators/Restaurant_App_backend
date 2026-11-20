import sequelize from "../Config/database.js";
import MenuItem from "./MenuItems.js";
import FoodType from "./FoodType.js";
import OrderType from "./OrderType.js";
import Location from "./Location.js";

// MenuItem belongs to one of each
MenuItem.belongsTo(FoodType, { foreignKey: "foodTypeId", as: "foodType" });
MenuItem.belongsTo(OrderType, { foreignKey: "orderTypeId", as: "orderType" });
MenuItem.belongsTo(Location, { foreignKey: "locationId", as: "location" });

// Each lookup has many MenuItems
FoodType.hasMany(MenuItem, { foreignKey: "foodTypeId", as: "menuItems" });
OrderType.hasMany(MenuItem, { foreignKey: "orderTypeId", as: "menuItems" });
Location.hasMany(MenuItem, { foreignKey: "locationId", as: "menuItems" });

export { sequelize, MenuItem, FoodType, OrderType, Location };