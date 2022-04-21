import RmfRequestError from "../../../src/errors/RmfRequestError";
import {
  ddsFormatResource,
  ddsFormatRange,
} from "../../../src/rmf/monitor-three/util";

describe("Monitor III utility functions", () => {
  it("formatting 'resource' parameter in DDS format", () => {
    let resource: string;
    resource = "randomString";
    expect(() => ddsFormatResource(resource)).toThrow(RmfRequestError);
    resource = ",RPRT,MVS_IMAGE";
    expect(ddsFormatResource(resource)).toBe(",RPRT,MVS_IMAGE");
  });
  it("formatting 'range' parameter in DDS format", () => {
    let range: { start: Date; end?: Date };
    range = {
      start: new Date("December 18, 2021 00:00:00"),
      end: new Date("December 17, 2021 00:00:00"),
    };
    expect(() => ddsFormatRange(range)).toThrow(RmfRequestError);
    range = {
      start: new Date("December 17, 2021 12:30:00"),
    };
    expect(ddsFormatRange(range)).toBe("20211217123000");
    range = {
      start: new Date("December 17, 2021 12:30:00"),
      end: new Date("December 18, 2021 09:15:00"),
    };
    expect(ddsFormatRange(range)).toBe("20211217123000,20211218091500");
  });
});
