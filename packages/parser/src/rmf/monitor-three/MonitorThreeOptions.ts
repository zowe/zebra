import { RmfOptions } from "../types";

export default class MonitorThreeOptions implements RmfOptions {
  public file: string;

  public interval: number;

  constructor({ file = "rmfm3.xml", interval = 100 }: Partial<RmfOptions>) {
    this.file = file;
    this.interval = interval;
  }
}
