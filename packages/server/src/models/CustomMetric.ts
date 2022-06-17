import { DataTypes } from "sequelize";
import sequelize from "../conf/sequelize";

/**
 * Model used for custom ZEBRA metrics.
 */
const CustomMetric = sequelize.define("custom-metric", {
  /**
   * Unique name or key for identifying the custom metric.
   */
  metricName: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  /**
   * The name of the LPAR running RMF DDS.
   */
  lpar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * The name of the RMF report type.
   */
  report: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * The name of the RMF resource to request to.
   */
  resource: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  /**
   * JSON representing a filter on which data to use.
   */
  filter: {
    type: DataTypes.TEXT,
    defaultValue: "{}",
  },
  /**
   * The field that makes up this custom metric's value.
   */
  field: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /**
   * Optional description to help indicate what the custom metric is used for.
   */
  desc: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
});

export default CustomMetric;
