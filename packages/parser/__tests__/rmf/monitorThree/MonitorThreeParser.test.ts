import axios from "axios";
import { readFileSync } from "fs";
import path from "path";
import RmfRequestError from "../../../src/errors/RmfRequestError";
import MonitorThreeParser from "../../../src/rmf/monitor-three/MonitorThreeParser";

jest.mock("axios");
const request = axios as jest.Mocked<typeof axios>;

describe("testing the `MonitorThreeParser` class and its functions", () => {
  const monitorThree = new MonitorThreeParser("https://rprt.example.com:8803");

  it("checking that proper DDS endpoints are being built", () => {
    let endpoint: string;
    expect(() => monitorThree.buildRequestEndpoint("CHANNEL")).toThrow(
      RmfRequestError
    );
    endpoint = monitorThree.buildRequestEndpoint("CPC", {
      resource: ",RPRT,MVS_IMAGE",
    });
    expect(endpoint).toBe(
      "https://rprt.example.com:8803/gpm/rmfm3.xml?report=CPC&resource=%2CRPRT%2CMVS_IMAGE"
    );
    endpoint = monitorThree.buildRequestEndpoint("CPC", {
      resource: ",RPRT,MVS_IMAGE",
      range: {
        start: new Date("December 17, 2021 00:00:00"),
        end: new Date("December 17, 2021 00:30:00"),
      },
    });
    expect(endpoint).toBe(
      "https://rprt.example.com:8803/gpm/rmfm3.xml?report=CPC&resource=%2CRPRT%2CMVS_IMAGE&range=20211217000000%2C20211217003000"
    );
  });

  it("testing general RMF Monitor III report request and parsing", () => {
    request.get.mockResolvedValue({
      data: readFileSync(path.join(__dirname, "sample", "cpc.xml")).toString(),
    });
    monitorThree
      .getReport("CPC", { resource: ",RPRT,MVS_IMAGE" })
      .then((result) =>
        expect(result).toEqual(
          JSON.parse(
            readFileSync(path.join(__dirname, "sample", "cpc.json")).toString()
          )
        )
      );
  });
});
