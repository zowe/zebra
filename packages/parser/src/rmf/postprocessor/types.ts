import { RmfOptionsParams, RmfReport, RmfRequestParams } from "../types";

export type PostprocessorOptionsParams = RmfOptionsParams;

export interface PostprocessorReport extends RmfReport {
  reportType: "Postprocessor";
  data: unknown;
}

export interface PostprocessorRequestParams extends RmfRequestParams {
  /**
   * Suboptions specified for the Postprocessor reports.
   *
   * Example: `SCPER` breaks down WLMGL reports by service class periods.
   */
  suboptions?: string | string[];
  /**
   * This parameter specifies the start and end date of the reporting period for all Postprocessor reports.
   */
  date?: {
    /**
     * Start date of the reporting period for all Postprocessor reports.
     */
    start: Date;
    /**
     * End date of the reporting period for all Postprocessor reports.
     */
    end: Date;
  };
  /**
   * This parameter specifies that the Postprocessor is to generate duration reports and indicates the length of
   * the duration interval, in minutes.
   *
   * The value can range from 0 (which is automatically corrected by the
   * Postprocessor) to 6000 minutes, which is 100 hours.
   */
  duration?: number;
  /**
   * This parameter specifies the start and end time of the reporting period for each day in the reporting
   * period by the minute of the day.
   *
   * For example, a value of 0 represents 00:00, whereas 1439 represents 23:59.
   */
  timeOfDay?: {
    /**
     * Starting time of the reporting period for each day in the reporting period.
     */
    start: number;
    /**
     * Ending time of the reporting period for each day in the reporting period.
     */
    end: number;
  };
  /**
   * This parameter identifies the single system for which the reports are to be generated. It is ignored for
   * sysplex reports.
   */
  sysid?: string;
  /**
   * This parameter contains a list of control statements for the Overview report, equivalent to the OVW
   * control statements as described in the
   * [z/OS RMF User's Guide](https://www-40.ibm.com/servers/resourcelink/svc00100.nsf/pages/zosv2r3sc342664/$file/erbb200_v2r3.pdf?OpenElement&xpdflink).
   *
   * The maximum number of control statements is 253.
   */
  overview?: string | string[];
  /**
   * This parameter specifies the timeout period in seconds, that the DDS should wait for Postprocessor jobs
   * to complete. The valid range is from 0 to 3600 seconds. The default value is 300 seconds.
   */
  timeout?: number;
  /**
   * This parameter specifies whether the held output of the Postprocessor job should be deleted by the RMF
   * Distributed Data Server after it has been processed successfully. The default is `false`.
   */
  jobOutDel?: boolean;
  /**
   * Contains parameters with regards to SMF data.
   */
  smf?: {
    /**
     * This parameter contains a single or list of names of SMF data sets or logstreams which are used as input for the
     * generation of Postprocessor reports. The names must be fully qualified and valid z/OS data set names.
     */
    data: string | string[];
    /**
     * This parameter specifies whether the SMF data, which is defined with the data parameter, is sorted
     * before it is used as input for the generation of Postprocessor reports. The default is `false`.
     */
    sort: boolean;
  };
}

export interface IPostprocessor {
  /**
   * Retrieves and parses a CACHE Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed CACHE report in ZEBRA format.
   */
  cache(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a CF Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed CF report in ZEBRA format.
   */
  cf(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a CHAN Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed CHAN report in ZEBRA format.
   */
  chan(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a CPU Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed CPU report in ZEBRA format.
   */
  cpu(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a CRYPTO Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed CRYPTO report in ZEBRA format.
   */
  crypto(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a DEVICE Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed DEVICE report in ZEBRA format.
   */
  device(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a EADM Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed EADM report in ZEBRA format.
   */
  eadm(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a HFS Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed HFS report in ZEBRA format.
   */
  hfs(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a IOQ Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed IOQ report in ZEBRA format.
   */
  ioq(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a OMVS Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed OMVS report in ZEBRA format.
   */
  omvs(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a PAGESP Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed PAGESP report in ZEBRA format.
   */
  pagesp(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a PAGING Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed PAGING report in ZEBRA format.
   */
  paging(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a SDELAY Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed SDELAY report in ZEBRA format.
   */
  sdelay(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a VSTOR Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed VSTOR report in ZEBRA format.
   */
  vstor(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a WLMGL Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed WLMGL report in ZEBRA format.
   */
  wlmgl(params?: PostprocessorRequestParams): Promise<object>;
  /**
   * Retrieves and parses a XCF Postprocessor report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed XCF report in ZEBRA format.
   */
  xcf(params?: PostprocessorRequestParams): Promise<object>;
}
