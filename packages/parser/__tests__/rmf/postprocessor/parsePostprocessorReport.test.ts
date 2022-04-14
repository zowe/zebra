import { readFileSync } from "fs";
import path from "path";
import parsePostprocessorReport from "../../../src/rmf/postprocessor/parsePostprocessorReport";

describe("checking if the old parsing utility function for Postprocessor is producing expected outputs", () => {
  it("parsing example RMF Postprocessor CPU report", () => {
    const xml: string = readFileSync(
      path.join(__dirname, "sample", "cpu-small.xml")
    ).toString();
    const expectedOutput: string = readFileSync(
      path.join(__dirname, "sample", "cpu-small.json")
    ).toString();
    parsePostprocessorReport(xml).then((result) =>
      expect(result).toEqual(JSON.parse(expectedOutput))
    );
  });
});
