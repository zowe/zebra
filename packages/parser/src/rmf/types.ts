export interface RmfOptions {
  /**
   * The filename that contains the data in the RMF request
   */
  file: string;
  /**
   * The interval between reports, in seconds
   */
  interval: number;
  /**
   * Username for RMF Distributed Data Server.
   */
  username?: string;
  /**
   * Password for RMF Distributed Data Server.
   */
  password?: string;
}

export type RmfOptionsParams = Partial<RmfOptions>;

export type RmfRequestParams = object;

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
