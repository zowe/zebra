import { DataTypes } from "sequelize";
import sequelize from "../conf/sequelize";

/**
 * Model to store ZEBRA configuration between runtimes.
 */
const Config = sequelize.define("config", {
  /**
   * The port that the ZEBRA application runs on.
   */
  port: {
    type: DataTypes.INTEGER,
    defaultValue: 3090,
  },
  /**
   * Flag that indicates if authentication is required for READ operations, instead of just WRITE operations.
   */
  useAuth: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

export default Config;
