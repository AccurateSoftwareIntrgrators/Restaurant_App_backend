import "dotenv/config";
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./src/logger.js";
import { connectDB } from "./Config/database.js";
import { sequelize } from "./Models/index.js";
import MenuItemRoute from "./Routes/MenuItemRoute.js";
import FoodTypeRoute from "./Routes/FoodTypeRoutes.js";
import OrderTypeRoute from "./Routes/OrderTypeRoutes.js";
import LocationRoute from "./Routes/LocationRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  }),
);


//=====Routes=====

app.use("/menu-items", MenuItemRoute);
app.use("/food-types", FoodTypeRoute);
app.use("/order-types", OrderTypeRoute);
app.use("/locations", LocationRoute);


//=====Routes=====



// Error handler (after all routes)
app.use((err, req, res, next) => {
  req.log.error({ err }, "Unhandled error");
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3001;

const start = async () => {
  await connectDB();



   // DEV ONLY
  if (process.env.NODE_ENV !== "production") {
    const qi = sequelize.getQueryInterface();

    const tablesBefore = await qi.showAllTables();
    await sequelize.sync({ alter: true });
    const tablesAfter = await qi.showAllTables();

    const created = tablesAfter.filter((t) => !tablesBefore.includes(t));

    if (created.length) {
      logger.info({ tables: created }, "New tables created");
    } else {
      logger.info("Database synced, no new tables");
    }
  }



  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "Server started");
  });

  const shutdown = (signal) => {
    logger.info({ signal }, "Shutting down");
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start();
process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});
