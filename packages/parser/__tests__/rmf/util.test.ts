import { readFileSync } from "fs";
import path from "path";
import { checkForError } from "../../src/rmf/util";

describe("RMF utility functions", () => {
  it("checking DDS response for custom errors", () => {
    let xml: string;
    let result: string | null;
    xml = readFileSync(
      path.join(__dirname, "sample", "cpu-error.xml")
    ).toString();
    result = checkForError(xml);
    expect(result).toBe(
      "The RMF DDS has returned the following error(s): GPM0739E - Invalid DDS request parameter 'DATE' (SEVERITY: 3)"
    );
    xml = readFileSync(
      path.join(__dirname, "sample", "cpc-error.xml")
    ).toString();
    result = checkForError(xml);
    expect(result).toBe(
      "The RMF DDS has returned the following error(s): GPM0731I - The specified system 'DVLP' is not a member of the sysplex (SEVERITY: 3)"
    );
    xml = readFileSync(path.join(__dirname, "sample", "cpu.xml")).toString();
    result = checkForError(xml);
    expect(result).toBeNull();
    xml = readFileSync(path.join(__dirname, "sample", "cpc.xml")).toString();
    result = checkForError(xml);
    expect(result).toBeNull();
  });
});
