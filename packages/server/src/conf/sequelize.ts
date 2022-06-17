import { Sequelize } from "sequelize";
import path from "path";

if (!process.env.SQLITE_USER || !process.env.SQLITE_PASS) {
  throw new Error("Could not find SQLite Credentials");
}

const sequelize = new Sequelize(
  "database",
  process.env.SQLITE_USER,
  process.env.SQLITE_PASS,
  {
    dialect: "sqlite",
    storage: path.join(__dirname, "..", "..", "data"),
  }
);

export default sequelize;
