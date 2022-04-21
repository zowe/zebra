import { readFileSync } from "fs";
import path from "path";
import parseMonitorThreeReport from "../../../src/rmf/monitor-three/parseMonitorThreeReport";

describe("checking if the old parsing utility function for Monitor III is producing expected outputs", () => {
  it("parsing example RMF Monitor III CPC report", () => {
    const xml: string = readFileSync(
      path.join(__dirname, "sample", "cpc.xml")
    ).toString();
    const expectedOutput: string = readFileSync(
      path.join(__dirname, "sample", "cpc.json")
    ).toString();
    parseMonitorThreeReport(xml).then((result) =>
      expect(result).toEqual(JSON.parse(expectedOutput))
    );
  });
});
