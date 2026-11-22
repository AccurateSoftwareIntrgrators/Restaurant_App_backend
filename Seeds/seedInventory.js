import "dotenv/config";
import { sequelize, InventoryCategory, InventoryItem, Unit } from "../Models/index.js";
import { units, inventory } from "./inventoryData.js";

// Run once:  node Seeds/seedInventory.js
await sequelize.sync();

for (const [name, abbreviation] of units) {
  await Unit.findOrCreate({ where: { abbreviation }, defaults: { name } });
}

for (const [categoryName, products] of Object.entries(inventory)) {
  const [category] = await InventoryCategory.findOrCreate({ where: { name: categoryName } });
  for (const [name, abbr] of products) {
    const unit = await Unit.findOne({ where: { abbreviation: abbr } });
    await InventoryItem.findOrCreate({
      where: { name, categoryId: category.id },
      defaults: { unitId: unit.id },
    });
  }
}

console.log("Inventory seeded");
await sequelize.close();