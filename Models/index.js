import sequelize from "../Config/database.js";
import MenuItem from "./MenuItems.js";
import FoodType from "./FoodType.js";
import OrderType from "./OrderType.js";
import Location from "./Location.js";
import Employee from "./Employee.js";
import Position from "./Position.js";
import EmployeeType from "./EmployeeType.js";


// ===== Menu =====

// MenuItem belongs to one of each
MenuItem.belongsTo(FoodType, { foreignKey: "foodTypeId", as: "foodType" });
MenuItem.belongsTo(OrderType, { foreignKey: "orderTypeId", as: "orderType" });
MenuItem.belongsTo(Location, { foreignKey: "locationId", as: "location" });

// Each lookup has many MenuItems
FoodType.hasMany(MenuItem, { foreignKey: "foodTypeId", as: "menuItems" });
OrderType.hasMany(MenuItem, { foreignKey: "orderTypeId", as: "menuItems" });
Location.hasMany(MenuItem, { foreignKey: "locationId", as: "menuItems" });


// ===== Employee =====

// Employee belongs to one position and one employee type
Employee.belongsTo(Position, { foreignKey: "positionId", as: "position" });
Employee.belongsTo(EmployeeType, { foreignKey: "employeeTypeId", as: "employeeType" });

// Each lookup has many Employees
Position.hasMany(Employee, { foreignKey: "positionId", as: "employees" });
EmployeeType.hasMany(Employee, { foreignKey: "employeeTypeId", as: "employees" });


export { sequelize, MenuItem, FoodType, OrderType, Location, Employee, Position, EmployeeType };