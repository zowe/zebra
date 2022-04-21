import { RmfReport, RmfRequestParams } from "../types";

export interface MonitorThreeReport extends RmfReport {
  reportType: "Monitor III";
  data: any;
}

export interface MonitorThreeRequestParams extends RmfRequestParams {
  /**
   * This parameter describes the resource for which information is requested. The resource parameter is
   * composed of three parts:
   * - upper level qualifier (ULQ)
   * - resource name
   * - resource type
   *
   * You can see the available resource types in the syntax required for the request string in
   * [Figure 9 on page 45](https://www-40.ibm.com/servers/resourcelink/svc00100.nsf/pages/zOSV2R3sc342667/$file/erbb700_v2r3.pdf#unique_70_Connect_42_erbb7p01).
   *
   * An ULQ is needed for the resource parameter, because resources with the same name can exist multiple
   * times in a sysplex, for example volumes or channels. For most of the resources, the ULQ is the name of
   * the associated z/OS system.
   *
   * For the sysplex resource, the ULQ can be omitted. In such a case, the resource specification starts with a
   * comma. For unique resources like the PROCESSOR resource in an MVS IMAGE, you can either omit the
   * resource name or you can assign an asterisk as the resource name.
   */
  resource: string;
  /**
   * This parameter specifies the datetime interval for the requested performance data. Start and end datetimes are
   * in the local time of the monitored system.
   *
   * If you omit the end datetime, the defined Monitor III gatherer interval (MINTIME) is used to determine the end.
   */
  range?: {
    /**
     * Starting datetime in the range.
     */
    start: Date;
    /**
     * Ending datetime in the range.
     *
     * If omitted, the defined Monitor III gatherer interval (MINTIME) is used.
     */
    end?: Date;
  };
}

export interface IMonitorThree {
  /**
   * Retrieves and parses a CHANNEL Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed CHANNEL report in ZEBRA format.
   */
  channel(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a CPC Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed CPC report in ZEBRA format.
   */
  cpc(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a DELAY Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed DELAY report in ZEBRA format.
   */
  delay(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a DEV Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed DEV report in ZEBRA format.
   */
  dev(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a DEVR Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed DEVR report in ZEBRA format.
   */
  devr(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a DSND Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed DNSD report in ZEBRA format.
   */
  dsnd(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a EADM Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed EADM report in ZEBRA format.
   */
  eadm(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a ENCLAVE Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed ENCLAVE report in ZEBRA format.
   */
  enclave(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a ENQ Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed ENQ report in ZEBRA format.
   */
  enq(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a HSM Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed HSM report in ZEBRA format.
   */
  hsm(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a JES Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed JES report in ZEBRA format.
   */
  jes(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a OPD Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed OPD report in ZEBRA format.
   */
  opd(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a PROC Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed PROC report in ZEBRA format.
   */
  proc(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a PROCU Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed PROCU report in ZEBRA format.
   */
  procu(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a STOR Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed STOR report in ZEBRA format.
   */
  stor(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a STORC Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed STORC report in ZEBRA format.
   */
  storc(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a STORCR Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed STORCR report in ZEBRA format.
   */
  storcr(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a SYSINFO Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed SYSINFO report in ZEBRA format.
   */
  sysinfo(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a SYSSUM Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed SYSSUM report in ZEBRA format.
   */
  syssum(params?: MonitorThreeRequestParams): Promise<any>;
  /**
   * Retrieves and parses a USAGE Monitor III report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed USAGE report in ZEBRA format.
   */
  usage(params?: MonitorThreeRequestParams): Promise<any>;
}
