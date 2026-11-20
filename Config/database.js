import { Sequelize } from "sequelize";
import logger from "../src/logger.js";

const log = logger.child({ module: "database" });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",

    // Send every SQL query to your pino logger (shows up in debug.log / all.log)
    benchmark: true,
    logging: (sql, timingMs) => {
      if (timingMs > 500) log.warn({ sql, ms: timingMs }, "Slow query");
      else log.debug({ sql, ms: timingMs }, "SQL query");
    },

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    define: {
      underscored: true, // created_at instead of createdAt
      freezeTableName: false,
    },
  }
);

export async function connectDB() {
  try {
    await sequelize.authenticate();
    log.info(
      { db: process.env.DB_NAME, host: process.env.DB_HOST },
      "Database connected"
    );
  } catch (err) {
    log.fatal({ err }, "Database connection failed");
    process.exit(1);
  }
}

export default sequelize;