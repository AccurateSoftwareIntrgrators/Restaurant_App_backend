import sequelize from "../Config/database.js";
import MenuItem from "./MenuItems.js";
import FoodType from "./FoodType.js";
import OrderType from "./OrderType.js";
import Location from "./Location.js";
import Employee from "./Employee.js";
import Position from "./Position.js";
import EmployeeType from "./EmployeeType.js";
import InventoryItem from "./InventoryItem.js";
import InventoryCategory from "./InventoryCategory.js";
import Unit from "./Unit.js";
import Supplier from "./Supplier.js";
import StockTransaction from "./StockTransaction.js";
import RecipeIngredient from "./RecipeIngredient.js";


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


// ===== Inventory =====

// InventoryItem belongs to one of each
InventoryItem.belongsTo(InventoryCategory, { foreignKey: "categoryId", as: "category" });
InventoryItem.belongsTo(Unit, { foreignKey: "unitId", as: "unit" });
InventoryItem.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });
InventoryItem.belongsTo(Location, { foreignKey: "locationId", as: "location" });

// Each lookup has many InventoryItems
InventoryCategory.hasMany(InventoryItem, { foreignKey: "categoryId", as: "items" });
Unit.hasMany(InventoryItem, { foreignKey: "unitId", as: "items" });
Supplier.hasMany(InventoryItem, { foreignKey: "supplierId", as: "items" });
Location.hasMany(InventoryItem, { foreignKey: "locationId", as: "inventoryItems" });


// ===== Stock Movements =====

// StockTransaction belongs to an inventory item and the employee who made it
StockTransaction.belongsTo(InventoryItem, { foreignKey: "inventoryItemId", as: "inventoryItem" });
StockTransaction.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });

InventoryItem.hasMany(StockTransaction, { foreignKey: "inventoryItemId", as: "transactions" });
Employee.hasMany(StockTransaction, { foreignKey: "employeeId", as: "stockTransactions" });


// ===== Recipes (MenuItem <-> InventoryItem) =====

RecipeIngredient.belongsTo(MenuItem, { foreignKey: "menuItemId", as: "menuItem" });
RecipeIngredient.belongsTo(InventoryItem, { foreignKey: "inventoryItemId", as: "inventoryItem" });

MenuItem.hasMany(RecipeIngredient, { foreignKey: "menuItemId", as: "ingredients" });
InventoryItem.hasMany(RecipeIngredient, { foreignKey: "inventoryItemId", as: "usedIn" });


export {
  sequelize,
  MenuItem,
  FoodType,
  OrderType,
  Location,
  Employee,
  Position,
  EmployeeType,
  InventoryItem,
  InventoryCategory,
  Unit,
  Supplier,
  StockTransaction,
  RecipeIngredient,
};