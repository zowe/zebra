export interface RmfAuth {
  /**
   * Username for RMF Distributed Data Server.
   */
  username: string;
  /**
   * Password for RMF Distributed Data Server.
   */
  password: string;
}

export interface RmfOptions {
  /**
   * The filename that contains the data in the RMF request
   */
  file: string;
  /**
   * The interval between reports, in seconds
   */
  interval: number;
}

export interface RmfRequestParams {
  /**
   * Suboptions specified for the Postprocessor reports.
   *
   * Example: `SCPER` breaks down WLMGL reports by service class periods.
   */
  suboptions?: string | string[];
}

export interface RmfReport {
  /**
   * The type of RMF report. Ex: Postprocessor, Monitor III.
   */
  reportType: string;
  /**
   * RMF Distributed Data Server metadata
   */
  server: {
    /**
     * TODO
     */
    name: string;
    /**
     * TODO
     */
    version: string;
    /**
     * TODO
     */
    functionality: string;
    /**
     * TODO
     */
    platform: string;
  };
  /**
   * TODO
   */
  id: string;
  /**
   * TODO
   */
  desc: string;
  /**
   * TODO
   */
  resource: string;
  /**
   * TODO
   */
  time: {
    /**
     * TODO
     */
    start: Date;
    /**
     * TODO
     */
    end: Date;
    /**
     * TODO
     */
    interval: number;
  };
}
