import MonitorThreeParser from "./rmf/monitor-three/MonitorThreeParser";
import PostprocessorParser from "./rmf/postprocessor/PostprocessorParser";
import { RmfAuth, RmfOptions } from "./rmf/types";

interface ZebraOptions {
  auth?: RmfAuth;
  postprocessor: Partial<RmfOptions>;
  monitorThree: Partial<RmfOptions>;
}

/**
 * ZEBRA builder function
 * @param dds IP or URL of the RMF Distributed Data Server. The address should be root.
 * @param options Additional options for authentication and RMF DDS.
 * @returns ZEBRA object that contains the different kinds of parsers to use.
 */
export default function zebra(dds: string, options: ZebraOptions) {
  return {
    postprocessor: new PostprocessorParser(
      dds,
      options.auth,
      options.postprocessor
    ),
    monitorThree: new MonitorThreeParser(
      dds,
      options.auth,
      options.monitorThree
    ),
  };
}
