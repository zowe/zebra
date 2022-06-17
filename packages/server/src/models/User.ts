import { DataTypes } from "sequelize";
import sequelize from "../conf/sequelize";

/**
 * Model used for ZEBRA users.
 */
const User = sequelize.define("user", {
  /**
   * User's username.
   */
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * User's password.
   */
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * User's role / permissions. Default is `read`, where you can only GET metrics. Users with `read-write` permissions
   * can change ZEBRA config, DDS config, and custom exposed metrics.
   */
  role: {
    type: DataTypes.ENUM("read", "read-write"),
    defaultValue: "read",
  },
});

export default User;
