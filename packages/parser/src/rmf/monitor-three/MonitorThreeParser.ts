import RmfParser from "../RmfParser";
import { RmfAuth, RmfOptions } from "../types";
import MonitorThreeOptions from "./MonitorThreeOptions";
import { MonitorThreeRequestParams, IMonitorThree } from "./types";
import parseMonitorThreeReport from "./parseMonitorThreeReport";

export default class MonitorThreeParser
  extends RmfParser
  implements IMonitorThree
{
  constructor(dds: string, auth?: RmfAuth, options: Partial<RmfOptions> = {}) {
    super(dds, new MonitorThreeOptions(options), auth);
  }

  public buildRequestEndpoint(
    report: string,
    params?: MonitorThreeRequestParams
  ): string {}

  public async getReport(
    report: string,
    params?: MonitorThreeRequestParams
  ): Promise<any> {
    const xml = await this.ddsRequest(report, params);
    return parseMonitorThreeReport(xml);
  }

  channel(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("CHANNEL", params);
  }

  cpc(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("CPC", params);
  }

  delay(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("DELAY", params);
  }

  dev(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("DEV", params);
  }

  devr(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("DEVR", params);
  }

  dsnd(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("DSND", params);
  }

  eadm(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("EADM", params);
  }

  enclave(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("ENCLAVE", params);
  }

  enq(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("ENQ", params);
  }

  hsm(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("HSM", params);
  }

  jes(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("JES", params);
  }

  opd(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("OPD", params);
  }

  proc(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("PROC", params);
  }

  procu(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("PROCU", params);
  }

  stor(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("STOR", params);
  }

  storc(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("STORC", params);
  }

  storcr(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("STORCR", params);
  }

  sysinfo(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("SYSINFO", params);
  }

  syssum(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("SYSSUM", params);
  }

  usage(params?: MonitorThreeRequestParams): Promise<any> {
    return this.getReport("USAGE", params);
  }
}
