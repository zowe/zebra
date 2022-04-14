import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import RmfDdsError from "../errors/RmfDdsError";
import RmfRequestError from "../errors/RmfRequestError";
import { RmfOptions, RmfRequestParams } from "./types";
import { checkForError } from "./util";

export default abstract class RmfParser {
  /**
   * The address (URL or IP) of the RMF Distributed Data Server.
   */
  public dds: string;

  /**
   * Additional options for the parser.
   */
  public options: RmfOptions;

  constructor(dds: string, options: RmfOptions) {
    this.dds = dds;
    this.options = options;
  }

  /**
   * Retrieves and parses the given RMF report from the RMF DDS into ZEBRA format.
   * @param params Additional parameters for the request to the RMF DDS.
   * @returns Parsed RMF report in ZEBRA format.
   */
  public abstract getReport(
    report: string,
    params: RmfRequestParams
  ): Promise<object>;

  /**
   * Builds the RMF Distributed Data Server request endpoint, including any additional parameters.
   * @param report Name of the RMF report to request.
   * @param params Additional request parameters to be made to the RMF Distributed Data Server.
   */
  public abstract buildRequestEndpoint(
    report: string,
    params?: RmfRequestParams
  ): string;

  /**
   * Makes request to RMF Distribited Data Server to retrieve RMF data in XML string format.
   * @param report Name of the RMF report to request.
   * @param params Additional request parameters to be made to the RMF Distributed Data Server.
   * @throws {RmfDdsError} Thrown if a RMF Distributed Data Server error is detected in the response.
   * @throws {RmfRequestError} Thrown if there is a problem making the request to the DDS.
   * @returns RMF data in XML string format.
   */
  public async ddsRequest(
    report: string,
    params: RmfRequestParams
  ): Promise<string> {
    // Get DDS enpdoint for given request, including report name and additional parameters
    const ddsEndpoint = this.buildRequestEndpoint(report, params);
    // Configure request, including authentication if needed
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Accept: "application/xml",
      },
      responseType: "text",
    };
    const { username, password } = this.options;
    if (username && password) {
      requestConfig.auth = {
        username,
        password,
      };
    }
    // Make request and handle response or errors
    return axios
      .get(ddsEndpoint, requestConfig)
      .then((response: AxiosResponse) => {
        const xml: string = response.data;
        const ddsErrorMessage = checkForError(xml);
        if (ddsErrorMessage) {
          throw new RmfDdsError(ddsErrorMessage);
        }
        return xml;
      })
      .catch((error: Error | AxiosError) => {
        if (axios.isAxiosError(error) && error.response) {
          throw new RmfRequestError(
            `RMF Distributed Data Server request returned with status code ${error.response.status} - ${error.response.statusText}.`
          );
        }
        throw new RmfRequestError(
          "Something went wrong when making a request to the RMF Distributed Data Server."
        );
      });
  }
}
