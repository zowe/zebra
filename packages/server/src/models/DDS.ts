import { DataTypes } from "sequelize";
import sequelize from "../conf/sequelize";

/**
 * Model used for RMF Distributed Data Server configuration.
 */
const DDS = sequelize.define("dds", {
  /**
   * Name of the LPAR that is running the RMF DDS.
   */
  lpar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * URI or IP address where the RMF DDS is running (should be root level address and can include ports, ex: http://lpar.example.com:8803).
   */
  uri: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  /**
   * RMF DDS username.
   */
  username: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  /**
   * RMF DDS password.
   */
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default DDS;
