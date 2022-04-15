import { MonitorThreeRequestParams } from "../monitor-three/types";

export interface ValuedMetricsFilter {
  /**
   * Specifies one or more patterns which must match the name part of a list element.
   */
  pattern?: string;
  /**
   * Specifies a lower bound value. That is, only list elements with values higher than the given lower
   * bound are returned.
   */
  lowerBound?: number;
  /**
   * Specifies an upper bound value. That is, only list elements with values lower than the specified upper
   * bound are returned.
   */
  upperBound?: number;
  /**
   * Only the highest n list elements are returned (mutually exclusive with `lowest`). The default is 20.
   */
  highest?: number;
  /**
   * Only the loweset n list elements are returned (mutually exclusive with `highest`).
   */
  lowest?: number;
  /**
   * Sort the list of name/value pairs by their names with the following keys:
   * - `NA` ascending by name
   * - `ND` descending by name
   * - `VA` ascending by value
   * - `VD` descending by value (*default*)
   * - `NN` no order
   */
  order?: "NA" | "ND" | "VA" | "VD" | "NN";
}

export interface ValuedMetricsParams extends MonitorThreeRequestParams {
  /**
   * You can focus on the data of your interest by adding a filter specification when requesting a list of values.
   *
   * You can use filters to specify the following:
   * - one or more name patterns to be matched against the names in the list
   * - a lower and upper bound to be compared to the values in a list
   * - a maximum list length with an indicator to select the instances with either the highest or the lowest values
   * - a sorting order for either the names or the values of the list (ascending or descending)
   */
  filter?: ValuedMetricsFilter;
  /**
   * Use this parameter to qualify a request for performance data in more detail with regard to address spaces
   * and WLM entities. Workscopes can be applied to single valued metrics as well as to list valued metrics.
   *
   * For example,
   * - for the metric performance index, the workscope parameter denotes the associated service class period
   * - for the metric % workflow by job, you can use this parameter to focus on jobs that belong to a certain service class.
   */
  workscope?: {
    /**
     * An upper level qualifier which may be blank or which specifies the name of a WLM service class,
     * if the workscope type is a WLM service class period.
     */
    ulq?: string;
    /**
     * A workscope name (for example, job name or report class name) or a service class period.
     */
    name: string;
    /**
     * A workscope type. Possible values:
     * - `global`: No workscope required
     * - `workload`: WLM workload
     * - `service`: WLM service class
     * - `period`: WLM service class period
     * - `job`: Job
     */
    type: "global" | "workload" | "service" | "period" | "report" | "job";
  };
}
