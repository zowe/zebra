import PostprocessorParser from "../../../src/rmf/postprocessor/PostprocessorParser";

describe("testing the `PostprocessorParser` class and its functions", () => {
  jest.mock("axios");

  const postprocessor = new PostprocessorParser(
    "https://rprt.example.com:8803"
  );

  it("checking that proper DDS endpoints are being built", () => {
    let endpoint: string;
    endpoint = postprocessor.buildRequestEndpoint("CHAN");
    expect(endpoint).toBe(
      "https://rprt.example.com:8803/gpm/rmfpp.xml?reports=CHAN"
    );
    endpoint = postprocessor.buildRequestEndpoint("CPU", {
      date: {
        start: new Date("January 1, 2022 00:00:00"),
        end: new Date("January 7, 2022 00:00:00"),
      },
    });
    expect(endpoint).toBe(
      "https://rprt.example.com:8803/gpm/rmfpp.xml?reports=CPU&date=20220101%2C20220107"
    );
    endpoint = postprocessor.buildRequestEndpoint("WLMGL", {
      suboptions: ["SCPER", "RCLASS"],
      duration: 120,
      jobOutDel: true,
    });
    expect(endpoint).toEqual(
      "https://rprt.example.com:8803/gpm/rmfpp.xml?reports=WLMGL(SCPER,RCLASS)&duration=0200&joboutdel=YES"
    );
  });
});
