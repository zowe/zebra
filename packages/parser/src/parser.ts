import MonitorThreeParser from "./rmf/monitor-three/MonitorThreeParser";
import PostprocessorParser from "./rmf/postprocessor/PostprocessorParser";
import { RmfAuth, RmfOptions } from "./rmf/types";

interface ZebraOptions {
  auth?: RmfAuth;
  postprocessor: Partial<RmfOptions>;
  monitorThree: Partial<RmfOptions>;
}

/**
 *
 * @param dds
 * @param options
 * @returns
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
