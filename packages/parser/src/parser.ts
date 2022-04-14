import tls from "tls";
import PostprocessorParser from "./rmf/postprocessor/PostprocessorParser";
import { PostprocessorOptionsParams } from "./rmf/postprocessor/types";
// import MonitorThreeParser from "./rmf/monitor-three/MonitorThreeParser";
// import { MonitorThreeOptionsParams } from "./rmf/monitor-three/MonitorThreeOptions";

/**
 * The RMF Distributed Data Server requires a minimum TLS version of 1.1.
 */
tls.DEFAULT_MIN_VERSION = "TLSv1.1";

export default {
  rmf: {
    postprocessor: (dds: string, options: PostprocessorOptionsParams) =>
      new PostprocessorParser(dds, options),
    // monitorThree: (dds: string, options: MonitorThreeOptionsParams) =>
    // new MonitorThreeParser(dds, options),
  },
};
